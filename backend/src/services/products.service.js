const { supabaseAdmin } = require('../config/supabase');
const { toSlug } = require('../utils/slugify');
const ApiError = require('../utils/ApiError');

async function listProducts({ search, categorySlug, sort, onlyActive = true, limit = 24, offset = 0 } = {}) {
  let query = supabaseAdmin.from('products').select('*, categories(id, name, slug)', { count: 'exact' });

  if (onlyActive) query = query.eq('active', true);
  if (search) query = query.ilike('name', `%${search}%`);

  if (categorySlug) {
    const { data: cat } = await supabaseAdmin.from('categories').select('id').eq('slug', categorySlug).single();
    if (cat) query = query.eq('category_id', cat.id);
    else return { products: [], total: 0 };
  }

  if (sort === 'price_asc') query = query.order('price', { ascending: true });
  else if (sort === 'price_desc') query = query.order('price', { ascending: false });
  else query = query.order('created_at', { ascending: false });

  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;
  if (error) throw new ApiError(500, 'Error al listar productos', error.message);
  return { products: data, total: count };
}

async function getFeaturedProducts(limit = 8) {
  const { data, error } = await supabaseAdmin
    .from('products').select('*, categories(id, name, slug)')
    .eq('active', true).order('created_at', { ascending: false }).limit(limit);
  if (error) throw new ApiError(500, 'Error al obtener productos destacados', error.message);
  return data;
}

async function getProductBySlug(slug) {
  const { data: product, error } = await supabaseAdmin
    .from('products').select('*, categories(id, name, slug)')
    .eq('slug', slug).eq('active', true).single();
  if (error || !product) throw new ApiError(404, 'Producto no encontrado');

  const { data: images } = await supabaseAdmin
    .from('product_images').select('*').eq('product_id', product.id).order('position');

  const { data: related } = await supabaseAdmin
    .from('products').select('*')
    .eq('category_id', product.category_id).eq('active', true).neq('id', product.id).limit(4);

  return { ...product, images: images || [], related: related || [] };
}

async function getProductById(id) {
  const { data, error } = await supabaseAdmin.from('products').select('*').eq('id', id).single();
  if (error || !data) throw new ApiError(404, 'Producto no encontrado');
  return data;
}

async function createProduct(payload) {
  const slug = payload.slug ? toSlug(payload.slug) : toSlug(payload.name);
  const { data, error } = await supabaseAdmin.from('products').insert([{ ...payload, slug }]).select().single();
  if (error) throw new ApiError(400, 'Error al crear producto', error.message);
  return data;
}

async function updateProduct(id, payload) {
  const updates = { ...payload };
  if (updates.name && !updates.slug) updates.slug = toSlug(updates.name);
  const { data, error } = await supabaseAdmin.from('products').update(updates).eq('id', id).select().single();
  if (error) throw new ApiError(400, 'Error al actualizar producto', error.message);
  return data;
}

async function deleteProduct(id) {
  const { error } = await supabaseAdmin.from('products').delete().eq('id', id);
  if (error) throw new ApiError(400, 'Error al eliminar producto', error.message);
  return { success: true };
}

async function adjustStock(id, delta) {
  const product = await getProductById(id);
  const newStock = product.stock + delta;
  if (newStock < 0) throw new ApiError(400, 'Stock insuficiente');
  return updateProduct(id, { stock: newStock });
}

async function listLowStock(threshold = 5) {
  const { data, error } = await supabaseAdmin
    .from('products').select('*').lte('stock', threshold).eq('active', true).order('stock', { ascending: true });
  if (error) throw new ApiError(500, 'Error al listar stock bajo', error.message);
  return data;
}

module.exports = {
  listProducts, getFeaturedProducts, getProductBySlug, getProductById,
  createProduct, updateProduct, deleteProduct, adjustStock, listLowStock,
};