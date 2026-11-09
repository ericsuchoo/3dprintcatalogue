import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { Btn } from "../Btn";

type MediaLike = {
  url?: string;
  src?: string;
};

type CharacterItem = {
  id: string;
  slug?: string;
  name: string;
  image?: string;
  universe?: string;
  href?: string;
};

interface Props {
  title: string;
  description: string;
  image: MediaLike;
  cta: {
    label: string;
    href: string;
  };
  characters?: CharacterItem[];
}

function getImageSrc(media: MediaLike | null | undefined): string {
  if (!media) return "";
  if (typeof media.url === "string" && media.url.length > 0) return media.url;
  if (typeof media.src === "string" && media.src.length > 0) return media.src;
  return "";
}

function useDebouncedValue<T>(value: T, delay = 250) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebounced(value);
    }, delay);

    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

function CharacterMiniCard({
  item,
  isFavorite,
  onToggleFavorite,
}: {
  item: CharacterItem;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}) {
  // ESTE ES EL CAMBIO IMPORTANTE:
  // siempre mandamos al catálogo filtrado por personajeId
  const href = `/shop?personajeId=${encodeURIComponent(
    String(item.id)
  )}&characterName=${encodeURIComponent(String(item.name || ""))}`;

  return (
    <article className="min-w-[220px] max-w-[220px] rounded-2xl overflow-hidden border border-white/10 bg-white/10 backdrop-blur-md shadow-lg snap-start">
      <a href={href} className="block group/card">
        <div className="relative h-[180px] bg-black/30 overflow-hidden">
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/60 text-sm">
              Sin imagen
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
        </div>
      </a>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <a
              href={href}
              className="block text-white font-bold text-base leading-tight truncate hover:text-orange-400 transition-colors"
              title={item.name}
            >
              {item.name}
            </a>

            {item.universe ? (
              <p className="text-white/70 text-sm mt-1 truncate">
                {item.universe}
              </p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => onToggleFavorite(String(item.id))}
            aria-label={isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"}
            className={`shrink-0 text-xl leading-none transition-transform hover:scale-110 ${
              isFavorite ? "text-red-500" : "text-white/80"
            }`}
          >
            {isFavorite ? "♥" : "♡"}
          </button>
        </div>
      </div>
    </article>
  );
}

function ResultsSlider({
  items,
  favoriteIds,
  onToggleFavorite,
}: {
  items: CharacterItem[];
  favoriteIds: string[];
  onToggleFavorite: (id: string) => void;
}) {
  const trackRef = useRef<HTMLDivElement | null>(null);

  const scrollByAmount = useCallback((direction: "left" | "right") => {
    const el = trackRef.current;
    if (!el) return;

    const amount = 260;
    el.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  }, []);

  return (
    <div className="relative">
      <div className="absolute right-0 -top-14 z-20 flex items-center gap-2">
        <button
          type="button"
          onClick={() => scrollByAmount("left")}
          className="h-10 w-10 rounded-full border border-white/15 bg-black/40 text-white backdrop-blur-md hover:bg-black/60 transition"
          aria-label="Desplazar a la izquierda"
        >
          ←
        </button>
        <button
          type="button"
          onClick={() => scrollByAmount("right")}
          className="h-10 w-10 rounded-full border border-white/15 bg-black/40 text-white backdrop-blur-md hover:bg-black/60 transition"
          aria-label="Desplazar a la derecha"
        >
          →
        </button>
      </div>

      <div
        ref={trackRef}
        className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item) => (
          <CharacterMiniCard
            key={item.id}
            item={item}
            isFavorite={favoriteIds.includes(String(item.id))}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>
    </div>
  );
}

export const HomeCta: React.FC<Props> = ({
  title,
  description,
  image,
  cta,
  characters: _characters = [],
}) => {
  const imageSrc = getImageSrc(image);

  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 250);

  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<CharacterItem[]>([]);
  const [favoriteResults, setFavoriteResults] = useState<CharacterItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [favoritesLoaded, setFavoritesLoaded] = useState(false);
  const favoritesInitialized = useRef(false);
  const knownCharacters = useRef(new Map<string, CharacterItem>());
  const [toast, setToast] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("favorite_characters");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setFavoriteIds(parsed.map(String));
        }
      }
    } catch (error) {
      console.error("No se pudieron cargar favoritos:", error);
    } finally {
      favoritesInitialized.current = true;
      setFavoritesLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!favoritesInitialized.current) return;
    try {
      localStorage.setItem("favorite_characters", JSON.stringify(favoriteIds));
    } catch (error) {
      console.error("No se pudieron guardar favoritos:", error);
    }
  }, [favoriteIds]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 1800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  // El endpoint existente mantiene la busqueda por nombre y universo.
  // AbortController evita que respuestas antiguas sustituyan una busqueda nueva.
  useEffect(() => {
    const q = debouncedQuery.trim();
    if (q.length < 2) {
      setSearchResults([]);
      setSearching(false);
      return;
    }
    const controller = new AbortController();
    setSearching(true);
    fetch(`/api/buscar-personajes?q=${encodeURIComponent(q)}`, {
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error("Busqueda no disponible");
        return response.json();
      })
      .then((data: { results?: CharacterItem[] }) => {
        const items = Array.isArray(data.results) ? data.results : [];
        for (const item of items) knownCharacters.current.set(String(item.id), item);
        setSearchResults(items);
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          console.error("No se pudieron buscar personajes:", error);
          setSearchResults([]);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setSearching(false);
      });
    return () => controller.abort();
  }, [debouncedQuery]);

  // Consultar solamente los favoritos guardados, nunca el catalogo entero.
  useEffect(() => {
    if (!favoritesLoaded || favoriteIds.length === 0) {
      setFavoriteResults([]);
      return;
    }
    const controller = new AbortController();
    const ids = favoriteIds;
    const batches: string[][] = [];
    for (let i = 0; i < ids.length; i += 100) batches.push(ids.slice(i, i + 100));
    Promise.all(batches.map(async (batch) => {
      const response = await fetch(`/api/personajes-por-ids?ids=${encodeURIComponent(batch.join(","))}`, {
        signal: controller.signal,
      });
      if (!response.ok) throw new Error("Favoritos no disponibles");
      return response.json() as Promise<{ results?: CharacterItem[] }>;
    }))
      .then((pages) => ({ results: pages.flatMap((page) => page.results || []) }))
      .then((data: { results?: CharacterItem[] }) => {
        const items = Array.isArray(data.results) ? data.results : [];
        for (const item of items) knownCharacters.current.set(String(item.id), item);
        const byId = new Map(items.map((item) => [String(item.id), item]));
        setFavoriteResults(ids.map((id) => byId.get(id)).filter(Boolean) as CharacterItem[]);
      })
      .catch((error) => {
        if (!controller.signal.aborted) console.error("Error cargando favoritos:", error);
      });
    return () => controller.abort();
  }, [favoriteIds, favoritesLoaded]);

  const filteredCharacters = searchResults;
  const favoriteCharacters = favoriteResults;

  const toggleFavorite = useCallback((id: string) => {
    const selected = knownCharacters.current.get(String(id));
    setFavoriteIds((prev) => {
      const exists = prev.includes(id);
      if (selected) setToast(`${exists ? "Quitado de" : "Anadido a"} favoritos: ${selected.name}`);
      return exists ? prev.filter((favId) => favId !== id) : [...prev, id];
    });
  }, []);

  const hasQuery = query.trim().length > 0;

  return (
    <section className="relative overflow-hidden group">
      <div className="container relative z-10 py-20 md:py-32">
        <div className="max-w-[900px]">
          <h2 className="text-white text-[32px] leading-tight font-bold mb-4 md:text-[48px] font-Helvetica drop-shadow-lg">
            {title}
          </h2>

          <p className="text-white/90 text-lg leading-snug mb-8 md:text-xl font-Helvetica drop-shadow-md">
            {description}
          </p>

          <div className="mb-8 rounded-3xl border border-white/10 bg-black/30 backdrop-blur-md p-4 md:p-5">
            <label
              htmlFor="character-search"
              className="block text-white font-semibold text-sm md:text-base mb-3"
            >
              Busca por personaje o universo
            </label>

            <div className="relative">
              <input
                id="character-search"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ej: Batman, Darth Vader, Dragon Ball..."
                className="w-full rounded-full border border-white/15 bg-black/40 text-white placeholder:text-white/50 px-5 py-4 pr-14 outline-none backdrop-blur-md focus:border-white/40"
              />

              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Limpiar búsqueda"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition"
                >
                  ✕
                </button>
              )}
            </div>

            <p className="text-white/60 text-sm mt-3">
              Al pulsar sobre un personaje irás al catálogo filtrado por esa
              selección.
            </p>
          </div>

          {hasQuery && (
            <div className="mb-10">
              <div className="flex items-center justify-between gap-4 mb-4 pr-[92px]">
                <h3 className="text-white text-xl md:text-2xl font-bold">
                  Coincidencias
                </h3>
                <span className="text-white/70 text-sm">
                  {filteredCharacters.length} resultado
                  {filteredCharacters.length === 1 ? "" : "s"}
                </span>
              </div>

              {filteredCharacters.length > 0 ? (
                <ResultsSlider
                  items={filteredCharacters}
                  favoriteIds={favoriteIds}
                  onToggleFavorite={toggleFavorite}
                />
              ) : (
                <div className="rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-white/80 backdrop-blur-md">
                  {searching || query.trim() !== debouncedQuery.trim()
                    ? "Buscando personajes..."
                    : query.trim().length < 2
                      ? "Escribe al menos dos caracteres."
                      : "No hemos encontrado personajes con ese nombre o universo."}
                </div>
              )}
            </div>
          )}

          <div className="mb-10">
            <div className="flex items-center justify-between gap-4 mb-4 pr-[92px]">
              <h3 className="text-white text-xl md:text-2xl font-bold">
                Mis personajes favoritos
              </h3>
              <span className="text-white/70 text-sm">
                {favoriteCharacters.length} guardado
                {favoriteCharacters.length === 1 ? "" : "s"}
              </span>
            </div>

            {favoriteCharacters.length > 0 ? (
              <ResultsSlider
                items={favoriteCharacters}
                favoriteIds={favoriteIds}
                onToggleFavorite={toggleFavorite}
              />
            ) : (
              <div className="rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-white/80 backdrop-blur-md">
                Todavía no has añadido favoritos. Busca un personaje y pulsa el
                corazón.
              </div>
            )}
          </div>

          <div className="inline-block">
            <Btn theme="orange" label={cta.label} to={cta.href} />
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-[60] rounded-full border border-white/10 bg-black/80 px-4 py-3 text-sm text-white shadow-xl backdrop-blur-md">
          {toast}
        </div>
      )}

      <div className="absolute top-0 left-0 size-full z-0">
        <div className="absolute inset-0 bg-black/50 z-10 transition-opacity duration-500 group-hover:opacity-40" />
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={title || "CTA image"}
            className="size-full object-cover transition-transform duration-[1500ms] group-hover:scale-110"
          />
        ) : (
          <div className="size-full bg-black" />
        )}
      </div>
    </section>
  );
};