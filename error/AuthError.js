const AppError = require("../error/AppError");

class AuthError extends AppError {
    constructor(status, message, err) {
        super(status, message, err);
        this.name = this.constructor.name;
    }
}

module.exports = AuthError;