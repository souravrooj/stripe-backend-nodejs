const Plan = require('../models/Plan');
const Product = require('../models/Product');
require('dotenv').config();

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
console.log(process.env.STRIPE_SECRET_KEY);
exports.createPlan = async (req, res) => {
    const { productName, planName, amount, interval } = req.body;

    try {
        // Step 1: Validate input
        if (!productName || !planName || !amount || !interval) {
            return res.status(400).json({ error: 'All fields are required.' });
        }

        // Step 2: Create a product in Stripe using productName
        let product;
        try {
            product = await stripe.products.create({
                name: productName,
            });
        } catch (error) {
            return res.status(500).json({ error: 'Failed to create product in Stripe: ' + error.message });
        }

        // Step 3: Save the product to the database
        let newProduct;
        try {
            newProduct = new Product({
                name: productName,
                stripeProductId: product.id,
            });
            await newProduct.save();
        } catch (error) {
            return res.status(500).json({ error: 'Failed to save product to database: ' + error.message });
        }

        // Step 4: Create a plan associated with that product
        let plan;
        try {
            plan = await stripe.plans.create({
                product: product.id,
                nickname: planName,
                amount,
                currency: 'usd',
                interval,
            });
        } catch (error) {
            return res.status(500).json({ error: 'Failed to create plan in Stripe: ' + error.message });
        }

        // Step 5: Save the new plan in your MongoDB
        let newPlan;
        try {
            newPlan = new Plan({
                name: planName,
                amount,
                interval,
                stripePlanId: plan.id,
                product: newProduct._id,
            });
            await newPlan.save();
        } catch (error) {
            return res.status(500).json({ error: 'Failed to save plan to database: ' + error.message });
        }

        // Step 6: Respond with the newly created plan
        res.status(201).json(newPlan);
    } catch (error) {
        console.log(error);
        // Catch any unforeseen errors
        res.status(500).json({ error: 'An unexpected error occurred: ' + error.message });
    }
};


// Fetch all plans
exports.getPlans = async (req, res) => {
    try {
        const plans = await Plan.find().populate('product'); // Populate product if needed
        res.status(200).json(plans);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An unexpected error occurred: ' + error.message });
    }
};