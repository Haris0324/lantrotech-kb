const mongoose = require('mongoose');

const TagSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  isOfficial: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Tag', TagSchema);
