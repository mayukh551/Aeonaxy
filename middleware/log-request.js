function logRequest(req, res, next) {
    const date = new Date();
    const options = { timeZone: 'Asia/Kolkata', hour12: false };
    const time = date.toLocaleString('en-IN', options);
    console.log(`Time ${time}   Req: ${req.method}/ => ${req.url}`);
    next();
}

module.exports = logRequest;
