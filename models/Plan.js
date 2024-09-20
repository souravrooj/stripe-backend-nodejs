const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    interval: {
        type: String,
        required: true,
    },
    stripePlanId: {
        type: String,
        required: true,
        unique: true,
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product', // Reference to the Product model
    },
});

const Plan = mongoose.model('Plan', planSchema);
module.exports = Plan;
