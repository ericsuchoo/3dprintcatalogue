import React, { useMemo, useState } from "react";

type Item = {
  id: string;
  title: string;
  href: string;
};

interface Props {
  items: Item[];
}

export const CharacterExplorerLite: React.FC<Props> = ({ items }) => {
  const [search, setSearch] = useState("");

  const results = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return [];

    return items
      .filter((i) => i.title.toLowerCase().includes(q))
      .slice(0, 6);
  }, [items, search]);

  return (
   <section className="mb-0">
      <div className="rounded-2xl border border-white/10 bg-[#0f0f0f] p-6 sm:p-8">
        
        <div className="mb-4">
          <div className="text-[10px] uppercase tracking-[0.26em] text-zinc-400 font-black mb-2">
            Buscar personaje
          </div>

          <h3 className="text-white text-xl sm:text-2xl font-black italic uppercase">
            Salta directo al catálogo
          </h3>
        </div>

        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Ej: Batman, Goku..."
          className="w-full px-4 py-3 rounded-full bg-black border border-white/10 text-white text-sm focus:outline-none"
        />

        {search && (
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {results.length > 0 ? (
              results.map((item) => (
                <a
                  key={item.id}
                  href={item.href}
                  className="rounded-xl border border-white/10 bg-black px-4 py-3 hover:border-[#00eeff] transition"
                >
                  <div className="text-sm font-black uppercase text-white">
                    {item.title}
                  </div>

                  <div className="text-[10px] text-zinc-500 mt-1 uppercase tracking-[0.2em]">
                    Ver catálogo
                  </div>
                </a>
              ))
            ) : (
              <div className="text-zinc-500 text-sm">
                No hay coincidencias
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};