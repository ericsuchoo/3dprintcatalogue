import React from "react";

export const CatalogCTA: React.FC = () => {
  return (
    <section className="mt-20 mb-10">
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0f0f0f]">
        
        {/* Fondo */}
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_30%_30%,#00eeff33,transparent_60%)]" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 sm:p-10">

          {/* Texto */}
          <div className="flex flex-col justify-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white">
              Explora nuestro catálogo
            </h2>

            <p className="text-zinc-400 mt-3 max-w-md">
              Descubre personajes, universos y piezas únicas para tu colección.
            </p>

            <div className="mt-6">
              <a
                href="/shop"
                className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-red-500 text-white font-black uppercase tracking-[0.18em] text-xs hover:bg-red-600 transition"
              >
                Ver catálogo →
              </a>
            </div>
          </div>

          {/* Imagen decorativa */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="w-full h-[220px] rounded-xl bg-gradient-to-br from-[#00eeff22] to-transparent border border-white/10" />
          </div>
        </div>
      </div>
    </section>
  );
};