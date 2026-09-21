import { Link } from 'react-router-dom';

const formatPrice = (n) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(n);

export default function ProductCard({ product }) {
  const hasOffer = product.compare_price && product.compare_price > product.price;
  return (
    <div className="group flex flex-col">
      <div className="relative overflow-hidden rounded-md bg-brand-light">
        <img
          src={product.image}
          alt={product.name}
          className="w-full aspect-square object-cover transition duration-300 group-hover:scale-[1.03]"
        />
        {hasOffer && (
          <span className="absolute top-3 left-3 bg-ink text-white text-[11px] tracking-wide px-2 py-1 rounded">
            OFERTA
          </span>
        )}
      </div>
      <div className="pt-3 flex flex-col gap-1">
        <h3 className="font-display text-base leading-snug">{product.name}</h3>
        <div className="flex items-center gap-2">
          <span className="font-medium text-brand">{formatPrice(product.price)}</span>
          {hasOffer && (
            <span className="text-xs text-gray-400 line-through">{formatPrice(product.compare_price)}</span>
          )}
        </div>
        <Link
          to={`/tienda/producto/${product.slug}`}
          className="mt-1 text-sm text-ink/70 hover:text-brand transition inline-flex items-center gap-1"
        >
          Ver producto <span className="transition group-hover:translate-x-0.5">→</span>
        </Link>
      </div>
    </div>
  );
}