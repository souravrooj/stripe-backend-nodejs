const express = require('express');
const { renewSubscription, deleteSubscription, createCheckoutSession } = require('../controllers/subscriptionController');

const router = express.Router();

router.post('/', createCheckoutSession);

module.exports = router;
