const express = require('express');
const { renewSubscription, deleteSubscription, createCheckoutSession, checkSubscriptionStatus } = require('../controllers/subscriptionController');

const router = express.Router();

router.post('/', createCheckoutSession);
router.get('/status/:userId', checkSubscriptionStatus);

module.exports = router;
