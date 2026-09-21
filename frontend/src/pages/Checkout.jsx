import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';

const formatPrice = (n) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(n);
const SHIPPING = 3990;
const emptyPayment = {
  payment_method: 'transfer', bank_name: '', account_holder: '', account_rut: '',
  account_type: '', account_number: '', payment_email: '', payment_instructions: '',
};

const emptyForm = {
  firstName: '', lastName: '', email: '', phone: '',
  address: '', commune: '', region: '', shippingMethod: 'domicilio',
};

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [payment, setPayment] = useState(emptyPayment);
  const [paymentError, setPaymentError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.getPaymentSettings().then(setPayment)
      .catch(() => setPaymentError('No se pudieron cargar los datos de transferencia.'));
  }, []);

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="mb-4">Tu carrito está vacío.</p>
        <Link to="/tienda" className="text-brand underline">Ir a la tienda</Link>
      </div>
    );
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const order = await api.createOrder({
        customer: {
          name: `${form.firstName} ${form.lastName}`.trim(),
          email: form.email,
          phone: form.phone,
        },
        shippingAddress: {
          address: form.address,
          commune: form.commune,
          region: form.region,
          shipping_method: form.shippingMethod,
        },
        paymentMethod: 'transfer',
        items: items.map((i) => ({ product_id: i.id, quantity: i.quantity })),
      });
      clearCart();
      navigate(`/pedido-confirmado/${order.id}`);
    } catch (err) {
      setError(err.message || 'No se pudo crear el pedido');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 grid md:grid-cols-3 gap-10">
      <form onSubmit={handleSubmit} className="md:col-span-2 space-y-4">
        <h1 className="text-2xl font-semibold mb-2">Checkout</h1>

        <div className="grid grid-cols-2 gap-3">
          <input name="firstName" placeholder="Nombre" required value={form.firstName} onChange={handleChange} className="border border-gray-300 rounded px-3 py-2" />
          <input name="lastName" placeholder="Apellido" required value={form.lastName} onChange={handleChange} className="border border-gray-300 rounded px-3 py-2" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input name="email" type="email" placeholder="Email" required value={form.email} onChange={handleChange} className="border border-gray-300 rounded px-3 py-2" />
          <input name="phone" placeholder="Teléfono" required value={form.phone} onChange={handleChange} className="border border-gray-300 rounded px-3 py-2" />
        </div>

        <input name="address" placeholder="Dirección" required value={form.address} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2" />

        <div className="grid grid-cols-2 gap-3">
          <input name="commune" placeholder="Comuna" required value={form.commune} onChange={handleChange} className="border border-gray-300 rounded px-3 py-2" />
          <input name="region" placeholder="Región" required value={form.region} onChange={handleChange} className="border border-gray-300 rounded px-3 py-2" />
        </div>

        <div>
          <label className="text-sm block mb-1">Método de envío</label>
          <select name="shippingMethod" value={form.shippingMethod} onChange={handleChange} className="border border-gray-300 rounded px-3 py-2 w-full">
            <option value="domicilio">Despacho a domicilio</option>
            <option value="retiro">Retiro en tienda</option>
          </select>
        </div>

        <div className="border border-brand/30 bg-brand-light rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold">Pago por transferencia bancaria</h2>
            <span className="text-xs font-semibold text-brand bg-white rounded-full px-2 py-1">Único método</span>
          </div>
          {paymentError ? <p className="text-sm text-red-700">{paymentError}</p> : (
            <div className="text-sm text-gray-700 space-y-1">
              <p><strong>Banco:</strong> {payment.bank_name || 'Cargando...'}</p>
              <p><strong>Titular:</strong> {payment.account_holder || 'Cargando...'}</p>
              <p><strong>RUT:</strong> {payment.account_rut || 'Cargando...'}</p>
              <p><strong>Cuenta:</strong> {payment.account_type || 'Cargando...'} {payment.account_number && `N° ${payment.account_number}`}</p>
              <p><strong>Email:</strong> {payment.payment_email || 'Cargando...'}</p>
              {payment.payment_instructions && <p className="pt-2 text-gray-600">{payment.payment_instructions}</p>}
            </div>
          )}
          <p className="border-t border-brand/20 pt-2 text-sm font-medium text-brand">
            Tu pago quedará pendiente de comprobación. Revisaremos la transferencia y te avisaremos cuando el pedido sea confirmado.
          </p>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button disabled={loading} className="bg-brand text-white px-6 py-2.5 rounded disabled:opacity-50">
          {loading ? 'Procesando...' : 'Confirmar pedido'}
        </button>

        <p className="text-xs text-gray-400 pt-2">
          Este es un flujo de pago de prueba — aún no está conectada una pasarela real.
          No se solicitan ni almacenan datos de tarjeta.
        </p>
      </form>

      <div className="border border-gray-200 rounded-lg p-4 h-fit space-y-3">
        <h2 className="font-semibold mb-2">Resumen</h2>
        {items.map((i) => (
          <div key={i.id} className="flex justify-between text-sm">
            <span>{i.name} x{i.quantity}</span>
            <span>{formatPrice(i.price * i.quantity)}</span>
          </div>
        ))}
        <div className="border-t pt-2 flex justify-between text-sm"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
        <div className="flex justify-between text-sm"><span>Envío</span><span>{formatPrice(SHIPPING)}</span></div>
        <div className="flex justify-between font-semibold border-t pt-2"><span>Total</span><span>{formatPrice(subtotal + SHIPPING)}</span></div>
      </div>
    </div>
  );
}