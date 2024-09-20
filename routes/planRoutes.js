const express = require('express');
const { createPlan } = require('../controllers/planController');

const router = express.Router();

router.post('/', createPlan);
// Add routes for modifying and deleting plans

module.exports = router;
