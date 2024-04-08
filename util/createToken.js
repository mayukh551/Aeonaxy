const jwt = require('jsonwebtoken');
const dotenv = require('dotenv').config({ path: '../.env' });

function createToken(payload) {

    const token = jwt.sign(payload, process.env.PRIVATE_KEY, {
        expiresIn: '1h'
    });

    return token;

}

module.exports = createToken;