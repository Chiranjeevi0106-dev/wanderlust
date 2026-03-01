class ExpressError extends Error {
    constructor(statusCode, message) {
        super(message);          // pass message to base Error
        this.statusCode = statusCode;

        // optional but recommended
        this.name = "ExpressError";
    }
}

module.exports = ExpressError;
