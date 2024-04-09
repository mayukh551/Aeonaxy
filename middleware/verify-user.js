const jwt = require('jsonwebtoken');
const AuthError = require('../error/AuthError');
const dotenv = require("dotenv").config({ path: '../.env' });

const verifyUser = (req, res, next) => {

    const apiEndpoint = req.originalUrl;
    const privateKey = process.env.PRIVATE_KEY;
    try {
        const token = req.headers['x-access-token'];
        if (!token)
            throw new AuthError(401, 'Unauthorized Attempt!', apiEndpoint);
        var decoded = jwt.verify(token, privateKey);
        if (decoded) {
            req['user-id'] = decoded.id;
            next();
        } else {
            throw new AuthError(401, 'Unauthorized Attempt!', apiEndpoint);
        }


    } catch (error) {

        if (error instanceof jwt.TokenExpiredError) return next(new AuthError(401, 'Token Expired!', apiEndpoint));

        next(error);
    }
}

module.exports = verifyUser;