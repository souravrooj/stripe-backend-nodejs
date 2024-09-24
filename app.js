const express = require('express');
const cors = require('cors');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const planRoutes = require('./routes/planRoutes');
const webhookRouter = require('./routes/webhook');
const userRoutes = require('./routes/userRoutes');

const app = express();

// Use CORS middleware
app.use(cors());

// Use the webhook route before applying express.json()
app.use('/api/webhook', webhookRouter);

// Apply express.json() after the webhook route
app.use(express.json());

// Other middleware and routes...
app.use('/api/checkout-session', subscriptionRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/user', userRoutes);

module.exports = app;
