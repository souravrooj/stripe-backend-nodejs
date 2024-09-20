const Plan = require('../models/Plan');
const Subscription = require('../models/Subscription');
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// controllers/subscriptionControlelrr.js
exports.createCheckoutSession = async (req, res) => {
    const { planId } = req.body;
    console.log(planId);

    try {
        const plan = await Plan.findOne({ stripePlanId : planId});
        if (!plan) {
            return res.status(404).json({ error: 'Plan not found' });
        }
console.log(plan);
        // Create a checkout session with Stripe
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price: plan.stripePlanId, // Use the Stripe price ID here
                quantity: 1,
            }],
            mode: 'subscription',
            success_url: `${process.env.FRONTEND_URL}/success`,
            cancel_url: `${process.env.FRONTEND_URL}/cancel`,
        });

        res.status(200).json({ id: session.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An unexpected error occurred: ' + error.message });
    }
};

exports.renewSubscription = async (req, res) => {
    // Logic to renew a subscription (similar to create)
};

exports.deleteSubscription = async (req, res) => {
    // Logic to delete a subscription
};
