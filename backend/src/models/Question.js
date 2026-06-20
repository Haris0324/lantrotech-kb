const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tags: [{ type: String }],
  views: { type: Number, default: 0 },
  status: { type: String, enum: ['open', 'resolved'], default: 'open' },
}, { timestamps: true });

module.exports = mongoose.model('Question', QuestionSchema);
