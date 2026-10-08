
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

type CharacterItem = {
  id: string;
  name: string;
  universe: string;
  image: string;
  href?: string;
};

const FAVORITES_KEY = "favorite_characters";

export const CharacterSearchD1: React.FC = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CharacterItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [toast, setToast] = useState("");

  const trackRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef(0);

  useEffect(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem(FAVORITES_KEY) || "[]"
      );

      if (Array.isArray(saved)) {
        setFavoriteIds(saved.map(String));
      }
    } catch {
      setFavoriteIds([]);
    }
  }, []);

  useEffect(() => {
    if (!toast) return;

    const timer = window.setTimeout(() => setToast(""), 1800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const q = query.trim();
    const requestId = ++requestRef.current;

    if (q.length < 2) {
      setResults([]);
      setLoading(false);
      setError(false);
      return;
    }

    const controller = new AbortController();

    setLoading(true);
    setError(false);
    setResults([]);

    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/buscar-personajes?q=${encodeURIComponent(q)}`,
          {
            signal: controller.signal,
            headers: {
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Error HTTP");
        }

        const data = await response.json();

        if (requestId !== requestRef.current) return;

        setResults(
          Array.isArray(data.results) ? data.results : []
        );
      } catch (err) {
        if (controller.signal.aborted) return;
        if (requestId !== requestRef.current) return;

        setError(true);
        setResults([]);
      } finally {
        if (requestId === requestRef.current) {
          setLoading(false);
        }
      }
    }, 300);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const toggleFavorite = useCallback(
    (item: CharacterItem) => {
      setFavoriteIds((previous) => {
        const exists = previous.includes(item.id);

        const next = exists
          ? previous.filter((id) => id !== item.id)
          : [...previous, item.id];

        try {
          localStorage.setItem(
            FAVORITES_KEY,
            JSON.stringify(next)
          );
        } catch {
          // El navegador puede bloquear almacenamiento.
        }

        setToast(
          exists
            ? `Quitado de favoritos: ${item.name}`
            : `Añadido a favoritos: ${item.name}`
        );

        return next;
      });
    },
    []
  );

  const scrollResults = (direction: number) => {
    trackRef.current?.scrollBy({
      left: direction * 260,
      behavior: "smooth",
    });
  };

  const hasQuery = query.trim().length >= 2;

  return (
    <section className="w-full min-w-0">
      <div className="rounded-2xl border border-white/10 bg-[#0f0f0f] p-4 sm:p-6 shadow-[0_0_30px_rgba(0,0,0,0.35)]">
        <label
          htmlFor="explorar-character-search"
          className="block text-white font-semibold text-sm mb-3"
        >
          Busca por personaje o universo
        </label>

        <div className="relative">
          <input
            id="explorar-character-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Ej: Batman, Darth Vader, Dragon Ball..."
            autoComplete="off"
            className="w-full rounded-full border border-white/15 bg-black/60 text-white placeholder:text-white/40 px-5 py-3 pr-12 text-sm outline-none focus:border-[#00eeff]/60"
          />

          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Limpiar búsqueda"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        <p className="text-white/50 text-xs mt-3">
          Selecciona un personaje para ver sus modelos en el catálogo.
        </p>

        {hasQuery && (
          <div className="mt-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-white font-bold text-base">
                  Coincidencias
                </h3>

                <p
                  className="text-white/50 text-xs mt-1"
                  aria-live="polite"
                >
                  {loading
                    ? "Buscando..."
                    : error
                      ? "No se pudo completar la búsqueda"
                      : `${results.length} resultado${
                          results.length === 1 ? "" : "s"
                        }`}
                </p>
              </div>

              {results.length > 0 && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => scrollResults(-1)}
                    aria-label="Desplazar a la izquierda"
                    className="w-9 h-9 rounded-full border border-white/15 text-white hover:bg-white/10"
                  >
                    ←
                  </button>

                  <button
                    type="button"
                    onClick={() => scrollResults(1)}
                    aria-label="Desplazar a la derecha"
                    className="w-9 h-9 rounded-full border border-white/15 text-white hover:bg-white/10"
                  >
                    →
                  </button>
                </div>
              )}
            </div>

            {error ? (
              <div className="rounded-xl border border-white/10 bg-black/30 p-4 text-white/60 text-sm">
                Ocurrió un problema. Intenta escribir de nuevo.
              </div>
            ) : loading ? (
              <div className="text-white/50 text-sm py-4">
                Buscando personajes...
              </div>
            ) : results.length === 0 ? (
              <div className="rounded-xl border border-white/10 bg-black/30 p-4 text-white/60 text-sm">
                No encontramos personajes con ese nombre o universo.
              </div>
            ) : (
              <div
                ref={trackRef}
                className="flex gap-3 overflow-x-auto pb-3 snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {results.map((item) => {
                  const isFavorite = favoriteIds.includes(item.id);

                  const href =
                    `/shop?personajeId=${encodeURIComponent(item.id)}` +
                    `&characterName=${encodeURIComponent(item.name)}`;

                  return (
                    <article
                      key={item.id}
                      className="shrink-0 w-[190px] sm:w-[220px] rounded-2xl overflow-hidden border border-white/10 bg-white/10 backdrop-blur-md snap-start"
                    >
                      <a href={href} className="block group/card">
                        <div className="relative h-[165px] sm:h-[180px] bg-black/40 overflow-hidden">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              loading="lazy"
                              className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/40 text-sm">
                              Sin imagen
                            </div>
                          )}

                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                        </div>
                      </a>

                      <div className="p-3 sm:p-4 flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <a
                            href={href}
                            title={item.name}
                            className="block text-white font-bold text-sm truncate hover:text-[#00eeff]"
                          >
                            {item.name}
                          </a>

                          {item.universe && (
                            <p className="text-white/60 text-xs mt-1 truncate">
                              {item.universe}
                            </p>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleFavorite(item)}
                          aria-label={
                            isFavorite
                              ? "Quitar de favoritos"
                              : "Añadir a favoritos"
                          }
                          className={`shrink-0 text-xl leading-none ${
                            isFavorite
                              ? "text-red-500"
                              : "text-white/80 hover:text-red-400"
                          }`}
                        >
                          {isFavorite ? "♥" : "♡"}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-[60] rounded-full border border-white/10 bg-black/90 px-4 py-3 text-sm text-white shadow-xl">
          {toast}
        </div>
      )}
    </section>
  );
};

export default CharacterSearchD1;
