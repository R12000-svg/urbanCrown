const asyncHandler = require('../utils/asyncHandler');
const service = require('../services/auth.service');
const ApiError = require('../utils/ApiError');

exports.register = asyncHandler(async (req, res) => {
  const { email, password, fullName } = req.body;
  const data = await service.register({ email, password, fullName });
  res.status(201).json({ user: data.user, session: data.session });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const data = await service.login({ email, password });
  res.json({ user: data.user, session: data.session });
});

exports.me = asyncHandler(async (req, res) => {
  res.json(await service.getProfile(req.user.id));
});

exports.profile = asyncHandler(async (req, res) => {
  res.json(await service.getProfile(req.user.id));
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const { fullName, phone, address } = req.body;
  if (!fullName?.trim()) throw new ApiError(400, 'El nombre es obligatorio');
  res.json(await service.updateProfile(req.user.id, {
    fullName: fullName.trim(),
    phone: phone?.trim() || '',
    address: address?.trim() || '',
  }));
});