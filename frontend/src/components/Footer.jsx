export default function Footer() {
  return (
    <footer className="bg-ink text-white mt-20">
      <div className="max-w-6xl mx-auto px-4 py-14 grid grid-cols-1 md:grid-cols-4 gap-10 text-sm">
        <div>
          <h4 className="font-display text-lg mb-3">Urban Crown</h4>
          <p className="text-white/60">contacto@urbancrown.cl</p>
          <p className="text-white/60">+56 9 0000 0000</p>
        </div>
        <div>
          <h4 className="font-medium mb-3 text-white/90">Síguenos</h4>
          <a href="https://instagram.com/_.urbancrown._" target="_blank" rel="noreferrer" className="text-white/60 hover:text-white transition">@_.urbancrown._</a>
          <p className="text-white/60">Facebook</p>
        </div>
        <div>
          <h4 className="font-medium mb-3 text-white/90">Enlaces</h4>
          <p><a href="/tienda" className="text-white/60 hover:text-white transition">Tienda</a></p>
          <p><a href="/nosotros" className="text-white/60 hover:text-white transition">Nosotros</a></p>
          <p><a href="/contacto" className="text-white/60 hover:text-white transition">Contacto</a></p>
        </div>
        <div>
          <h4 className="font-medium mb-3 text-white/90">Legal</h4>
          <p><a href="/terminos" className="text-white/60 hover:text-white transition">Términos y condiciones</a></p>
          <p><a href="/privacidad" className="text-white/60 hover:text-white transition">Política de privacidad</a></p>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/40">
        © {new Date().getFullYear()} Urban Crown. Todos los derechos reservados.
      </div>
    </footer>
  );
}