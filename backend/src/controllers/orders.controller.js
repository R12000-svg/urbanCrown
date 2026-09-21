const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const service = require('../services/orders.service');

exports.create = asyncHandler(async (req, res) => {
  const { customer, shippingAddress, items, paymentMethod = 'transfer' } = req.body;
  if (!customer?.name || !customer?.email) throw new ApiError(400, 'Datos de contacto incompletos');
  if (!shippingAddress?.address || !shippingAddress?.commune || !shippingAddress?.region) {
    throw new ApiError(400, 'Dirección de despacho incompleta');
  }
  if (paymentMethod !== 'transfer') throw new ApiError(400, 'El único método de pago disponible es transferencia bancaria');
  const order = await service.createOrder({
    userId: req.user?.id || null,
    customer,
    shippingAddress,
    items,
    paymentMethod,
  });
  res.status(201).json(order);
});

exports.getById = asyncHandler(async (req, res) => {
  res.json(await service.getOrderById(req.params.id));
});

exports.myOrders = asyncHandler(async (req, res) => {
  res.json(await service.listOrdersByUser(req.user.id));
});

// --- admin ---
exports.listAll = asyncHandler(async (req, res) => {
  res.json(await service.listAllOrders({ status: req.query.status }));
});

exports.updateStatus = asyncHandler(async (req, res) => {
  res.json(await service.updateOrderStatus(req.params.id, req.body.status));
});

exports.salesSummary = asyncHandler(async (req, res) => {
  res.json(await service.getSalesSummary());
});