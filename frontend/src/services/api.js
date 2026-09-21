import { supabase } from './supabaseClient';

const API_URL = import.meta.env.VITE_API_URL;

async function authHeader() {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(await authHeader()), ...options.headers };
  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Error de red');
  return data;
}

export const api = {
    // productos
    getFeatured: (limit = 8) => request(`/products/featured?limit=${limit}`),
    listProducts: (params = {}) => request(`/products?${new URLSearchParams(params)}`),
    getProduct: (slug) => request(`/products/${slug}`),
    // categorías
    listCategories: () => request('/categories'),
    // auth
    register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
    login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
    getProfile: () => request('/auth/profile'),
    updateProfile: (body) => request('/auth/profile', { method: 'PATCH', body: JSON.stringify(body) }),
    getPaymentSettings: () => request('/settings/payment'),
    updatePaymentSettings: (body) => request('/settings/payment', { method: 'PATCH', body: JSON.stringify(body) }),
    // pedidos
    createOrder: (body) => request('/orders', { method: 'POST', body: JSON.stringify(body) }),
    getOrder: (id) => request(`/orders/${id}`),
    myOrders: () => request('/orders/mine'),
    // admin
    adminListProducts: (params = {}) => request(`/products?all=true&${new URLSearchParams(params)}`),
    adminCreateProduct: (body) => request('/products', { method: 'POST', body: JSON.stringify(body) }),
    adminUpdateProduct: (id, body) => request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    adminDeleteProduct: (id) => request(`/products/${id}`, { method: 'DELETE' }),
    adminListCategories: () => request('/categories?all=true'),
    adminCreateCategory: (body) => request('/categories', { method: 'POST', body: JSON.stringify(body) }),
    adminUpdateCategory: (id, body) => request(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    adminDeleteCategory: (id) => request(`/categories/${id}`, { method: 'DELETE' }),
    adminListOrders: (status) => request(`/orders${status ? `?status=${status}` : ''}`),
    adminUpdateOrderStatus: (id, status) =>
        request(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    adminSalesSummary: () => request('/orders/summary'),
    adminLowStock: () => request('/products/low-stock'),
};