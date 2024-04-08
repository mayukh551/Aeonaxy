const statusCodes = require('../config/statusConfig');

/**
 * @param {number} status - The HTTP status code
 * @param {string} message - Contains custom error messages (if provided) or default error messages
 * @param {object} err - The error object either defined built-in err instance or null | udnefined
 * @methods toString( ), toJSON( )
 * @properties status, timestamp, name, description
 * @description  Class create Error instances for Auth related errors or unwanted attempts.
 */


class AppError extends Error {
    constructor(status = null | undefined, message = '', err = null | undefined) {
        super();

        // if status provided, else 503
        this.status = status !== undefined ? status : 503;

        // if err exists, extract error stack
        this.stack = err ? err.stack : null;

        // this message is for debugging purposes
        // if default or original error exists and has a message property, 
        // then original error message will be set, else custom message
        this.serverMessage = err && err.message ? err.message : message;

        // if err.name exists, set err.name else null
        this.defaultName = err && err.name ? err.name : "";

        // setting custom/default message for user response
        this.message = message || statusCodes[status].message;
        this.description = statusCodes[status].description;

        // additional details for finding errors
        const date = new Date();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');
        this.timestamp = `${hours}:${minutes}:${seconds}`
    }

    /* 
    Override the default toString method to provide a better error message
    the message provides: timestamp, error name, statusCode, and error message
    */
    toString() {
        return `${this.name} [${this.status}]: ${this.message}`;
    }

    // toJSON method to return a JSON representation of the error
    toJSON() {

        // extras should carry extra fields to be added to the error object

        return {
            name: this.name,
            status: this.status,
            message: this.message,
            timestamp: this.timestamp,
            defaultName: this.defaultName,
            serverMessage: this.serverMessage,
            description: this.description,
        }
    }
}

module.exports = AppError;