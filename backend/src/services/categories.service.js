const { supabaseAdmin } = require('../config/supabase');
const { toSlug } = require('../utils/slugify');
const ApiError = require('../utils/ApiError');

async function listCategories({ onlyActive = true } = {}) {
  let query = supabaseAdmin.from('categories').select('*').order('name');
  if (onlyActive) query = query.eq('active', true);
  const { data, error } = await query;
  if (error) throw new ApiError(500, 'Error al listar categorías', error.message);
  return data;
}

async function getCategoryBySlug(slug) {
  const { data, error } = await supabaseAdmin.from('categories').select('*').eq('slug', slug).single();
  if (error) throw new ApiError(404, 'Categoría no encontrada');
  return data;
}

async function createCategory(payload) {
  const slug = payload.slug ? toSlug(payload.slug) : toSlug(payload.name);
  const { data, error } = await supabaseAdmin.from('categories').insert([{ ...payload, slug }]).select().single();
  if (error) throw new ApiError(400, 'Error al crear categoría', error.message);
  return data;
}

async function updateCategory(id, payload) {
  const updates = { ...payload };
  if (updates.name && !updates.slug) updates.slug = toSlug(updates.name);
  const { data, error } = await supabaseAdmin.from('categories').update(updates).eq('id', id).select().single();
  if (error) throw new ApiError(400, 'Error al actualizar categoría', error.message);
  return data;
}

async function deleteCategory(id) {
  const { error } = await supabaseAdmin.from('categories').delete().eq('id', id);
  if (error) throw new ApiError(400, 'Error al eliminar categoría', error.message);
  return { success: true };
}

module.exports = { listCategories, getCategoryBySlug, createCategory, updateCategory, deleteCategory };