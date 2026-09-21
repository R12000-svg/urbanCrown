import { useEffect, useState } from 'react';
import { api } from '../../services/api';

const STATUSES = ['pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled'];
const STATUS_LABELS = {
  pending: 'Pendiente de comprobación',
  confirmed: 'Confirmado',
  preparing: 'Preparando',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};
const formatPrice = (n) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(n);

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  function load() {
    api.adminListOrders().then(setOrders).catch(() => setError('No se pudieron cargar los pedidos.'));
  }
  useEffect(load, []);

  async function changeStatus(id, status) {
    setUpdatingId(id);
    setError('');
    try {
      await api.adminUpdateOrderStatus(id, status);
      load();
    } catch (statusError) {
      setError(statusError.message || 'No se pudo actualizar el pedido.');
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Pedidos</h1>
      {error && <p className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead><tr className="text-left border-b"><th>Cliente</th><th>Total</th><th>Estado</th><th></th></tr></thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b">
                <td className="py-2">{o.customer_name}</td>
                <td>{formatPrice(o.total)}</td>
                <td>
                  <select value={o.status} disabled={updatingId === o.id} onChange={(e) => changeStatus(o.id, e.target.value)} className="border rounded px-2 py-1 disabled:opacity-60">
                    {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                  </select>
                </td>
                <td className="text-right">
                  <button onClick={() => setSelected(o)} className="font-medium text-brand underline underline-offset-2">Ver detalle</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-semibold mb-2">Pedido de {selected.customer_name}</h2>
            <p className="text-sm text-gray-500 mb-4">{selected.customer_email}</p>
            <p className="text-sm mb-4"><strong>Método de pago:</strong> Transferencia bancaria</p>
            <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-64">
              {JSON.stringify(selected.shipping_address, null, 2)}
            </pre>
            <h3 className="font-medium mt-4 mb-2">Productos</h3>
            <ul className="text-sm space-y-1">
              {(selected.items || []).map((item) => (
                <li key={item.id} className="flex justify-between gap-3">
                  <span>{item.product_name} x {item.quantity}</span>
                  <span>{formatPrice(item.subtotal)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}