const asyncWrap = require('./async-wrapper');
const { blockDuration, limiter, maxAttemptsByIP, timeWindow } = require('../config/rateLimiterConfig');

/**
 * A middleware function that limits the rate of incoming requests based on the
 * IP address of the requester using a rate limiter. If the rate limit is exceeded,
 * the function blocks the request and responds with a 429 status code and a message
 * that indicates when the requester should retry the request.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function in the stack.
 * @return {void}
 */

const rateLimiter = asyncWrap(async (req, res, next) => {

    // rate limiter
    limiter.consume(req.ip, 1) // consumes 1 point by default

        // if no. of requests are within the limit set by maxAttemptsByIP
        .then((RateLimiterRes) => {
            console.log('Rate limiter: request allowed');
            next();
        })

        // if no. of requests exceed the limit set by maxAttemptsByIP
        .catch((RateLimiterRes) => {
            console.log('Rate limiter: request blocked');

            if (RateLimiterRes.consumedPoints > maxAttemptsByIP) {
                // retry after blockDuration
                res.set('Retry-After', blockDuration);
                res.set("X-RateLimit-Limit", maxAttemptsByIP);
                res.set("X-RateLimit-Remaining", RateLimiterRes.remainingPoints);
            }

            res.status(429).json({ msg: `Too Many Requests. Retry After ${blockDuration}s` });
        });

})

module.exports = rateLimiter;