import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';

const formatPrice = (n) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(n);

export default function ProductPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');
  const { addItem } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    api.getProduct(slug).then((p) => {
      setProduct(p);
      setActiveImage(p.image);
      setQuantity(1);
      setError('');
    }).catch(() => setError('No se pudo cargar este producto.'));
  }, [slug]);

  if (error) return <div className="max-w-6xl mx-auto px-4 py-10 text-red-700">{error}</div>;
  if (!product) return <div className="max-w-6xl mx-auto px-4 py-10">Cargando...</div>;

  const gallery = [product.image, ...(product.images || []).map((i) => i.url)];

  function handleAddToCart() {
    addItem(product, quantity);
  }

  function handleBuyNow() {
    addItem(product, quantity);
    navigate('/carrito');
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 grid md:grid-cols-2 gap-10">
      <div>
        <img src={activeImage} alt={product.name} className="w-full aspect-square object-cover rounded-lg mb-3" />
        <div className="flex gap-2">
          {gallery.map((img) => (
            <button key={img} onClick={() => setActiveImage(img)}>
              <img src={img} className="w-16 h-16 object-cover rounded border border-gray-200" />
            </button>
          ))}
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-semibold mb-2">{product.name}</h1>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl font-bold">{formatPrice(product.price)}</span>
          {product.compare_price && (
            <span className="text-gray-400 line-through">{formatPrice(product.compare_price)}</span>
          )}
        </div>
        <p className="text-gray-600 mb-4">{product.description}</p>
        <p className="text-sm text-gray-500 mb-4">
          {product.stock > 0 ? `${product.stock} unidades disponibles` : 'Sin stock'}
        </p>

        <div className="flex items-center gap-3 mb-4">
          <label className="text-sm">Cantidad</label>
          <input
            type="number" min="1" max={product.stock}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, Number(e.target.value))))}
            className="border border-gray-300 rounded w-20 px-2 py-1"
          />
        </div>

        <div className="flex gap-3 mb-8">
          <button onClick={handleAddToCart} disabled={product.stock === 0}
            className="border border-brand text-brand px-5 py-2.5 rounded disabled:opacity-50">
            Agregar al carrito
          </button>
          <button onClick={handleBuyNow} disabled={product.stock === 0}
            className="bg-brand text-white px-5 py-2.5 rounded disabled:opacity-50">
            Comprar ahora
          </button>
        </div>

        <div className="text-sm text-gray-500 border-t pt-4">
          Despacho a todo Chile. Los tiempos de entrega dependen de tu comuna.
        </div>
      </div>

      {product.related?.length > 0 && (
        <div className="md:col-span-2 mt-8">
          <h2 className="text-lg font-semibold mb-4">Productos relacionados</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {product.related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}
