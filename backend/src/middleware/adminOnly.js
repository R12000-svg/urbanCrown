const ApiError = require('../utils/ApiError');

function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return next(new ApiError(403, 'Acceso restringido a administradores'));
  }
  next();
}

module.exports = adminOnly;