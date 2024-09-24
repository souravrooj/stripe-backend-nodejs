// controllers/subscriptionControlelrr.js
const Plan = require('../models/Plan');
const Subscription = require('../models/Subscription');
const User = require('../models/User');
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.createCheckoutSession = async (req, res) => {
    const { planId, customerEmail, customerName } = req.body; // Get necessary fields

    try {
        const plan = await Plan.findOne({ stripePlanId: planId });
        if (!plan) {
            return res.status(404).json({ error: 'Plan not found' });
        }

        // Check if user already exists
        let user = await User.findOne({ email: customerEmail });
        if (!user) {
            // If user doesn't exist, create a new user
            user = new User({
                email: customerEmail,
                name: customerName, // Optional: Use the customer's name if provided
                stripeCustomerId: null // We'll set this later after creating the Stripe customer
            });
            await user.save();
        }

        // Create a Stripe customer if not already created
        if (!user.stripeCustomerId) {
            const customer = await stripe.customers.create({
                email: customerEmail,
                name: customerName, // Include name if available
            });
            user.stripeCustomerId = customer.id;
            user.status = 'active';
            await user.save(); // Update user with Stripe customer ID
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
            customer: user.stripeCustomerId, // Use the Stripe customer ID
            billing_address_collection: 'required', // Collect billing address
        });

        // Save the subscription record in the database
        const subscription = new Subscription({
            stripeSubscriptionId: session.id,
            customerId: user.stripeCustomerId,
            userId: user._id,
            status: 'active', // Initial status; it will be updated via webhooks
            plan: planId,
        });
        await subscription.save();

        // Respond with the session ID
        res.status(200).json({ id: session.id });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).json({ error: 'An unexpected error occurred: ' + error.message });
    }
};


// API endpoint to check subscription status
exports.checkSubscriptionStatus = async (req, res) => {
    const { userId } = req.params;

    try {
        const subscription = await Subscription.findOne({ userId: userId });

        if (!subscription) {
            return res.status(404).json({ message: 'No subscription found for this user.' });
        }

        res.status(200).json({
            subscriptionId: subscription.stripeSubscriptionId,
            status: subscription.status,
            plan: subscription.plan,
            createdAt: subscription.createdAt,
            updatedAt: subscription.updatedAt,
        });
    } catch (error) {
        console.error('Error fetching subscription status:', error);
        res.status(500).json({ error: 'An error occurred while fetching subscription status.' });
    }
}