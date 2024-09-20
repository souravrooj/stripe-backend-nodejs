const express = require('express');
const bodyParser = require('body-parser');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const planRoutes = require('./routes/planRoutes');

const app = express();

app.use(bodyParser.json());

// Use routes
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/plans', planRoutes);

module.exports = app;
