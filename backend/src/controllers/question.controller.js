const Question = require('../models/Question');

const getQuestions = async (req, res) => {
  try {
    const { tag, sort } = req.query;
    let query = {};
    if (tag) {
      query.tags = { $in: [tag] };
    }

    let sortQuery = { createdAt: -1 }; // default recent
    if (sort === 'popular') {
      sortQuery = { views: -1 };
    } else if (sort === 'unresolved') {
      query.status = 'open';
      sortQuery = { createdAt: -1 };
    }

    const questions = await Question.find(query)
      .populate('author', 'name role department')
      .sort(sortQuery);

    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getQuestionById = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('author', 'name role department');
    if (question) {
      // Increment view count
      question.views += 1;
      await question.save();
      res.json(question);
    } else {
      res.status(404).json({ message: 'Question not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createQuestion = async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    const question = await Question.create({
      title,
      content,
      tags,
      author: req.user._id,
    });
    
    // Emit socket event for new question
    const reqIo = req.app.get('io');
    if (reqIo) {
      reqIo.emit('newQuestion', await question.populate('author', 'name role'));
    }

    res.status(201).json(question);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getQuestions, getQuestionById, createQuestion };
