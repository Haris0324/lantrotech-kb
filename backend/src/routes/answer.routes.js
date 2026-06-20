const express = require('express');
const router = express.Router();
const { getAnswersForQuestion, postAnswer, voteAnswer, acceptAnswer } = require('../controllers/answer.controller');
const { protect, adminOrHR } = require('../middleware/auth.middleware');

router.get('/:questionId', getAnswersForQuestion);
router.post('/', protect, postAnswer);
router.put('/:id/vote', protect, voteAnswer);
router.put('/:id/accept', protect, adminOrHR, acceptAnswer);

module.exports = router;
