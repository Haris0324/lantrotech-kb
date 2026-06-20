const Question = require('../models/Question');
const { generateInsights } = require('../services/ai.service');

const getInsights = async (req, res) => {
  try {
    // Get questions from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentQuestions = await Question.find({ createdAt: { $gte: thirtyDaysAgo } });
    
    // Generate AI insights based on these questions
    const insights = await generateInsights(recentQuestions);
    
    res.json({
      totalQuestions: recentQuestions.length,
      insights,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getInsights };
