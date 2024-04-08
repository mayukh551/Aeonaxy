const AppError = require('./AppError');

class UserError extends AppError {
    constructor(status, message, err) {
        super(status, message, err);
        this.name = this.constructor.name;
    }
}

module.exports = UserError;