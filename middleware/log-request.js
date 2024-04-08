function logRequest(req, res, next) {
    const date = new Date();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    console.log(`Time ${hours}:${minutes}:${seconds}   Req: ${req.method}/ => ${req.url}`);
    next()
}

module.exports = logRequest;