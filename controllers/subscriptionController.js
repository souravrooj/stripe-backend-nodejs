const Subscription = require('../models/Subscription');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.createSubscription = async (req, res) => {
    const { userId, planId } = req.body;

    try {
        const customer = await stripe.customers.create({
            email: req.body.email,
        });

        const subscription = await stripe.subscriptions.create({
            customer: customer.id,
            items: [{ plan: planId }],
        });

        const newSubscription = new Subscription({
            userId,
            stripeSubscriptionId: subscription.id,
            status: subscription.status
        });

        await newSubscription.save();
        res.status(201).json(newSubscription);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.renewSubscription = async (req, res) => {
    // Logic to renew a subscription (similar to create)
};

exports.deleteSubscription = async (req, res) => {
    // Logic to delete a subscription
};
