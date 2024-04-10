const { RateLimiterMemory } = require('rate-limiter-flexible');

const maxAttemptsByIP = 10; // max 10 requests per second
const blockDuration = 30; // block for 30 seconds if more than maxAttemptsByIP
const timeWindow = 1; // the max time window for 10 requests


/**
 * The user is not allowed to make more than 10 requests in 1 second.
 */

const limiter = new RateLimiterMemory({
    points: maxAttemptsByIP, // Number of points alloted
    duration: timeWindow, // time window,
    blockDuration: blockDuration, // block for 10 seconds if more than maxAttemptsByIP
});

module.exports = {
    limiter,
    maxAttemptsByIP,
    blockDuration,
    timeWindow
};