import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return setError('Email o contraseña incorrectos');
    navigate('/');
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-16">
      <h1 className="text-2xl font-semibold mb-6">Iniciar sesión</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="email" placeholder="Email" required value={email}
          onChange={(e) => setEmail(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" />
        <input type="password" placeholder="Contraseña" required value={password}
          onChange={(e) => setPassword(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button className="w-full bg-brand text-white py-2.5 rounded">Ingresar</button>
      </form>
      <p className="text-sm mt-4">¿No tienes cuenta? <Link to="/registro" className="text-brand underline">Regístrate</Link></p>
    </div>
  );
}