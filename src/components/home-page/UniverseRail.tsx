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
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .glass-scrollbar {
              scrollbar-width: thin;
              scrollbar-color: rgba(255,255,255,0.18) rgba(255,255,255,0.04);
            }

            .glass-scrollbar::-webkit-scrollbar {
              height: 10px;
            }

            .glass-scrollbar::-webkit-scrollbar-track {
              background: rgba(255,255,255,0.04);
              border-radius: 999px;
              backdrop-filter: blur(6px);
            }

            .glass-scrollbar::-webkit-scrollbar-thumb {
              background: linear-gradient(
                90deg,
                rgba(255,255,255,0.14),
                rgba(0,238,255,0.22),
                rgba(255,255,255,0.14)
              );
              border-radius: 999px;
              border: 1px solid rgba(255,255,255,0.08);
            }

            .glass-scrollbar::-webkit-scrollbar-thumb:hover {
              background: linear-gradient(
                90deg,
                rgba(255,255,255,0.18),
                rgba(0,238,255,0.32),
                rgba(255,255,255,0.18)
              );
            }
          `,
        }}
      />

      <section>
        <div className="overflow-x-auto overflow-y-hidden pb-3 glass-scrollbar scroll-smooth">
          <div className="flex gap-5 min-w-max pr-2">
            {items.map((item) => {
              const isActive = String(activeUniversoId ?? "") === String(item.id);

              return (
                <a
                  key={item.id}
                  href={buildHref(item.id)}
                  className={[
                    "group relative min-w-[240px] md:min-w-[280px] h-[170px] md:h-[200px] rounded-2xl overflow-hidden border transition-all duration-500",
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
        </div>
      </section>
    </>
  );
};

export default UniverseRail;