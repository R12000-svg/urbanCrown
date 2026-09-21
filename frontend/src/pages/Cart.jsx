import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const formatPrice = (n) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(n);
const SHIPPING = 3990;

export default function Cart() {
  const { items, updateQuantity, removeItem, subtotal } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="mb-4">Tu carrito está vacío.</p>
        <Link to="/tienda" className="text-brand underline">Ir a la tienda</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-6">Carrito</h1>

      <div className="divide-y divide-gray-200">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-4 py-4">
            <img src={item.image} className="w-20 h-20 object-cover rounded" />
            <div className="flex-1">
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-gray-500">{formatPrice(item.price)}</p>
            </div>
            <input
              type="number" min="1" value={item.quantity}
              onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
              className="border border-gray-300 rounded w-16 px-2 py-1"
            />
            <span className="w-24 text-right">{formatPrice(item.price * item.quantity)}</span>
            <button onClick={() => removeItem(item.id)} className="text-sm text-red-500">Eliminar</button>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <div className="w-full md:w-72 space-y-2">
          <div className="flex justify-between text-sm"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
          <div className="flex justify-between text-sm"><span>Envío</span><span>{formatPrice(SHIPPING)}</span></div>
          <div className="flex justify-between font-semibold border-t pt-2"><span>Total</span><span>{formatPrice(subtotal + SHIPPING)}</span></div>

          <div className="flex flex-col gap-2 pt-4">
            <button onClick={() => navigate('/checkout')} className="bg-brand text-white py-2.5 rounded">
              Ir al checkout
            </button>
            <Link to="/tienda" className="text-center border border-gray-300 py-2.5 rounded">
              Continuar comprando
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}