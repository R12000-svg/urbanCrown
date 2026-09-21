import { useEffect, useState } from 'react';
import { api } from '../../services/api';

const empty = { name: '', description: '', price: '', compare_price: '', sku: '', stock: 0, category_id: '', image: '', active: true };

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function loadProducts() {
    api.adminListProducts().then((r) => setProducts(r.products)).catch(() => setError('No se pudieron cargar los productos.'));
  }

  useEffect(() => {
    loadProducts();
    api.adminListCategories().then(setCategories).catch(() => setError('No se pudieron cargar las categorías.'));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    const payload = { ...form, price: Number(form.price), compare_price: form.compare_price ? Number(form.compare_price) : null, stock: Number(form.stock) };
    setSaving(true);
    setError('');
    try {
      if (editingId) await api.adminUpdateProduct(editingId, payload);
      else await api.adminCreateProduct(payload);
      setForm(empty);
      setEditingId(null);
      loadProducts();
    } catch (submitError) {
      setError(submitError.message || 'No se pudo guardar el producto.');
    } finally {
      setSaving(false);
    }
  }

  function editProduct(p) {
    setForm({ ...p, category_id: p.category_id || '' });
    setEditingId(p.id);
  }

  async function toggleActive(p) {
    setError('');
    try {
      await api.adminUpdateProduct(p.id, { active: !p.active });
      loadProducts();
    } catch (toggleError) {
      setError(toggleError.message || 'No se pudo cambiar el estado del producto.');
    }
  }

  async function remove(id) {
    if (!confirm('¿Eliminar producto?')) return;
    setError('');
    try {
      await api.adminDeleteProduct(id);
      loadProducts();
    } catch (removeError) {
      setError(removeError.message || 'No se pudo eliminar el producto.');
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Productos</h1>
      {error && <p className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3 border border-gray-200 rounded-lg p-4 mb-8 max-w-2xl">
        <input placeholder="Nombre" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border rounded px-3 py-2 col-span-2" />
        <textarea placeholder="Descripción" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="border rounded px-3 py-2 col-span-2" />
        <input type="number" placeholder="Precio" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="border rounded px-3 py-2" />
        <input type="number" placeholder="Precio anterior (oferta)" value={form.compare_price} onChange={(e) => setForm({ ...form, compare_price: e.target.value })} className="border rounded px-3 py-2" />
        <input placeholder="SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className="border rounded px-3 py-2" />
        <input type="number" placeholder="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="border rounded px-3 py-2" />
        <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="border rounded px-3 py-2">
          <option value="">Sin categoría</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input placeholder="URL de imagen" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="border rounded px-3 py-2" />
        <button disabled={saving} className="bg-brand text-white font-medium rounded py-2 col-span-2 hover:bg-brand-dark transition disabled:opacity-60">
          {saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear producto'}
        </button>
      </form>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="text-left border-b"><th>Nombre</th><th>Precio</th><th>Stock</th><th>Activo</th><th></th></tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b">
                <td className="py-2">{p.name}</td>
                <td>${p.price}</td>
                <td>{p.stock}</td>
                <td>
                  <button onClick={() => toggleActive(p)} className={`font-medium underline underline-offset-2 ${p.active ? 'text-green-700' : 'text-gray-600'}`}>
                    {p.active ? 'Activo' : 'Inactivo'}
                  </button>
                </td>
                <td className="text-right space-x-2">
                  <button onClick={() => editProduct(p)} className="font-medium text-brand underline underline-offset-2">Editar</button>
                  <button onClick={() => remove(p.id)} className="font-medium text-red-700 underline underline-offset-2">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}