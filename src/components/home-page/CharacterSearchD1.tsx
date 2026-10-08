
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

type CharacterItem = {
  id: string;
  name: string;
  universe: string;
  image: string;
  href?: string;
};

type PanelPosition = {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
};

const FAVORITES_KEY = "favorite_characters";

export const CharacterSearchD1: React.FC = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CharacterItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [toast, setToast] = useState("");

  const [panelPosition, setPanelPosition] =
    useState<PanelPosition | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const requestRef = useRef(0);

  const hasQuery = query.trim().length >= 2;

  /* =========================================
     MONTAJE Y FAVORITOS
  ========================================= */

  useEffect(() => {
    setMounted(true);

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

  /* =========================================
     POSICIONAMIENTO DEL PORTAL
  ========================================= */

  const updatePanelPosition = useCallback(() => {
    const container = containerRef.current;

    if (!container) return;

    const rect = container.getBoundingClientRect();

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const margin = 12;
    const gap = 8;

    const availableWidth = Math.max(
      0,
      viewportWidth - margin * 2
    );

    const width = Math.min(rect.width, availableWidth);

    const left = Math.max(
      margin,
      Math.min(
        rect.left,
        viewportWidth - width - margin
      )
    );

    const desiredHeight = 440;

    const spaceBelow =
      viewportHeight - rect.bottom - gap - margin;

    const spaceAbove =
      rect.top - gap - margin;

    const openAbove =
      spaceBelow < 260 && spaceAbove > spaceBelow;

    const availableHeight = Math.max(
      0,
      openAbove ? spaceAbove : spaceBelow
    );

    const maxHeight = Math.min(
      desiredHeight,
      availableHeight
    );

    const top = openAbove
      ? Math.max(
          margin,
          rect.top - gap - maxHeight
        )
      : rect.bottom + gap;

    setPanelPosition({
      top,
      left,
      width,
      maxHeight,
    });
  }, []);

  useLayoutEffect(() => {
    if (!isOpen || !mounted) return;

    updatePanelPosition();

    window.addEventListener(
      "resize",
      updatePanelPosition
    );

    window.addEventListener(
      "scroll",
      updatePanelPosition,
      true
    );

    return () => {
      window.removeEventListener(
        "resize",
        updatePanelPosition
      );

      window.removeEventListener(
        "scroll",
        updatePanelPosition,
        true
      );
    };
  }, [isOpen, mounted, updatePanelPosition]);

  /* =========================================
     CERRAR AL HACER CLIC FUERA O ESCAPE
  ========================================= */

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;

      const insideSearch =
        containerRef.current?.contains(target);

      const insidePanel =
        panelRef.current?.contains(target);

      if (!insideSearch && !insidePanel) {
        setIsOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    document.addEventListener(
      "pointerdown",
      onPointerDown
    );

    document.addEventListener(
      "keydown",
      onKeyDown
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        onPointerDown
      );

      document.removeEventListener(
        "keydown",
        onKeyDown
      );
    };
  }, []);

  /* =========================================
     BUSQUEDA BAJO DEMANDA
  ========================================= */

  useEffect(() => {
    const q = query.trim();

    const requestId = ++requestRef.current;

    if (q.length < 2) {
      setResults([]);
      setLoading(false);
      setError(false);
      setIsOpen(false);
      return;
    }

    const controller = new AbortController();

    setLoading(true);
    setError(false);
    setResults([]);
    setIsOpen(true);

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

        if (requestId !== requestRef.current) {
          return;
        }

        setResults(
          Array.isArray(data.results)
            ? data.results
            : []
        );
      } catch {
        if (controller.signal.aborted) return;

        if (requestId !== requestRef.current) {
          return;
        }

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

  /* =========================================
     FAVORITOS
  ========================================= */

  const toggleFavorite = useCallback(
    (item: CharacterItem) => {
      setFavoriteIds((previous) => {
        const exists = previous.includes(item.id);

        const next = exists
          ? previous.filter(
              (id) => id !== item.id
            )
          : [...previous, item.id];

        try {
          localStorage.setItem(
            FAVORITES_KEY,
            JSON.stringify(next)
          );
        } catch {
          // Almacenamiento no disponible.
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

  useEffect(() => {
    if (!toast) return;

    const timer = window.setTimeout(
      () => setToast(""),
      1800
    );

    return () => window.clearTimeout(timer);
  }, [toast]);

  /* =========================================
     CONTROLES
  ========================================= */

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const scrollResults = (direction: number) => {
    trackRef.current?.scrollBy({
      left: direction * 260,
      behavior: "smooth",
    });
  };

  /* =========================================
     PANEL GLASS FLOTANTE
  ========================================= */

  const panel =
    mounted &&
    isOpen &&
    hasQuery &&
    panelPosition &&
    panelPosition.maxHeight > 0
      ? createPortal(
          <div
            ref={panelRef}
            id="explorar-search-results"
            role="region"
            aria-label="Coincidencias de personajes"
            className="
              fixed
              z-[9999]
              rounded-2xl
              border border-white/20
              bg-[#101820]/85
              backdrop-blur-2xl
              backdrop-saturate-150
              shadow-[0_24px_80px_rgba(0,0,0,0.75)]
              ring-1 ring-[#00eeff]/10
              overflow-hidden
            "
            style={{
              top: panelPosition.top,
              left: panelPosition.left,
              width: panelPosition.width,
              maxHeight: panelPosition.maxHeight,
            }}
          >
            <div
              className="p-4 sm:p-5 overflow-y-auto"
              style={{
                maxHeight: panelPosition.maxHeight,
              }}
            >
              <div className="flex items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-white font-black text-sm">
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
                            results.length === 1
                              ? ""
                              : "s"
                          }`}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {results.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          scrollResults(-1)
                        }
                        aria-label="Desplazar resultados a la izquierda"
                        className="w-8 h-8 rounded-full border border-white/15 text-white hover:bg-white/10"
                      >
                        ←
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          scrollResults(1)
                        }
                        aria-label="Desplazar resultados a la derecha"
                        className="w-8 h-8 rounded-full border border-white/15 text-white hover:bg-white/10"
                      >
                        →
                      </button>
                    </>
                  )}

                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    aria-label="Cerrar resultados"
                    className="w-8 h-8 rounded-full border border-white/15 text-white/60 hover:text-white hover:bg-white/10"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {error ? (
                <div className="py-5 text-white/60 text-sm">
                  Ocurrió un problema. Intenta escribir
                  de nuevo.
                </div>
              ) : loading ? (
                <div className="py-5 text-white/50 text-sm">
                  Buscando personajes...
                </div>
              ) : results.length === 0 ? (
                <div className="py-5 text-white/60 text-sm">
                  No encontramos coincidencias.
                </div>
              ) : (
                <div
                  ref={trackRef}
                  className="
                    flex gap-3
                    overflow-x-auto
                    pb-2
                    snap-x snap-mandatory
                    scroll-smooth
                    [scrollbar-width:none]
                    [&::-webkit-scrollbar]:hidden
                  "
                >
                  {results.map((item) => {
                    const isFavorite =
                      favoriteIds.includes(item.id);

                    const href =
                      `/shop?personajeId=${encodeURIComponent(
                        item.id
                      )}` +
                      `&characterName=${encodeURIComponent(
                        item.name
                      )}`;

                    return (
                      <article
                        key={item.id}
                        className="
                          shrink-0
                          w-[175px] sm:w-[190px]
                          rounded-xl
                          overflow-hidden
                          border border-white/15
                          bg-[#242424]/90
                          snap-start
                        "
                      >
                        <a
                          href={href}
                          className="block group/card"
                        >
                          <div className="relative h-[165px] sm:h-[175px] bg-black/40 overflow-hidden">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                loading="lazy"
                                className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-white/40 text-xs">
                                Sin imagen
                              </div>
                            )}
                          </div>
                        </a>

                        <div className="p-3 flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <a
                              href={href}
                              title={item.name}
                              className="block text-white font-bold text-xs truncate hover:text-[#00eeff]"
                            >
                              {item.name}
                            </a>

                            {item.universe && (
                              <p className="text-white/50 text-[10px] mt-1 truncate">
                                {item.universe}
                              </p>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              toggleFavorite(item)
                            }
                            aria-label={
                              isFavorite
                                ? "Quitar de favoritos"
                                : "Añadir a favoritos"
                            }
                            className={`shrink-0 text-lg leading-none ${
                              isFavorite
                                ? "text-red-500"
                                : "text-white/70 hover:text-red-400"
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
          </div>,
          document.body
        )
      : null;

  /* =========================================
     RENDER PRINCIPAL
  ========================================= */

  return (
    <>
      <div
        ref={containerRef}
        className="relative w-full min-w-0"
      >
        <div
          className="
            rounded-2xl
            border border-white/10
            bg-[#111111]
            px-4 py-4
            sm:px-5 sm:py-4
            shadow-[0_0_24px_rgba(0,0,0,0.25)]
          "
        >
          <label
            htmlFor="explorar-character-search"
            className="block text-white font-black text-[11px] uppercase tracking-[0.12em] mb-3"
          >
            Busca tu personaje
          </label>

          <div className="relative">
            <span
              aria-hidden="true"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#00eeff]"
            >
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-4-4" />
              </svg>
            </span>

            <input
              ref={inputRef}
              id="explorar-character-search"
              type="search"
              value={query}
              onFocus={() => {
                if (hasQuery) {
                  setIsOpen(true);
                }
              }}
              onChange={(event) => {
                setQuery(event.target.value);

                if (
                  event.target.value.trim().length >= 2
                ) {
                  setIsOpen(true);
                }
              }}
              placeholder="Batman, Wolverine, Dragon Ball..."
              autoComplete="off"
              aria-expanded={isOpen && hasQuery}
              aria-controls="explorar-search-results"
              className="
                w-full h-11
                rounded-full
                border border-white/15
                bg-black
                text-white
                placeholder:text-white/40
                pl-11 pr-12
                text-sm
                outline-none
                focus:border-[#00eeff]/60
                transition
              "
            />

            {query && (
              <button
                type="button"
                onClick={clearSearch}
                aria-label="Limpiar búsqueda"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          <p className="text-white/40 text-[11px] mt-2">
            Selecciona un personaje para explorar sus
            modelos.
          </p>
        </div>
      </div>

      {panel}

      {mounted &&
        toast &&
        createPortal(
          <div className="fixed bottom-6 right-6 z-[10000] rounded-full border border-white/10 bg-black/95 px-4 py-3 text-sm text-white shadow-xl">
            {toast}
          </div>,
          document.body
        )}
    </>
  );
};

export default CharacterSearchD1;
