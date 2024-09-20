const express = require('express');
const { createPlan, getPlans } = require('../controllers/planController');

const router = express.Router();

router.post('/', createPlan);
router.get('/', getPlans);
// Add routes for modifying and deleting plans

module.exports = router;
