const Answer = require('../models/Answer');
const Question = require('../models/Question');
const { verifyAnswerWithAI } = require('../services/ai.service');

const getAnswersForQuestion = async (req, res) => {
  try {
    const answers = await Answer.find({ questionId: req.params.questionId })
      .populate('author', 'name role department')
      .sort({ isPinned: -1, isAccepted: -1, upvotes: -1 });
    res.json(answers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const postAnswer = async (req, res) => {
  try {
    const { content, questionId } = req.body;
    
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const answer = await Answer.create({
      content,
      questionId,
      author: req.user._id,
      isOfficial: req.user.role === 'admin' || req.user.role === 'hr',
    });

    const populatedAnswer = await answer.populate('author', 'name role department');

    const reqIo = req.app.get('io');
    if (reqIo) {
      reqIo.to(`question_${questionId}`).emit('newAnswer', populatedAnswer);
    }
    
    res.status(201).json(populatedAnswer);

    // Run AI verification in background
    verifyAnswerWithAI(question.content, content).then(async (aiFeedback) => {
      answer.aiFeedback = aiFeedback;
      await answer.save();
      if (reqIo) {
        reqIo.to(`question_${questionId}`).emit('answerAIUpdated', {
          answerId: answer._id,
          aiFeedback
        });
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const voteAnswer = async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.body; // 'upvote' or 'downvote'
    
    const answer = await Answer.findById(id);
    if (!answer) return res.status(404).json({ message: 'Answer not found' });

    if (type === 'upvote') answer.upvotes += 1;
    else if (type === 'downvote') answer.downvotes += 1;

    await answer.save();
    
    const reqIo = req.app.get('io');
    if (reqIo) {
      reqIo.to(`question_${answer.questionId}`).emit('answerVoted', {
        answerId: answer._id,
        upvotes: answer.upvotes,
        downvotes: answer.downvotes
      });
    }

    res.json(answer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const acceptAnswer = async (req, res) => {
  try {
    const { id } = req.params;
    const answer = await Answer.findById(id);
    if (!answer) return res.status(404).json({ message: 'Answer not found' });

    answer.isAccepted = true;
    await answer.save();
    
    const question = await Question.findById(answer.questionId);
    if (question) {
      question.status = 'resolved';
      await question.save();
    }

    const reqIo = req.app.get('io');
    if (reqIo) {
      reqIo.to(`question_${answer.questionId}`).emit('answerAccepted', {
        answerId: answer._id
      });
    }

    res.json(answer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const togglePin = async (req, res) => {
  try {
    const { id } = req.params;
    const answer = await Answer.findById(id);
    if (!answer) return res.status(404).json({ message: 'Answer not found' });

    answer.isPinned = !answer.isPinned;
    await answer.save();

    const reqIo = req.app.get('io');
    if (reqIo) {
      reqIo.to(`question_${answer.questionId}`).emit('answerPinned', {
        answerId: answer._id,
        isPinned: answer.isPinned
      });
    }

    res.json(answer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const toggleOfficial = async (req, res) => {
  try {
    const { id } = req.params;
    const answer = await Answer.findById(id);
    if (!answer) return res.status(404).json({ message: 'Answer not found' });

    answer.isOfficial = !answer.isOfficial;
    await answer.save();

    const reqIo = req.app.get('io');
    if (reqIo) {
      reqIo.to(`question_${answer.questionId}`).emit('answerOfficial', {
        answerId: answer._id,
        isOfficial: answer.isOfficial
      });
    }

    res.json(answer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAnswersForQuestion, postAnswer, voteAnswer, acceptAnswer, togglePin, toggleOfficial };
