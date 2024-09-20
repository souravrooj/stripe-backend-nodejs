require('dotenv').config()
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

exports.getUserSubscription = async (req, res) => {
    const email = req.params.email;

    try {
        const users = await stripe.customers.list({
            email: email,
            limit: 1,
        });

        if (users.data.length === 0) {
            return res.status(404).json({ message: 'No user found with that email.' });
        }

        const customerId = users.data[0].id;

        // Fetch subscriptions for the found customer
        const subscriptions = await stripe.subscriptions.list({
            customer: customerId,
        });

        // Create a billing portal session
        const portalSession = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: `${process.env.FRONTEND_URL}/`, // Adjust the return URL as needed
        });

        res.status(200).json({
            subscriptions: subscriptions.data,
            portalUrl: portalSession.url, // Return the portal URL
        });
    } catch (error) {
        console.error('Error fetching subscriptions:', error);
        res.status(500).json({ error: error.message });
    }
};
