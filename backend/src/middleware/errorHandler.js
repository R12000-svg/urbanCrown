const ApiError = require('../utils/ApiError');

function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ error: err.message, details: err.details });
  }
  console.error('[unhandled error]', err);
  return res.status(500).json({ error: 'Error interno del servidor' });
}

function notFoundHandler(req, res) {
  res.status(404).json({ error: 'Ruta no encontrada' });
}

module.exports = { errorHandler, notFoundHandler };