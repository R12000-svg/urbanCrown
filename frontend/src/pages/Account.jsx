import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const formatPrice = (n) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(n);
const statusLabels = {
  pending: 'Pendiente', confirmed: 'Confirmado', preparing: 'Preparando',
  shipped: 'Enviado', delivered: 'Entregado', cancelled: 'Cancelado',
};

export default function Account() {
  const { user, profile, isAdmin, loading: authLoading, refreshProfile, logout } = useAuth();
  const [form, setForm] = useState({});
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!user) return;
    api.myOrders().then(setOrders)
      .catch(() => setError('No se pudieron cargar tus pedidos.'))
      .finally(() => setLoading(false));
  }, [user]);

  if (authLoading) return <div className="max-w-6xl mx-auto px-4 py-16">Cargando cuenta...</div>;
  if (!user) return <Navigate to="/login" replace />;

  const savedForm = {
    fullName: profile?.full_name || user.user_metadata?.full_name || '',
    phone: profile?.phone || '',
    address: user.user_metadata?.address || '',
  };
  const values = { ...savedForm, ...form };

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setSuccess('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await api.updateProfile(values);
      await refreshProfile();
      setSuccess('Tus datos se actualizaron correctamente.');
    } catch (updateError) {
      setError(updateError.message || 'No se pudieron guardar tus datos.');
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await logout();
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8">
        <div>
          <p className="text-sm font-medium text-brand mb-1">Tu espacio personal</p>
          <h1 className="text-3xl font-semibold">Mi cuenta</h1>
          <p className="text-gray-500 mt-2">Gestiona tus datos y revisa tus compras.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isAdmin && <Link to="/admin" className="bg-brand text-white font-medium rounded px-4 py-2 hover:bg-brand-dark transition">Ir al dashboard</Link>}
          <button type="button" onClick={handleLogout} className="border border-gray-300 text-gray-700 font-medium rounded px-4 py-2 hover:bg-gray-50 transition">Cerrar sesión</button>
        </div>
      </div>

      {error && <p className="mb-6 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {success && <p className="mb-6 rounded border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{success}</p>}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <section className="border border-gray-200 rounded-lg bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-1">Datos personales</h2>
          <p className="text-sm text-gray-500 mb-5">El email de acceso no se puede cambiar desde aquí.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block text-sm font-medium">Nombre completo
              <input name="fullName" required value={values.fullName} onChange={handleChange} className="mt-1 w-full border border-gray-300 rounded px-3 py-2" />
            </label>
            <label className="block text-sm font-medium">Email
              <input value={user.email || ''} readOnly className="mt-1 w-full border border-gray-200 bg-gray-50 text-gray-500 rounded px-3 py-2" />
            </label>
            <label className="block text-sm font-medium">Teléfono
              <input name="phone" type="tel" value={values.phone} onChange={handleChange} className="mt-1 w-full border border-gray-300 rounded px-3 py-2" />
            </label>
            <label className="block text-sm font-medium">Dirección de despacho
              <textarea name="address" rows="3" value={values.address} onChange={handleChange} placeholder="Calle, número, departamento y referencias" className="mt-1 w-full border border-gray-300 rounded px-3 py-2" />
            </label>
            <button disabled={saving} className="w-full bg-brand text-white font-medium rounded px-4 py-2.5 hover:bg-brand-dark transition disabled:opacity-60">
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </form>
        </section>

        <section className="border border-gray-200 rounded-lg bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="text-xl font-semibold">Mis pedidos</h2>
              <p className="text-sm text-gray-500 mt-1">Historial de compras asociadas a tu cuenta.</p>
            </div>
            <Link to="/tienda" className="text-sm font-medium text-brand hover:text-brand-dark">Seguir comprando</Link>
          </div>
          {loading ? <p className="text-sm text-gray-500 py-8">Cargando pedidos...</p> : orders.length === 0 ? (
            <div className="border border-dashed border-gray-300 rounded p-6 text-center">
              <p className="text-gray-600 mb-3">Todavía no tienes pedidos.</p>
              <Link to="/tienda" className="text-sm font-medium text-brand underline underline-offset-2">Explorar gorras</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div key={order.id} className="border border-gray-200 rounded p-4">
                  <div className="flex flex-wrap justify-between gap-2 mb-2">
                    <p className="font-medium">Pedido #{String(order.id).slice(0, 8)}</p>
                    <span className="text-sm text-gray-600">{statusLabels[order.status] || order.status}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{new Date(order.created_at).toLocaleDateString('es-CL')}</span>
                    <span className="font-semibold text-gray-800">{formatPrice(order.total)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}