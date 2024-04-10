const express = require('express');
const app = express();
const cors = require('cors');

const errorHandler = require('./middleware/error-handler');
const logRequest = require('./middleware/log-request');
const rateLimiter = require('./middleware/rate-limiter');

app.use(cors({
    origin: "*"
}));

app.use(express.json());

// rate limiter
app.use(rateLimiter);

// logger
app.use(logRequest);

// api routes
app.use('/', (req, res) => res.send('Welcome to the e-learning platform!'));
app.use('/api/user', require('./routers/user'));
app.use('/api/course', require('./routers/course'));
app.use('/api/enroll', require('./routers/enroll'));

app.use('*', (req, res) => {
    res.status(404).json({
        message: 'API Endpoint not found'
    });
});

// error handler
app.use(errorHandler);

// start server
app.listen(5000, () => {
    console.log('Server is running on port 5000');
});