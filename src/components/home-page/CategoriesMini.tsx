import React from "react";

type CategoryItem = {
  meta: {
    id_personaje?: string | number;
    title: string;
    slug: string;
    gallery?: { url: string }[];
  };
  productsCount: number;
};

interface Props {
  data: CategoryItem[];
}

export const CategoriesMini: React.FC<Props> = ({ data }) => {
  return (
    <section className="px-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
        {data.map((item, index) => {
          const personajeId = item.meta?.id_personaje;

          const href =
            personajeId != null
              ? `/shop?personajeId=${encodeURIComponent(String(personajeId))}`
              : "/shop";

          return (
            <a
              key={index}
              href={href}
              className="group relative aspect-[4/5] flex items-end p-4 overflow-hidden bg-zinc-900 rounded-xl border border-white/5 hover:border-red-500/60 hover:-translate-y-1 transition-all duration-500 shadow-xl"
            >
              {/* Imagen */}
              {item.meta.gallery?.[0]?.url && (
                <img
                  src={item.meta.gallery[0].url}
                  alt={item.meta.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 group-hover:opacity-60 opacity-80"
                />
              )}

              {/* Overlay base */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent pointer-events-none transition-all duration-500" />

              {/* Overlay hover */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />

              {/* Contenido */}
              <div className="relative z-20 w-full transition-all duration-500 group-hover:translate-y-[-6px]">
                
                <div className="text-[13px] md:text-[15px] font-black uppercase italic tracking-tighter text-white leading-tight">
                  {item.meta.title}
                </div>

                <div className="text-[10px] uppercase opacity-70 font-bold text-zinc-300 mt-1">
                  {item.productsCount} Variante
                  {item.productsCount !== 1 ? "s" : ""}
                </div>

                {/* CTA */}
                <div className="mt-3 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                  <span className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-[#00aeff] text-black text-[10px] md:text-[11px] font-black uppercase tracking-[0.18em] shadow-[0_0_20px_rgba(163,230,53,0.35)]">
                    Ver modelos
                  </span>
                </div>

              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
};