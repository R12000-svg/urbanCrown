const asyncHandler = require('../utils/asyncHandler');
const service = require('../services/categories.service');

exports.list = asyncHandler(async (req, res) => {
  const onlyActive = req.query.all !== 'true'; // admin puede pedir ?all=true
  res.json(await service.listCategories({ onlyActive }));
});

exports.getBySlug = asyncHandler(async (req, res) => {
  res.json(await service.getCategoryBySlug(req.params.slug));
});

exports.create = asyncHandler(async (req, res) => {
  res.status(201).json(await service.createCategory(req.body));
});

exports.update = asyncHandler(async (req, res) => {
  res.json(await service.updateCategory(req.params.id, req.body));
});

exports.remove = asyncHandler(async (req, res) => {
  res.json(await service.deleteCategory(req.params.id));
});