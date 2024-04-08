const AppError = require('./AppError');

class CourseError extends AppError {
    constructor(status, message, err) {
        super(status, message, err);
        this.name = this.constructor.name;
    }
}

module.exports = CourseError;