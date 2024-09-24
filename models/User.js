const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: false },
    name: { type: String },
    stripeCustomerId: { type: String, unique: true }, // To store Stripe customer ID
    createdAt: { type: Date, default: Date.now }, // Optional: Track user creation date
    updatedAt: { type: Date, default: Date.now }, // Optional: Track user updates,
    status: { type: String, required: false }
});

// Middleware to update `updatedAt` field automatically
UserSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('User', UserSchema);
