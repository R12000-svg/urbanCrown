const asyncHandler = require('../utils/asyncHandler');
const service = require('../services/products.service');

exports.list = asyncHandler(async (req, res) => {
  const { search, category, sort, page = 1, limit = 24, all } = req.query;
  const offset = (Number(page) - 1) * Number(limit);
  const result = await service.listProducts({
    search, categorySlug: category, sort,
    onlyActive: all !== 'true',
    limit: Number(limit), offset,
  });
  res.json(result);
});

exports.featured = asyncHandler(async (req, res) => {
  res.json(await service.getFeaturedProducts(Number(req.query.limit) || 8));
});

exports.getBySlug = asyncHandler(async (req, res) => {
  res.json(await service.getProductBySlug(req.params.slug));
});

exports.lowStock = asyncHandler(async (req, res) => {
  res.json(await service.listLowStock(Number(req.query.threshold) || 5));
});

exports.create = asyncHandler(async (req, res) => {
  res.status(201).json(await service.createProduct(req.body));
});

exports.update = asyncHandler(async (req, res) => {
  res.json(await service.updateProduct(req.params.id, req.body));
});

exports.remove = asyncHandler(async (req, res) => {
  res.json(await service.deleteProduct(req.params.id));
});