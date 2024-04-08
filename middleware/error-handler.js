const AppError = require('../error/AppError');

const dotenv = require('dotenv').config({ path: '../.env' });

/**
 * @function errorHandler
 * @param {Object} err The Error Object
 * @param {Object} req The HTTP Request Object
 * @param {Object} res The HTTP Request Object
 * @param {Function} next The next function to move to next middleware if any
 */
const errorHandler = (err, req, res, next) => {

    // extracting the status code
    const status = parseInt(err.status) === NaN ? 500 : err.status;

    // checking if the error is known or unknown
    const hasKnownError = err instanceof AppError;

    // for unknown errors, set the error to 500
    if (!hasKnownError) {
        err = new AppError(500, "Internal Server Error", err);
    }

    // if the error is known, then it is already handled

    //* ---------------------------------- For Testing & Development Stage ----------------------------------

    // extracting the apiEndpoint
    const apiEndpoint = req.method + ' ' + req.originalUrl;


    // check the environment and send the response accordingly
    if (["test", "development"].includes(process.env.NODE_ENV)) {

        console.log('');

        console.log(`${err.name || err.defaultName} Occured at ${apiEndpoint}`)

        if (process.env.NODE_ENV === 'test')
            console.log(`Error Default Message: ${err.serverMessage}`);

        if (process.env.NODE_ENV === 'development') {
            console.log(err);
        }

        console.log('');

        res.status(status).json({ error: err, message: err.serverMessage });
    }


    //* ---------------------------------- For Production Stage ----------------------------------

    else {
        // sending the response
        res.status(status).json({ message: err.message });
    }

}

module.exports = errorHandler;