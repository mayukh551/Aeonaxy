const PrismaError = require('../error/PrismaError');

// try-catch wrapper function for controllers
function asyncWrap(fn) {
    return (req, res, next) => {
        fn(req, res, next)
            .catch(err => {
                if (err instanceof PrismaError) {
                    next(new PrismaError(err.status, err.message, err.err));
                } else {
                    next(err);
                }
            })
    }
}

module.exports = asyncWrap;