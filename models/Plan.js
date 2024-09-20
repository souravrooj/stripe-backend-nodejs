const mongoose = require('mongoose');

const PlanSchema = new mongoose.Schema({
    name: { type: String, required: true },
    amount: { type: Number, required: true },
    interval: { type: String, enum: ['day', 'week', 'month', 'year'], required: true },
    stripePlanId: { type: String }
});

module.exports = mongoose.model('Plan', PlanSchema);
