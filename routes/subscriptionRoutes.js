const express = require('express');
const { renewSubscription, deleteSubscription, createCheckoutSession } = require('../controllers/subscriptionController');

const router = express.Router();

router.post('/', createCheckoutSession);
router.post('/renew', renewSubscription);
router.delete('/:id', deleteSubscription);

module.exports = router;
