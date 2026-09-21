const { supabaseAnon, supabaseAdmin } = require('../config/supabase');
const ApiError = require('../utils/ApiError');

async function register({ email, password, fullName }) {
  const { data, error } = await supabaseAnon.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });
  if (error) throw new ApiError(400, error.message);
  return data; // data.session puede venir null si Supabase exige confirmar email
}

async function login({ email, password }) {
  const { data, error } = await supabaseAnon.auth.signInWithPassword({ email, password });
  if (error) throw new ApiError(401, 'Email o contraseña incorrectos');
  return data; // data.session.access_token es el token que usará el frontend
}

async function getProfile(userId) {
  const { data, error } = await supabaseAdmin.from('profiles').select('*').eq('id', userId).single();
  if (error) throw new ApiError(404, 'Perfil no encontrado');
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.getUserById(userId);
  if (authError) throw new ApiError(500, 'No se pudo cargar el perfil');
  return {
    ...data,
    email: authData.user?.email || null,
    address: authData.user?.user_metadata?.address || '',
  };
}

async function updateProfile(userId, { fullName, phone, address }) {
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .update({ full_name: fullName, phone })
    .eq('id', userId)
    .select()
    .single();
  if (profileError) throw new ApiError(400, 'No se pudo actualizar el perfil', profileError.message);

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.getUserById(userId);
  if (authError) throw new ApiError(500, 'No se pudo cargar el perfil');

  const { error: metadataError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    user_metadata: {
      ...(authData.user?.user_metadata || {}),
      full_name: fullName,
      address,
    },
  });
  if (metadataError) throw new ApiError(400, 'No se pudo actualizar la dirección', metadataError.message);

  return { ...profile, email: authData.user?.email || null, address: address || '' };
}

module.exports = { register, login, getProfile, updateProfile };