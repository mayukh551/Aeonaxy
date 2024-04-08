const {
    PrismaClientValidationError,
    PrismaClientKnownRequestError,
    PrismaClientInitializationError,
    PrismaClientUnknownRequestError } = require("@prisma/client/runtime/library");

const AppError = require("./AppError");

class PrismaError extends AppError {
    constructor(status, message, err) {
        super(status, message, err);
        this.name = this.constructor.name;

        if (err instanceof PrismaClientValidationError)
            this.status = 400;

        if (err instanceof PrismaClientKnownRequestError) {
            this.code = err.code;
            this.field = err.meta ? err.meta.target : null;
        }

        this.serverMessage = err.message;

        if (err instanceof PrismaClientInitializationError) {
            this.code = err.errorCode;
            this.status = 500;
            this.serverMessage = [
                'The provided credentials for the database are invalid',
                'There is no database server running under the provided hostname and port',
                'The port that the query engine HTTP server wants to bind to is already taken',
                'A missing or inaccessible environment variable'
            ]
        }

    }
}


module.exports = PrismaError;