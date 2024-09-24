const express = require('express');
const Stripe = require('stripe');
const { log } = require('console');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
require('dotenv').config(); // Ensure environment variables are loaded

const stripe = Stripe(process.env.STRIPE_SECRET_KEY); // Set your Stripe secret key

const router = express.Router();

// Middleware to capture the raw body
const rawBodyMiddleware = (req, res, buf, encoding) => {
    if (req.headers['stripe-signature']) {
        req.rawBody = buf.toString(encoding || 'utf8');
    }
};

// Route handler for the Stripe webhook
router.post('/', express.raw({ type: 'application/json', verify: rawBodyMiddleware }), async (req, res) => {
    log('Stripe Webhook Event Fired!');
    const sigHeader = req.headers['stripe-signature'];

    // Check if rawBody is undefined
    if (!req.rawBody) {
        log('Error: req.rawBody is undefined. Ensure rawBodyMiddleware is working correctly.');
        return res.status(400).send('Webhook Error: No webhook payload was provided.');
    }

    try {
        // Construct the event using the raw body and the Stripe signature header
        const event = stripe.webhooks.constructEvent(
            req.rawBody, // Use the raw body here
            sigHeader,
            process.env.STRIPE_WEBHOOK_SECRET // Set your webhook secret
        );

        const webhookType = event.type; // Corrected to use event.type
        const webhookData = event.data.object;
        log(`Webhook Type: ${webhookType}`);

        // Handle different event types
        switch (webhookType) {
            case 'customer.subscription.created':
                await processWebhookTypeSubscriptionCreated(webhookData);
                break;
            case 'customer.subscription.updated':
                await processWebhookTypeSubscriptionUpdated(webhookData);
                break;
            case 'customer.subscription.deleted':
                await processWebhookTypeSubscriptionDeleted(webhookData);
                break;
            case 'payment_intent.succeeded':
                await processWebhookTypePaymentIntent(webhookData);
                break;
            case 'subscription_schedule.canceled':
                await processWebhookTypeSubscriptionSchedule(webhookData);
                break;
            case 'invoice.payment_succeeded':
                await processWebhookTypeInvoice(webhookData);
                break;
            case 'checkout.session.completed':
                await processWebhookTypeCheckoutSession(webhookData);
                break;
            default:
                log(`Unhandled webhook type: ${webhookType}`);
                break;
        }
        res.status(200).send('Webhook received');
    } catch (err) {
        log(`Error processing webhook: ${err.message}`, {
            rawBody: req.rawBody,
            sigHeader,
            webhookSecret: process.env.STRIPE_WEBHOOK_SECRET
        });
        res.status(400).send(`Webhook Error: ${err.message}`);
    }
});

// Define your processing functions here
async function processWebhookTypeSubscriptionCreated(webhookData) {
    log(`Processing subscription created: ${webhookData.id}`);

    const { id: stripeSubscriptionId, customer: customerId, plan, status } = webhookData;

    try {
        // Find the user based on the Stripe customer ID
        const user = await User.findOne({ stripeCustomerId: customerId });
        if (!user) {
            log(`User not found for customer ID: ${customerId}`);
            return;
        }

        // Create a new subscription in the database
        const newSubscription = new Subscription({
            stripeSubscriptionId,
            customerId,
            userId: user._id,
            status,
            plan,
        });

        await newSubscription.save();
        log(`Subscription created in database: ${newSubscription.id}`);
    } catch (error) {
        log(`Error creating subscription: ${error.message}`);
    }
}

async function processWebhookTypeSubscriptionUpdated(webhookData) {
    log(`Processing subscription updated: ${webhookData.id}`);

    const { id: stripeSubscriptionId, status } = webhookData;

    try {
        // Update the subscription status in the database
        const subscription = await Subscription.findOneAndUpdate(
            { stripeSubscriptionId },
            { status },
            { new: true } // Return the updated document
        );

        if (!subscription) {
            log(`Subscription not found for ID: ${stripeSubscriptionId}`);
        } else {
            log(`Subscription updated: ${subscription.id}, new status: ${status}`);
        }
    } catch (error) {
        log(`Error updating subscription: ${error.message}`);
    }
}

async function processWebhookTypeSubscriptionDeleted(webhookData) {
    log(`Processing subscription deleted: ${webhookData.id}`);
    console.log(webhookData.customer);
    const { id: stripeSubscriptionId, customer: customerId } = webhookData;

    try {
        // Remove the subscription from the database
        const result = await Subscription.deleteOne({ customerId: webhookData.customer});

        if (result.deletedCount === 0) {
            log(`No subscription found for ID: ${stripeSubscriptionId}`);
        } else {
            log(`Subscription deleted: ${stripeSubscriptionId}`);

            // Update user information
            const user = await User.findOne({ stripeCustomerId: customerId });
            console.log(user);
            if (user) {
                User.status = 'canceled'; // Update the status to 'canceled' or other as needed
                await user.save();
                log(`User updated with canceled subscription status.`);
            } else {
                log(`User not found for customer ID: ${customerId}`);
            }
        }
    } catch (error) {
        log(`Error deleting subscription: ${error.message}`);
    }
}

async function processWebhookTypePaymentIntent(webhookData) {
    log(`Processing payment intent: ${webhookData.id}`);
    // Implement your logic for payment intents
}

async function processWebhookTypeSubscriptionSchedule(webhookData) {
    log(`Processing subscription schedule: ${webhookData.id}`);
    // Implement your logic for subscription schedules
}

async function processWebhookTypeInvoice(webhookData) {
    log(`Processing invoice: ${webhookData.id}`);
    // Implement your logic for invoices
}

async function processWebhookTypeCheckoutSession(webhookData) {
    log(`Processing checkout session: ${webhookData.id}`);
    // Implement your logic for checkout sessions
}

module.exports = router;
