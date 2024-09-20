// controllers/subscriptionControlelrr.js
const Plan = require('../models/Plan');
const Subscription = require('../models/Subscription');
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.createCheckoutSession = async (req, res) => {
    const { planId, customerEmail } = req.body; // Make sure to get the necessary fields
    console.log(planId);

    try {
        const plan = await Plan.findOne({ stripePlanId: planId });
        if (!plan) {
            return res.status(404).json({ error: 'Plan not found' });
        }

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
            customer_email: customerEmail, // Pass customer email to the session
            billing_address_collection: 'required', // Collect billing address
        });

        res.status(200).json({ id: session.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An unexpected error occurred: ' + error.message });
    }
};
