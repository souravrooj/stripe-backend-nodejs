const express = require('express');
const { createSubscription, renewSubscription, deleteSubscription } = require('../controllers/subscriptionController');

const router = express.Router();

router.post('/', createSubscription);
router.post('/renew', renewSubscription);
router.delete('/:id', deleteSubscription);

module.exports = router;
