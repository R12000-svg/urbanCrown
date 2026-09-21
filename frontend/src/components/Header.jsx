import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { totalItems } = useCart();
  const { user } = useAuth();

  return (
    <header className="border-b border-gray-200 sticky top-0 bg-white z-40">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-brand" />
          <span className="font-display font-semibold text-lg tracking-wide">Urban Crown</span>
        </Link>

        <nav className="hidden md:flex gap-6 text-sm">
          <Link to="/">Inicio</Link>
          <Link to="/tienda">Tienda</Link>
          <Link to="/nosotros">Nosotros</Link>
          <Link to="/contacto">Contacto</Link>
        </nav>

        <div className="flex items-center gap-4 text-sm">
          <Link to={user ? '/cuenta' : '/login'}>{user ? 'Mi cuenta' : 'Ingresar'}</Link>
          <Link to="/carrito" className="relative">
            Carrito
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-3 bg-brand text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}