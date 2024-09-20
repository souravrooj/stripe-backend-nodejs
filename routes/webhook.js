// routes/webhook.js

const express = require('express');
const router = express.Router();
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Import your models (adjust the path as needed)
const Subscription = require('../models/Subscription'); // Assuming you have a Subscription model
const User = require('../models/User');

// Define the handler for subscription creation
const handleSubscriptionCreated = async (subscription) => {
    try {
        let user = await User.findOne({ stripeCustomerId: subscription.customer });

        if (!user) {
            const customer = await stripe.customers.retrieve(subscription.customer); // Retrieve the customer

            user = new User({
                stripeCustomerId: subscription.customer,
                email: customer.email, // Get email from the customer object
                name: customer.name, // Get name from the customer object
                address: customer.address, // Save the address
                // Add other relevant fields as needed
            });
            await user.save();
            console.log('User created:', user);
        }

        await Subscription.create({
            stripeSubscriptionId: subscription.id,
            customerId: subscription.customer,
            userId: user._id,
            status: subscription.status,
            plan: subscription.plan.id,
            // Add other relevant fields as needed
        });
        console.log('Subscription created and saved to database.');
    } catch (error) {
        console.error('Error saving subscription:', error);
    }
};


// Define the handler for subscription updates
const handleSubscriptionUpdated = async (subscription) => {
    try {
        // Find the subscription in your database and update it
        await Subscription.findOneAndUpdate(
            { stripeSubscriptionId: subscription.id },
            {
                status: subscription.status,
                plan: subscription.plan.id,
                // Update other relevant fields as needed
            }
        );
        console.log('Subscription updated in the database.');
    } catch (error) {
        console.error('Error updating subscription:', error);
    }
};

// Define the handler for subscription deletion
const handleSubscriptionDeleted = async (subscription) => {
    try {
        // Find the subscription in your database and delete or mark it as canceled
        await Subscription.findOneAndDelete({ stripeSubscriptionId: subscription.id });
        console.log('Subscription deleted from the database.');
    } catch (error) {
        console.error('Error deleting subscription:', error);
    }
};

// Handle incoming Stripe webhook events
router.post('/', express.json(), async (req, res) => {
    const event = req.body;

    // Verify the event type
    let eventType;
    try {
        eventType = event.type;
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Process the event based on its type
    switch (eventType) {
        case 'customer.subscription.created':
            await handleSubscriptionCreated(event.data.object);
            break;
        case 'customer.subscription.updated':
            await handleSubscriptionUpdated(event.data.object);
            break;
        case 'customer.subscription.deleted':
            await handleSubscriptionDeleted(event.data.object);
            break;
        default:
            console.warn(`Unhandled event type ${eventType}`);
    }

    // Respond to Stripe to acknowledge receipt of the event
    res.json({ received: true });
});

module.exports = router;
