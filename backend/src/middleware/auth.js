const { supabaseAnon, supabaseAdmin } = require('../config/supabase');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// Valida el JWT de Supabase (header Authorization: Bearer <token>).
// Si no hay token, deja req.user = null (permite checkout como invitado).
const attachUser = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    req.user = null;
    return next();
  }

  const { data, error } = await supabaseAnon.auth.getUser(token);
  if (error || !data?.user) {
    req.user = null;
    return next();
  }

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id, full_name, role')
    .eq('id', data.user.id)
    .single();

  req.user = {
    id: data.user.id,
    email: data.user.email,
    role: profile?.role || 'customer',
    full_name: profile?.full_name || null,
  };

  next();
});

function requireAuth(req, res, next) {
  if (!req.user) return next(new ApiError(401, 'Debes iniciar sesión'));
  next();
}

module.exports = { attachUser, requireAuth };