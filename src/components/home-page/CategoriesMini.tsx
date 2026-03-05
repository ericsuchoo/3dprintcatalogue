import React from "react";

type CategoryItem = {
  meta: {
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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {data.map((item, index) => (
          <div
            key={index}
            className="group relative aspect-[4/5] flex items-end p-4 overflow-hidden bg-zinc-900 rounded-xl border border-white/5 hover:border-red-500/60 transition-all duration-500"
          >
            {/* Imagen de fondo */}
            {item.meta.gallery?.[0]?.url && (
              <img
                src={item.meta.gallery[0].url}
                alt={item.meta.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80"
              />
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent pointer-events-none" />

            <div className="relative z-10">
              <div className="text-[13px] md:text-[15px] font-black uppercase italic tracking-tighter text-white">
                {item.meta.title}
              </div>
              <div className="text-[10px] uppercase opacity-70 font-bold text-zinc-300">
                {item.productsCount} Modelo
                {item.productsCount !== 1 ? "s" : ""}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};