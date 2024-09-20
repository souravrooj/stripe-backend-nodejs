const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const planRoutes = require('./routes/planRoutes');
const webhookRouter = require('./routes/webhook');

const app = express();

// Use CORS middleware
app.use(cors());

// Other middleware and routes...
app.use(express.json());

// Use routes
app.use('/api/checkout-session', subscriptionRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/webhook', webhookRouter);


module.exports = app;
