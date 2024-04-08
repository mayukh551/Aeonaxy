const AppError = require("../error/AppError");

class ValidationError extends AppError {
    constructor(status, message, err) {
        super(status, message, err);
        this.name = this.constructor.name;
    }
}


module.exports = ValidationError;