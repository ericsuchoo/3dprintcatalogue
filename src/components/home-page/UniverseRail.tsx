import React from "react";

type UniverseCard = {
  id: string;
  title: string;
  imageUrl: string | null;
};

interface Props {
  items: UniverseCard[];
  activeUniversoId?: string | null;
}

export const UniverseRail: React.FC<Props> = ({
  items,
  activeUniversoId = null,
}) => {
  if (!items?.length) return null;

  const buildHref = (universoId: string) => {
    const params = new URLSearchParams();
    params.set("universoId", universoId);
    return `/explorar?${params.toString()}`;
  };

  return (
    <section>
      <div className="mb-5">
        <h3 className="text-2xl md:text-3xl font-black uppercase italic text-white tracking-tight">
          Explora por{" "}
          <span className="text-[#00eeff] drop-shadow-[0_0_12px_rgba(0,238,255,0.35)]">
            universos
          </span>
        </h3>
        <p className="text-xs md:text-sm text-zinc-500 uppercase tracking-[0.18em] mt-2 font-bold">
          Desliza y filtra personajes por universo
        </p>
      </div>

      <div className="flex gap-5 overflow-x-auto pb-3 snap-x snap-mandatory">
        {items.map((item) => {
          const isActive = String(activeUniversoId ?? "") === String(item.id);

          return (
            <a
              key={item.id}
              href={buildHref(item.id)}
              className={[
                "group relative min-w-[240px] md:min-w-[280px] h-[170px] md:h-[200px] rounded-2xl overflow-hidden border snap-start transition-all duration-500",
                "hover:-translate-y-1 hover:shadow-[0_16px_34px_rgba(0,0,0,0.45)]",
                isActive
                  ? "border-[#00eeff] shadow-[0_0_24px_rgba(0,238,255,0.20)]"
                  : "border-white/10 hover:border-[#00eeff]/60",
              ].join(" ")}
            >
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <div className="absolute inset-0 bg-[#111]" />
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-black/10" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#00eeff]/10 via-transparent to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative z-10 h-full flex flex-col justify-end p-5">
                <div className="mb-3">
                  <span
                    className={[
                      "inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em]",
                      isActive
                        ? "border-[#00eeff]/70 text-[#00eeff] bg-[#00eeff]/10"
                        : "border-white/15 text-zinc-300 bg-black/30 backdrop-blur-sm",
                    ].join(" ")}
                  >
                    Universo
                  </span>
                </div>

                <h4 className="text-2xl md:text-3xl font-black uppercase italic text-white tracking-tight leading-none drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)]">
                  {item.title}
                </h4>

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-[0.18em] text-zinc-300 font-black">
                    Ver personajes
                  </span>

                  <span
                    className={[
                      "inline-flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-300",
                      isActive
                        ? "border-[#00eeff] text-[#00eeff] bg-[#00eeff]/10"
                        : "border-white/15 text-white/80 bg-black/30 backdrop-blur-sm group-hover:border-[#00eeff]/60 group-hover:text-[#00eeff]",
                    ].join(" ")}
                    aria-hidden="true"
                  >
                    →
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