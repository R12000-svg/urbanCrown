const asyncHandler = require('../utils/asyncHandler');
const service = require('../services/settings.service');

exports.getPayment = asyncHandler(async (req, res) => {
  res.json(await service.getPaymentSettings());
});

exports.updatePayment = asyncHandler(async (req, res) => {
  res.json(await service.updatePaymentSettings(req.body));
});
