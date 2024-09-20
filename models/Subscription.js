const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
    stripeSubscriptionId: { type: String, required: true },
    customerId: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to User model
    status: {
        type: String,
        enum: ['active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'trialing', 'unpaid'],
        required: true
    },
    plan: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Subscription', SubscriptionSchema);
