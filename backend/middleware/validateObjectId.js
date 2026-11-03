const mongoose = require('mongoose');
const httpError = require('../utils/httpError');

// Used with router.param('id', ...) so every route with /:id rejects malformed ids with 400.
module.exports = (req, res, next, id) => {
  if (!mongoose.isValidObjectId(id)) return next(httpError(400, 'Invalid id format'));
  next();
};
