const mongoose = require('mongoose');

const AnswerSchema = new mongoose.Schema({
  content: { type: String, required: true },
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  upvotes: { type: Number, default: 0 },
  downvotes: { type: Number, default: 0 },
  isAccepted: { type: Boolean, default: false },
  isOfficial: { type: Boolean, default: false },
  isPinned: { type: Boolean, default: false },
  aiFeedback: {
    status: { type: String, enum: ['pending', 'verified', 'flagged', 'corrected'], default: 'pending' },
    suggestion: { type: String },
  }
}, { timestamps: true });

module.exports = mongoose.model('Answer', AnswerSchema);
