import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';

const formatPrice = (n) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(n);
const statusLabels = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  preparing: 'Preparando',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};
const emptyPaymentSettings = {
  payment_method: 'transfer',
  bank_name: '',
  account_holder: '',
  account_rut: '',
  account_type: 'Cuenta corriente',
  account_number: '',
  payment_email: '',
  payment_instructions: 'Transfiere el total de tu pedido e indica el numero de pedido en el mensaje.',
};

export default function Dashboard() {
  const [summary, setSummary] = useState({ totalSales: 0, totalOrders: 0 });
  const [products, setProducts] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [payment, setPayment] = useState(emptyPaymentSettings);
  const [paymentLoading, setPaymentLoading] = useState(true);
  const [paymentSaving, setPaymentSaving] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [paymentSaved, setPaymentSaved] = useState('');

  useEffect(() => {
    Promise.all([
      api.adminSalesSummary(),
      api.adminListProducts(),
      api.adminLowStock(),
      api.adminListOrders(),
    ]).then(([sales, productResult, stock, orderResult]) => {
      setSummary(sales);
      setProducts(productResult.products);
      setLowStock(stock);
      setOrders(orderResult);
    }).catch(() => setError('No se pudieron cargar los datos del dashboard.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    api.getPaymentSettings().then(setPayment)
      .catch(() => setPaymentError('Configura la tabla de pagos en Supabase para editar las transferencias.'))
      .finally(() => setPaymentLoading(false));
  }, []);

  function handlePaymentChange(e) {
    setPayment({ ...payment, [e.target.name]: e.target.value });
    setPaymentSaved('');
  }

  async function handlePaymentSubmit(e) {
    e.preventDefault();
    setPaymentSaving(true);
    setPaymentError('');
    setPaymentSaved('');
    try {
      const saved = await api.updatePaymentSettings(payment);
      setPayment(saved);
      setPaymentSaved('Datos de transferencia actualizados.');
    } catch (saveError) {
      setPaymentError(saveError.message || 'No se pudieron guardar los datos de transferencia.');
    } finally {
      setPaymentSaving(false);
    }
  }

  const cards = [
    { label: 'Ventas acumuladas', value: formatPrice(summary.totalSales), detail: 'Pedidos no cancelados', tone: 'bg-brand-light text-brand' },
    { label: 'Pedidos', value: summary.totalOrders, detail: 'Pedidos no cancelados', tone: 'bg-blue-50 text-blue-700' },
    { label: 'Productos', value: products.length, detail: 'Activos e inactivos', tone: 'bg-amber-50 text-amber-700' },
    { label: 'Stock bajo', value: lowStock.length, detail: 'Activos con 5 unidades o menos', tone: 'bg-red-50 text-red-700' },
  ];

  return (
    <div className="max-w-7xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8">
        <div>
          <p className="text-sm font-medium text-brand mb-1">Resumen de la tienda</p>
          <h1 className="text-3xl font-semibold">Dashboard</h1>
          <p className="text-gray-500 mt-2">Controla ventas, catálogo y pedidos desde un solo lugar.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/productos" className="bg-brand text-white font-medium rounded px-4 py-2 hover:bg-brand-dark transition">Nuevo producto</Link>
          <Link to="/admin/pedidos" className="border border-brand text-brand font-medium rounded px-4 py-2 hover:bg-brand-light transition">Ver pedidos</Link>
        </div>
      </div>

      {error && <p className="mb-6 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="border border-gray-200 rounded-lg bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium text-gray-500">{c.label}</p>
              <span className={`rounded-full px-2 py-1 text-xs font-semibold ${c.tone}`}>Datos reales</span>
            </div>
            <p className="text-2xl font-semibold mt-4">{loading ? '...' : c.value}</p>
            <p className="text-xs text-gray-500 mt-2">{c.detail}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <section className="border border-gray-200 rounded-lg bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-lg font-semibold">Pedidos recientes</h2>
              <p className="text-sm text-gray-500 mt-1">Últimos pedidos recibidos.</p>
            </div>
            <Link to="/admin/pedidos" className="text-sm font-medium text-brand hover:text-brand-dark">Ver todos</Link>
          </div>
          {loading ? <p className="text-sm text-gray-500 py-6">Cargando pedidos...</p> : orders.length === 0 ? (
            <p className="text-sm text-gray-500 py-6">Todavía no hay pedidos registrados.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {orders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{order.customer_name}</p>
                    <p className="text-xs text-gray-500 truncate">{order.customer_email}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-medium">{formatPrice(order.total)}</p>
                    <p className="text-xs text-gray-500">{statusLabels[order.status] || order.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="border border-gray-200 rounded-lg bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-lg font-semibold">Alertas de stock</h2>
              <p className="text-sm text-gray-500 mt-1">Productos que requieren reposición.</p>
            </div>
            <Link to="/admin/productos" className="text-sm font-medium text-brand hover:text-brand-dark">Gestionar</Link>
          </div>
          {loading ? <p className="text-sm text-gray-500 py-6">Cargando stock...</p> : lowStock.length === 0 ? (
            <p className="text-sm text-gray-500 py-6">No hay alertas de stock bajo.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {lowStock.slice(0, 5).map((product) => (
                <div key={product.id} className="flex items-center justify-between gap-4 py-3">
                  <p className="font-medium truncate">{product.name}</p>
                  <span className="shrink-0 rounded-full bg-red-50 px-2 py-1 text-xs font-semibold text-red-700">{product.stock} unidades</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="border border-gray-200 rounded-lg bg-white p-5 shadow-sm mt-6">
        <div className="mb-5">
          <p className="text-sm font-medium text-brand mb-1">Cobros</p>
          <h2 className="text-xl font-semibold">Datos de transferencia</h2>
          <p className="text-sm text-gray-500 mt-1">Estos datos aparecerán en el checkout. El único método de pago activo es transferencia bancaria.</p>
        </div>
        {paymentError && <p className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{paymentError}</p>}
        {paymentSaved && <p className="mb-4 rounded border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{paymentSaved}</p>}
        <form onSubmit={handlePaymentSubmit} className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium">Método de pago
            <input value="Transferencia bancaria" readOnly className="mt-1 w-full border border-gray-200 bg-gray-50 text-gray-500 rounded px-3 py-2" />
          </label>
          <label className="text-sm font-medium">Banco
            <input name="bank_name" required value={payment.bank_name} onChange={handlePaymentChange} disabled={paymentLoading || paymentSaving} className="mt-1 w-full border border-gray-300 rounded px-3 py-2 disabled:opacity-60" />
          </label>
          <label className="text-sm font-medium">Titular
            <input name="account_holder" required value={payment.account_holder} onChange={handlePaymentChange} disabled={paymentLoading || paymentSaving} className="mt-1 w-full border border-gray-300 rounded px-3 py-2 disabled:opacity-60" />
          </label>
          <label className="text-sm font-medium">RUT del titular
            <input name="account_rut" required value={payment.account_rut} onChange={handlePaymentChange} disabled={paymentLoading || paymentSaving} className="mt-1 w-full border border-gray-300 rounded px-3 py-2 disabled:opacity-60" />
          </label>
          <label className="text-sm font-medium">Tipo de cuenta
            <input name="account_type" required value={payment.account_type} onChange={handlePaymentChange} disabled={paymentLoading || paymentSaving} className="mt-1 w-full border border-gray-300 rounded px-3 py-2 disabled:opacity-60" />
          </label>
          <label className="text-sm font-medium">Número de cuenta
            <input name="account_number" required value={payment.account_number} onChange={handlePaymentChange} disabled={paymentLoading || paymentSaving} className="mt-1 w-full border border-gray-300 rounded px-3 py-2 disabled:opacity-60" />
          </label>
          <label className="text-sm font-medium">Email para comprobantes
            <input name="payment_email" type="email" required value={payment.payment_email} onChange={handlePaymentChange} disabled={paymentLoading || paymentSaving} className="mt-1 w-full border border-gray-300 rounded px-3 py-2 disabled:opacity-60" />
          </label>
          <label className="text-sm font-medium sm:col-span-2">Instrucciones para el cliente
            <textarea name="payment_instructions" rows="3" value={payment.payment_instructions} onChange={handlePaymentChange} disabled={paymentLoading || paymentSaving} className="mt-1 w-full border border-gray-300 rounded px-3 py-2 disabled:opacity-60" />
          </label>
          <button disabled={paymentLoading || paymentSaving} className="sm:col-span-2 bg-brand text-white font-medium rounded px-4 py-2.5 hover:bg-brand-dark transition disabled:opacity-60">
            {paymentSaving ? 'Guardando...' : 'Guardar datos de transferencia'}
          </button>
        </form>
      </section>
    </div>
  );
}