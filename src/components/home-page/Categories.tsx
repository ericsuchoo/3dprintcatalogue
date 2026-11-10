import React from "react";

type Category = { meta: { title?: string; id_universo?: number | string; gallery?: Array<{ url?: string; src?: string }> }; productsCount: number };
type Props = { data: Category[]; ctaTheme?: string };
const imageOf = (item: Category) => item.meta?.gallery?.[0]?.url || item.meta?.gallery?.[0]?.src || "";

export const HomeCategories: React.FC<Props> = ({ data }) => (
  <section className="bg-[#0b0c10] px-5 py-12 text-white sm:px-8 lg:px-12" aria-label="Explorar universos">
    <div className="mx-auto max-w-[1440px]">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-5">
        <div><p className="mb-2 text-[10px] font-bold uppercase tracking-[0.32em] text-[#ff766a]">Colecciones / Universos</p><h2 className="text-2xl font-black uppercase tracking-tight sm:text-3xl">Explora por universo</h2></div>
        <a href="/explorar" className="text-xs font-bold uppercase tracking-widest text-white/75 hover:text-white">Ver todos los personajes ↗</a>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        {data.map((item, index) => {
          const title = item.meta?.title || "Universo";
          const image = imageOf(item);
          const id = item.meta?.id_universo;
          const href = item.productsCount > 0 && id != null ? `/explorar?universoId=${encodeURIComponent(String(id))}` : "/explorar";
          return (
            <a key={`${String(id ?? title)}-${index}`} href={href} className="group relative isolate block aspect-[4/5] min-h-[210px] overflow-hidden rounded-lg border border-white/10 bg-[#1a1d24] sm:aspect-[5/4] lg:aspect-[16/11] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff766a]">
              {image ? <img src={image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.07]" /> : <div className="absolute inset-0 bg-gradient-to-br from-[#302a32] via-[#191c24] to-black" />}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
              <div className="absolute inset-0 bg-[#e94235]/0 transition-colors duration-300 group-hover:bg-[#e94235]/10" />
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/65">{item.productsCount} personaje{item.productsCount !== 1 ? "s" : ""}</p>
                <div className="flex items-end justify-between gap-2"><h3 className="text-xl font-black uppercase italic leading-tight tracking-tight drop-shadow-lg sm:text-2xl lg:text-3xl">{title}</h3><span aria-hidden="true" className="text-xl text-[#ff766a] transition-transform group-hover:translate-x-1">↗</span></div>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  </section>
);
