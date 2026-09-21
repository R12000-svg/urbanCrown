export default function Contact() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <p className="text-sm font-medium text-brand mb-2">Estamos para ayudarte</p>
      <h1 className="text-3xl md:text-4xl font-semibold mb-6">Contacto</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <section className="border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-3">Hablemos</h2>
          <p className="text-gray-600 leading-relaxed mb-5">
            Si tienes dudas sobre una gorra, tu pedido o los despachos, escríbenos y te responderemos lo antes posible.
          </p>
          <p className="text-sm text-gray-600">Email</p>
          <a href="mailto:contacto@urbancrown.cl" className="text-brand font-medium hover:text-brand-dark">contacto@urbancrown.cl</a>
          <p className="text-sm text-gray-600 mt-4">Teléfono</p>
          <a href="tel:+56900000000" className="text-brand font-medium hover:text-brand-dark">+56 9 0000 0000</a>
        </section>
        <section className="border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-3">Síguenos</h2>
          <p className="text-gray-600 leading-relaxed mb-5">Novedades, lanzamientos y estilo urbano en nuestro Instagram.</p>
          <a href="https://instagram.com/_.urbancrown._" target="_blank" rel="noreferrer" className="text-brand font-medium hover:text-brand-dark">@_.urbancrown._</a>
        </section>
      </div>
    </div>
  );
}
