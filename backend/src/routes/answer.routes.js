const express = require('express');
const router = express.Router();
const { getAnswersForQuestion, postAnswer, voteAnswer, acceptAnswer, togglePin, toggleOfficial } = require('../controllers/answer.controller');
const { protect, adminOrHR } = require('../middleware/auth.middleware');

router.get('/:questionId', getAnswersForQuestion);
router.post('/', protect, postAnswer);
router.put('/:id/vote', protect, voteAnswer);
router.put('/:id/accept', protect, adminOrHR, acceptAnswer);
router.put('/:id/pin', protect, adminOrHR, togglePin);
router.put('/:id/official', protect, adminOrHR, toggleOfficial);

module.exports = router;
