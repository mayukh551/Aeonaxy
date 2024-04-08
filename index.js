const express = require('express');
const app = express();
const cors = require('cors');

const errorHandler = require('./middleware/error-handler');
const logRequest = require('./middleware/log-request');

app.use(cors({
    origin: "*"
}));

app.use(express.json());

app.use(logRequest);

app.use('/api/user', require('./routers/user'));
app.use('/api/course', require('./routers/course'));
app.use('/api/enroll', require('./routers/enroll'));

app.use('*', (req, res) => {
    res.status(404).json({
        message: 'API Endpoint not found'
    });
});

app.use(errorHandler);

app.listen(5000, () => {
    console.log('Server is running on port 5000');
});