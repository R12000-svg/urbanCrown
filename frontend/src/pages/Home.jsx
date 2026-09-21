import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import ProductCard from '../components/ProductCard';
import urbanCrownImage from '../img/urban-crown.jpg';

export default function Home() {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    api.getFeatured(8).then(setFeatured).catch(console.error);
  }, []);

  const benefits = [
    { title: 'Envíos a todo Chile', desc: 'Despacho rápido y seguimiento de tu pedido.' },
    { title: 'Compra segura', desc: 'Tus datos siempre protegidos.' },
    { title: 'Atención personalizada', desc: 'Te ayudamos antes y después de tu compra.' },
    { title: 'Productos seleccionados', desc: 'Curamos cada producto de nuestro catálogo.' },
  ];

  return (
    <div>
      {/* Hero */}
      {/* Hero */}
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-light via-white to-white">
    <div className="max-w-6xl mx-auto px-4 py-20 md:py-28 grid md:grid-cols-2 gap-10 items-center relative z-10">
        <div>
        <h1 className="font-display text-5xl md:text-6xl leading-[1.05] mb-5">
            Productos que hacen tu día mejor
        </h1>
        <p className="text-gray-600 mb-8 max-w-md">
            Descubre nuestra selección de productos pensados para ti, con envíos a todo Chile.
        </p>
        <Link
            to="/tienda"
            className="inline-block bg-ink text-white px-7 py-3 rounded-full hover:bg-brand transition"
        >
            Ver productos
        </Link>
        </div>
        <img
        src={urbanCrownImage}
                alt="Productos destacados"
                className="rounded-lg w-full object-cover"
        />
    </div>
</section>

      {/* Productos destacados */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="font-display text-3xl mb-6">Productos destacados</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {featured.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* Beneficios */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {benefits.map((b) => (
            <div key={b.title}>
              <h3 className="font-semibold mb-1">{b.title}</h3>
              <p className="text-sm text-gray-600">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Nosotros */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="font-display text-3xl mb-4">Nosotros</h2>
        <p className="text-gray-600 max-w-2xl">
          Somos un emprendimiento que comenzó con la idea de ofrecer productos de calidad,
          seleccionados uno a uno, con atención cercana y despacho a todo el país.
        </p>
      </section>
    </div>
  );
}