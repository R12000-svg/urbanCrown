import { Navigate, Outlet, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabaseClient';

export default function AdminLayout() {
  const { user, loading } = useAuth();
  const [role, setRole] = useState(null);
  const [checkedUserId, setCheckedUserId] = useState(null);

  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('role').eq('id', user.id).single()
      .then(({ data }) => setRole(data?.role))
      .finally(() => setCheckedUserId(user.id));
  }, [user]);

  const checking = Boolean(user && checkedUserId !== user.id);

  if (loading || checking) return <div className="p-10">Cargando...</div>;
  if (!user || role !== 'admin') return <Navigate to="/login" replace />;

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="w-full md:w-56 shrink-0 bg-ink text-white p-5 space-y-1">
        <h2 className="font-display text-lg mb-5">Urban Crown</h2>
        <Link to="/admin" className="block text-sm py-2 text-white/70 hover:text-white transition">Dashboard</Link>
        <Link to="/admin/productos" className="block text-sm py-2 text-white/70 hover:text-white transition">Productos</Link>
        <Link to="/admin/categorias" className="block text-sm py-2 text-white/70 hover:text-white transition">Categorías</Link>
        <Link to="/admin/pedidos" className="block text-sm py-2 text-white/70 hover:text-white transition">Pedidos</Link>
        </aside>
      <main className="flex-1 min-w-0 bg-brand-light p-4 md:p-8"><Outlet /></main>
    </div>
  );
}