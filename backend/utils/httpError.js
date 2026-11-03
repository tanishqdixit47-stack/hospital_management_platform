// Creates an Error that carries an HTTP status code for the error middleware.
module.exports = (statusCode, message) => Object.assign(new Error(message), { statusCode });
