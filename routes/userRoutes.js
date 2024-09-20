const express = require('express');
const { getUserSubscription } = require('../controllers/userController');

const router = express.Router();

router.get('/:email', getUserSubscription)

module.exports = router;
