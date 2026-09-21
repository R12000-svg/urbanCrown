import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';

const formatPrice = (n) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(n);

export default function OrderConfirmation() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [payment, setPayment] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getOrder(id).then(setOrder).catch((e) => setError(e.message));
    api.getPaymentSettings().then(setPayment).catch(() => {});
  }, [id]);

  if (error) return <div className="max-w-2xl mx-auto px-4 py-16 text-center text-red-500">{error}</div>;
  if (!order) return <div className="max-w-2xl mx-auto px-4 py-16 text-center">Cargando...</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div className="w-14 h-14 rounded-full bg-brand-light text-brand flex items-center justify-center mx-auto mb-4 text-2xl">
        ✓
      </div>
      <h1 className="text-2xl font-semibold mb-2">¡Pedido confirmado!</h1>
      <p className="text-gray-600 mb-8">
        Gracias {order.customer_name}, tu pedido #{order.id.slice(0, 8)} fue recibido correctamente.
      </p>

      <div className="border border-amber-200 bg-amber-50 rounded-lg p-4 text-left mb-8 text-sm text-amber-900">
        <p className="font-semibold mb-1">Pago pendiente de comprobación</p>
        <p>Estamos revisando tu transferencia. Te avisaremos cuando el pago sea validado y tu pedido quede confirmado.</p>
      </div>

      {payment && (
        <div className="border border-brand/30 bg-brand-light rounded-lg p-4 text-left mb-8">
          <h2 className="font-semibold mb-2">Completa tu transferencia</h2>
          <div className="text-sm text-gray-700 space-y-1">
            <p><strong>Banco:</strong> {payment.bank_name}</p>
            <p><strong>Titular:</strong> {payment.account_holder}</p>
            <p><strong>RUT:</strong> {payment.account_rut}</p>
            <p><strong>Cuenta:</strong> {payment.account_type} N° {payment.account_number}</p>
            <p><strong>Email:</strong> {payment.payment_email}</p>
            <p className="pt-2">{payment.payment_instructions}</p>
          </div>
        </div>
      )}

      <div className="border border-gray-200 rounded-lg p-4 text-left space-y-2 mb-8">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span>{item.product_name} x{item.quantity}</span>
            <span>{formatPrice(item.subtotal)}</span>
          </div>
        ))}
        <div className="border-t pt-2 flex justify-between text-sm"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
        <div className="flex justify-between text-sm"><span>Envío</span><span>{formatPrice(order.shipping_cost)}</span></div>
        <div className="flex justify-between font-semibold border-t pt-2"><span>Total</span><span>{formatPrice(order.total)}</span></div>
      </div>

      <Link to="/tienda" className="inline-block bg-brand text-white px-6 py-2.5 rounded">
        Seguir comprando
      </Link>
    </div>
  );
}