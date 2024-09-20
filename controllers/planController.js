const Plan = require('../models/Plan');

exports.createPlan = async (req, res) => {
    const { name, amount, interval } = req.body;

    try {
        const plan = await stripe.plans.create({
            product: { name },
            amount,
            currency: 'usd',
            interval,
        });

        const newPlan = new Plan({
            name,
            amount,
            interval,
            stripePlanId: plan.id
        });

        await newPlan.save();
        res.status(201).json(newPlan);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Add functions for modify and delete plans
