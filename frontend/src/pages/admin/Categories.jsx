import { useEffect, useState } from 'react';
import { api } from '../../services/api';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', image: '' });
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function load() {
    api.adminListCategories().then(setCategories).catch(() => setError('No se pudieron cargar las categorías.'));
  }
  useEffect(load, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editingId) await api.adminUpdateCategory(editingId, form);
      else await api.adminCreateCategory(form);
      setForm({ name: '', description: '', image: '' });
      setEditingId(null);
      load();
    } catch (submitError) {
      setError(submitError.message || 'No se pudo guardar la categoría.');
    } finally {
      setSaving(false);
    }
  }

  async function remove(id) {
    if (!confirm('¿Eliminar categoría?')) return;
    setError('');
    try {
      await api.adminDeleteCategory(id);
      load();
    } catch (removeError) {
      setError(removeError.message || 'No se pudo eliminar la categoría.');
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Categorías</h1>
      {error && <p className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 mb-8 max-w-xl">
        <input placeholder="Nombre" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border rounded px-3 py-2 flex-1" />
        <button disabled={saving} className="bg-brand text-white font-medium rounded px-4 py-2 hover:bg-brand-dark transition disabled:opacity-60">{saving ? 'Guardando...' : editingId ? 'Guardar' : 'Crear'}</button>
      </form>
      <ul className="divide-y">
        {categories.map((c) => (
          <li key={c.id} className="flex justify-between items-center py-2 text-sm">
            <span>{c.name}</span>
            <span className="space-x-2">
              <button onClick={() => { setForm(c); setEditingId(c.id); }} className="font-medium text-brand underline underline-offset-2">Editar</button>
              <button onClick={() => remove(c.id)} className="font-medium text-red-700 underline underline-offset-2">Eliminar</button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}