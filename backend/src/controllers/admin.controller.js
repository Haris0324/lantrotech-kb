const Question = require('../models/Question');
const Answer = require('../models/Answer');
const Tag = require('../models/Tag');
const { generateInsights } = require('../services/ai.service');

const getInsights = async (req, res) => {
  try {
    // Get questions from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentQuestions = await Question.find({ createdAt: { $gte: thirtyDaysAgo } }).populate('author', 'name');
    const unresolvedQuestions = recentQuestions.filter(q => q.status === 'open');
    
    // Active contributors (authors of questions or answers)
    const recentAnswers = await Answer.find({ createdAt: { $gte: thirtyDaysAgo } });
    const contributorIds = new Set([
      ...recentQuestions.map(q => q.author?._id?.toString()),
      ...recentAnswers.map(a => a.author?.toString())
    ]);
    const activeContributorsCount = Array.from(contributorIds).filter(Boolean).length;

    // Frequent questions
    const frequentQuestions = await Question.find()
      .sort({ views: -1 })
      .limit(5)
      .select('title views status createdAt');

    // Recent unresolved
    const unresolvedQuestionsList = await Question.find({ status: 'open' })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title views status createdAt');

    // Generate AI insights based on these questions
    const insights = await generateInsights(recentQuestions);
    
    res.json({
      totalQuestions: recentQuestions.length,
      unresolvedCount: unresolvedQuestions.length,
      activeContributors: activeContributorsCount,
      frequentQuestions,
      unresolvedQuestionsList,
      insights,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTags = async (req, res) => {
  try {
    const tags = await Tag.find().sort({ name: 1 });
    res.json(tags);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createTag = async (req, res) => {
  try {
    const tag = await Tag.create(req.body);
    res.status(201).json(tag);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateTag = async (req, res) => {
  try {
    const tag = await Tag.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(tag);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteTag = async (req, res) => {
  try {
    await Tag.findByIdAndDelete(req.params.id);
    res.json({ message: 'Tag deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getInsights, getTags, createTag, updateTag, deleteTag };
