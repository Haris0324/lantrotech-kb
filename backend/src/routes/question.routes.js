const express = require('express');
const router = express.Router();
const { getQuestions, getQuestionById, createQuestion } = require('../controllers/question.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/', getQuestions);
router.post('/', protect, createQuestion);
router.get('/:id', getQuestionById);

module.exports = router;
