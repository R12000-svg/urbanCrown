const { supabaseAdmin } = require('../config/supabase');
const ApiError = require('../utils/ApiError');
const { getProductById } = require('./products.service');

const VALID_STATUSES = ['pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled'];
const SHIPPING_COST = 3990; // envío plano simple para el MVP; ajustable más adelante

// items: [{ product_id, quantity }]
async function createOrder({ userId, customer, shippingAddress, items, paymentMethod = 'transfer' }) {
  if (!items || items.length === 0) throw new ApiError(400, 'El carrito está vacío');

  // Recalcular precios y stock en el servidor (nunca confiar en el precio del frontend)
  const orderItems = [];
  let subtotal = 0;

  for (const item of items) {
    const product = await getProductById(item.product_id);
    if (!product.active) throw new ApiError(400, `${product.name} ya no está disponible`);
    if (product.stock < item.quantity) {
      throw new ApiError(400, `Stock insuficiente para ${product.name}`);
    }
    const itemSubtotal = Number(product.price) * item.quantity;
    subtotal += itemSubtotal;
    orderItems.push({
      product_id: product.id,
      product_name: product.name, // copia histórica
      quantity: item.quantity,
      unit_price: product.price, // precio congelado al momento de compra
      subtotal: itemSubtotal,
    });
  }

  const total = subtotal + SHIPPING_COST;

  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .insert([{
      user_id: userId || null,
      status: 'pending',
      subtotal,
      shipping_cost: SHIPPING_COST,
      total,
      customer_name: customer.name,
      customer_email: customer.email,
      customer_phone: customer.phone,
      shipping_address: shippingAddress,
      payment_method: paymentMethod,
    }])
    .select()
    .single();

  if (orderError) throw new ApiError(400, 'Error al crear el pedido', orderError.message);

  const itemsToInsert = orderItems.map((it) => ({ ...it, order_id: order.id }));
  const { error: itemsError } = await supabaseAdmin.from('order_items').insert(itemsToInsert);
  if (itemsError) throw new ApiError(400, 'Error al guardar los productos del pedido', itemsError.message);

  // Descontar stock
  for (const item of items) {
    const product = await getProductById(item.product_id);
    await supabaseAdmin.from('products').update({ stock: product.stock - item.quantity }).eq('id', product.id);
  }

  return getOrderById(order.id);
}

async function getOrderById(id) {
  const { data: order, error } = await supabaseAdmin.from('orders').select('*').eq('id', id).single();
  if (error || !order) throw new ApiError(404, 'Pedido no encontrado');
  const { data: items } = await supabaseAdmin.from('order_items').select('*').eq('order_id', id);
  return { ...order, items: items || [] };
}

async function listOrdersByUser(userId) {
  const { data, error } = await supabaseAdmin
    .from('orders').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  if (error) throw new ApiError(500, 'Error al listar pedidos', error.message);
  return data;
}

// Admin: listar todos los pedidos
async function listAllOrders({ status } = {}) {
  let query = supabaseAdmin.from('orders').select('*').order('created_at', { ascending: false });
  if (status) query = query.eq('status', status);
  const { data, error } = await query;
  if (error) throw new ApiError(500, 'Error al listar pedidos', error.message);
  return Promise.all(data.map(async (order) => {
    const { data: items, error: itemsError } = await supabaseAdmin
      .from('order_items').select('*').eq('order_id', order.id);
    if (itemsError) throw new ApiError(500, 'Error al listar productos del pedido', itemsError.message);
    return { ...order, items: items || [] };
  }));
}

async function updateOrderStatus(id, status) {
  if (!VALID_STATUSES.includes(status)) throw new ApiError(400, 'Estado de pedido inválido');
  const { data, error } = await supabaseAdmin.from('orders').update({ status }).eq('id', id).select().single();
  if (error) throw new ApiError(400, 'Error al actualizar el pedido', error.message);
  return data;
}

// Para el dashboard: ventas totales + cantidad de pedidos (simple, sin métricas complejas)
async function getSalesSummary() {
  const { data, error } = await supabaseAdmin
    .from('orders').select('total, status').neq('status', 'cancelled');
  if (error) throw new ApiError(500, 'Error al calcular ventas', error.message);
  const totalSales = data.reduce((acc, o) => acc + Number(o.total), 0);
  return { totalSales, totalOrders: data.length };
}

module.exports = {
  createOrder, getOrderById, listOrdersByUser, listAllOrders, updateOrderStatus, getSalesSummary,
};