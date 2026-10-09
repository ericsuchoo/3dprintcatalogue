
import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import SearchIcon from "../../../assets/icons/search.svg?raw";
import { FormCheck } from "../../form/Check";
import { ProductCardD1 as ProductCard } from "../../ProductCardD1";

import type {
  ShopPageDataD1,
  ProductLiteD1,
} from "../../../types/shop-d1";

import { useFavorites } from "../../../context/FavoritesContext";

export interface ProductFilterD1 {
  type:
    | "personaje"
    | "universo"
    | "proveedor"
    | "price"
    | "popularity";
  label: string;
  value: string;
  active: boolean;
}

type CharacterSuggestion = {
  id: string;
  title: string;
  href: string;
  universe?: string;
  tags?: string[];
  matchType?: "personaje" | "universo" | "etiqueta" | "general";
};

type CharacterSuggestionMatchType =
  | "personaje"
  | "universo"
  | "etiqueta"
  | "general";

type CharacterSuggestionResolved = CharacterSuggestion & {
  matchType: CharacterSuggestionMatchType;
};

type CharacterApiResponse = {
  results?: CharacterSuggestion[];
  page?: number;
  hasMore?: boolean;
  error?: string;
};

interface Props {
  data: ShopPageDataD1 & {
    personajeNombre?: string | null;
    universoNombre?: string | null;
    proveedorNombre?: string | null;
    activeFilterLabels?: string[];
    clearFilterHref?: string | null;
    initialPersonajeId?: string | null;
    initialUniversoId?: string | null;
    initialProveedorId?: string | null;
    initialSort?: "newest" | "price_asc" | "price_desc";
    selectedCharacter?: {
      id: string;
      name: string;
    } | null;
    quickCharacterSuggestions?: CharacterSuggestion[];
    pagination?: {
      currentPage: number;
      totalPages: number;
      totalProducts: number;
      itemsPerPage: number;
      pageCount?: number;
      basePath: string;
      personajeId?: string | null;
      universoId?: string | null;
      proveedorId?: string | null;
      sort?: "newest" | "price_asc" | "price_desc";
    };
  };
  favoritesOnly?: boolean;
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function getMatchLabel(matchType: CharacterSuggestionMatchType) {
  if (matchType === "personaje") return "Coincide por personaje";
  if (matchType === "universo") return "Coincide por universo";
  if (matchType === "etiqueta") return "Coincide por etiqueta";
  return "Coincidencia relacionada";
}

function resolvePriceMode(product: ProductLiteD1) {
  if (product.priceMode) return product.priceMode;
  return product.price && Number(product.price) > 0
    ? "fixed"
    : "quote";
}

function formatCompactMoney(value: number | null | undefined) {
  if (
    value === null ||
    value === undefined ||
    !Number.isFinite(Number(value))
  ) {
    return "";
  }

  return `$${Number(value).toFixed(0)}`;
}

export const Main: React.FC<Props> = ({
  data,
  favoritesOnly = false,
}) => {
  const { favorites } = useFavorites();

  const [characterSearch, setCharacterSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sidebarCharacterSearch, setSidebarCharacterSearch] = useState("");

  const [instagramCopied, setInstagramCopied] = useState(false);
  const [shareListCopied, setShareListCopied] = useState(false);
  const [shareListLoading, setShareListLoading] = useState(false);

  /*
   * NUEVO:
   * Personajes bajo demanda.
   */
  const [sidebarCharacters, setSidebarCharacters] = useState<
    CharacterSuggestion[]
  >([]);

  const [sidebarPage, setSidebarPage] = useState(1);
  const [sidebarSearchPage, setSidebarSearchPage] = useState(1);
const [sidebarSearchHasMore, setSidebarSearchHasMore] = useState(false);
  const [sidebarHasMore, setSidebarHasMore] = useState(false);
  const [sidebarLoading, setSidebarLoading] = useState(false);
  const [sidebarError, setSidebarError] = useState(false);

  const [characterSuggestions, setCharacterSuggestions] = useState<
    CharacterSuggestionResolved[]
  >([]);

  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [suggestionsError, setSuggestionsError] = useState(false);

  const [filters, setFilters] = useState<ProductFilterD1[]>([
    {
      active: false,
      type: "price",
      label: "Lowest",
      value: "price_asc",
    },
    {
      active: false,
      type: "price",
      label: "Most expensive",
      value: "price_desc",
    },
    {
      active: false,
      type: "popularity",
      label: "New comer",
      value: "newest",
    },
  ]);

  const filterTitleClass =
    "inline-block pb-2 border-b-2 border-[#00eeff] text-[11px] uppercase tracking-[0.18em] text-zinc-200 font-black shadow-[0_8px_18px_rgba(0,238,255,0.16)]";

  /*
   * FILTROS ESTATICOS:
   * Universos, proveedores y orden.
   *
   * Los personajes ya no se cargan todos.
   */
  useEffect(() => {
    const universosFilters: ProductFilterD1[] =
      (data.categories || []).map((u) => ({
        active:
          String(u.slug) === String(data.initialUniversoId ?? ""),
        label: u.title,
        value: String(u.slug),
        type: "universo",
      }));

    const proveedoresFilters: ProductFilterD1[] =
      (data.brands || []).map((b) => ({
        active:
          String(b.slug) === String(data.initialProveedorId ?? ""),
        label: b.title,
        value: String(b.slug),
        type: "proveedor",
      }));

    setFilters([
      {
        active: data.initialSort === "price_asc",
        type: "price",
        label: "Lowest",
        value: "price_asc",
      },
      {
        active: data.initialSort === "price_desc",
        type: "price",
        label: "Most expensive",
        value: "price_desc",
      },
      {
        active: data.initialSort === "newest",
        type: "popularity",
        label: "New comer",
        value: "newest",
      },
      ...proveedoresFilters,
      ...universosFilters,
    ]);
  }, [
    data.categories,
    data.brands,
    data.initialUniversoId,
    data.initialProveedorId,
    data.initialSort,
  ]);

  /*
   * CARGA PAGINADA DEL FILTRO LATERAL.
   *
   * No consulta D1 hasta que el usuario
   * abre los filtros.
   */

useEffect(() => {
  // En escritorio el filtro siempre está visible.
  // En móvil solamente se carga al abrir el modal.
  const desktop =
    typeof window !== "undefined" &&
    window.matchMedia("(min-width: 1280px)").matches;

  if (!desktop && !filtersOpen) return;

  // Si hay una búsqueda activa, el otro efecto
  // se encarga de recuperar las coincidencias.
  if (sidebarCharacterSearch.trim().length >= 2) return;

  const controller = new AbortController();

  const load = async () => {
    setSidebarLoading(true);
    setSidebarError(false);

    try {
      const params = new URLSearchParams({
        mode: "list",
        page: String(sidebarPage),
      });

      const response = await fetch(
        `/api/shop/personajes?${params.toString()}`,
        { signal: controller.signal }
      );

      if (!response.ok) {
        throw new Error("Error de personajes");
      }

      const json =
        (await response.json()) as CharacterApiResponse;

      if (controller.signal.aborted) return;

      const incoming = json.results || [];

      setSidebarCharacters((previous) => {
        if (sidebarPage === 1) return incoming;

        const byId = new Map(
          previous.map((item) => [item.id, item])
        );

        for (const item of incoming) {
          byId.set(item.id, item);
        }

        return Array.from(byId.values());
      });

      setSidebarHasMore(Boolean(json.hasMore));
    } catch {
      if (!controller.signal.aborted) {
        setSidebarError(true);
      }
    } finally {
      if (!controller.signal.aborted) {
        setSidebarLoading(false);
      }
    }
  };

  void load();

  return () => controller.abort();
}, [
  filtersOpen,
  sidebarPage,
  sidebarCharacterSearch,
]);

  /*
   * BUSCADOR SUPERIOR.
   *
   * Espera 300 ms antes de consultar.
   */
  useEffect(() => {
    const query = characterSearch.trim();

    if (query.length < 2) {
      setCharacterSuggestions([]);
      setSuggestionsLoading(false);
      setSuggestionsError(false);
      return;
    }

    const controller = new AbortController();

    setSuggestionsLoading(true);
    setSuggestionsError(false);

    const timer = window.setTimeout(async () => {
      try {
   const params = new URLSearchParams({
  mode: "search",
  q: query,
});

        const response = await fetch(
          `/api/shop/personajes?${params.toString()}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("Error de búsqueda");
        }

        const json =
          (await response.json()) as CharacterApiResponse;

        if (controller.signal.aborted) return;

        setCharacterSuggestions(
          (json.results || [])
            .map((item) => ({
              ...item,
              matchType: item.matchType || "general",
            }))
            .slice(0, 4)
        );
      } catch {
        if (!controller.signal.aborted) {
          setSuggestionsError(true);
          setCharacterSuggestions([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setSuggestionsLoading(false);
        }
      }
    }, 300);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [characterSearch]);

  /*
   * BUSCADOR DEL FILTRO LATERAL.
   *
   * Usa el mismo endpoint.
   */

useEffect(() => {
  const desktop =
    typeof window !== "undefined" &&
    window.matchMedia("(min-width: 1280px)").matches;

  if (!desktop && !filtersOpen) return;

  const query = sidebarCharacterSearch.trim();

  if (query.length < 2) return;

  const controller = new AbortController();

  setSidebarLoading(true);
  setSidebarError(false);
 if (sidebarSearchPage === 1) {
  setSidebarCharacters([]);
}

  const timer = window.setTimeout(async () => {
    try {
      const params = new URLSearchParams({
        mode: "search",
        q: query,
        page: String(sidebarSearchPage),
      });

      const response = await fetch(
        `/api/shop/personajes?${params.toString()}`,
        { signal: controller.signal }
      );

      if (!response.ok) {
        throw new Error("Error de búsqueda");
      }

      const json =
        (await response.json()) as CharacterApiResponse;

      if (controller.signal.aborted) return;

    setSidebarCharacters((previous) =>
  sidebarSearchPage === 1
    ? json.results || []
    : [
        ...previous,
        ...(json.results || []).filter(
          (item) => !previous.some((p) => p.id === item.id)
        ),
      ]
);

setSidebarSearchHasMore(Boolean(json.hasMore));
    } catch {
      if (!controller.signal.aborted) {
        setSidebarError(true);
      }
    } finally {
      if (!controller.signal.aborted) {
        setSidebarLoading(false);
      }
    }
  }, 300);

  return () => {
    window.clearTimeout(timer);
    controller.abort();
  };
}, [filtersOpen, sidebarCharacterSearch, sidebarSearchPage]);

  /*
   * BLOQUEO DE SCROLL DEL MODAL.
   */
  useEffect(() => {
    if (!filtersOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [filtersOpen]);

  const activeFilters = useMemo(
    () => filters.filter((f) => f.active),
    [filters]
  );

  const hasActiveFilters =
    activeFilters.length > 0 ||
    !!data.initialPersonajeId ||
    !!data.initialUniversoId ||
    !!data.initialProveedorId ||
    data.initialSort !== "newest";

  const buildUrl = (next: {
    personajeId?: string | null;
    universoId?: string | null;
    proveedorId?: string | null;
    sort?: string | null;
    page?: number | null;
    tipoProducto?: string | null;
  }) => {
    const params = new URLSearchParams();

    const personajeId =
      next.personajeId !== undefined
        ? next.personajeId
        : data.pagination?.personajeId ?? null;

    const universoId =
      next.universoId !== undefined
        ? next.universoId
        : data.pagination?.universoId ?? null;

    const proveedorId =
      next.proveedorId !== undefined
        ? next.proveedorId
        : data.pagination?.proveedorId ?? null;

    const sort =
      next.sort ?? data.pagination?.sort ?? "newest";

    const page = next.page ?? null;

    const tipoProducto =
      next.tipoProducto ??
      (typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get(
            "tipoProducto"
          )
        : null);

    if (personajeId) params.set("personajeId", personajeId);
    if (universoId) params.set("universoId", universoId);
    if (proveedorId) params.set("proveedorId", proveedorId);
    if (sort && sort !== "newest") params.set("sort", sort);
    if (page && page > 1) params.set("page", String(page));

    if (
      tipoProducto === "cosplay" ||
      tipoProducto === "figura"
    ) {
      params.set("tipoProducto", tipoProducto);
    }

    const query = params.toString();

    return `${data.pagination?.basePath || "/shop"}${
      query ? `?${query}` : ""
    }`;
  };

  const clearFilters = () => {
    if (favoritesOnly) {
      window.location.href = "/shop-2";
      return;
    }

    window.location.href =
      data.clearFilterHref || "/shop";
  };

  const favoriteProducts = useMemo(() => {
    const products = (data.products || []) as ProductLiteD1[];

    return products.filter((p) =>
      favorites.includes(String(p.slug))
    );
  }, [data.products, favorites]);

  const filteredProducts = useMemo(() => {
    const products = (data.products || []) as ProductLiteD1[];

    return products.filter((p) => {
      if (
        favoritesOnly &&
        !favorites.includes(String(p.slug))
      ) {
        return false;
      }

      return true;
    });
  }, [data.products, favorites, favoritesOnly]);

  const quotableVisibleProducts = useMemo(() => {
    return filteredProducts.filter((product) => {
      const mode = resolvePriceMode(product);
      return mode === "quote" || mode === "from";
    });
  }, [filteredProducts]);

  const instagramQuoteUrl =
    "https://www.instagram.com/dinocat3d/";

  const paintingStudioUrl =
    "https://www.instagram.com/dcpanitingstudio/";

  const instagramQuoteMessage = useMemo(() => {
    if (quotableVisibleProducts.length === 0) return "";

    const baseUrl =
      typeof window !== "undefined"
        ? window.location.origin
        : "https://3dprintcatalogue.pages.dev";

    const lines = quotableVisibleProducts.map(
      (product, index) => {
        const mode = resolvePriceMode(product);

        let modeLabel = "Cotizar";

        if (
          mode === "from" &&
          product.price &&
          Number(product.price) > 0
        ) {
          modeLabel = `Desde ${formatCompactMoney(
            product.price
          )}`;
        }

        return `${index + 1}. ${product.title} — ${modeLabel}\n${baseUrl}/shop/${product.slug}`;
      }
    );

    return [
      "Hola, quiero solicitar cotización de esta selección de favoritos:",
      "",
      ...lines,
      "",
      "¿Me ayudas con precio según escala, acabado y opciones disponibles?",
    ].join("\n");
  }, [quotableVisibleProducts]);

  const handleInstagramQuote = async () => {
    if (
      !instagramQuoteMessage ||
      quotableVisibleProducts.length === 0
    ) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        instagramQuoteMessage
      );

      setInstagramCopied(true);

      window.open(
        instagramQuoteUrl,
        "_blank",
        "noopener,noreferrer"
      );

      window.setTimeout(
        () => setInstagramCopied(false),
        2200
      );
    } catch {
      window.open(
        instagramQuoteUrl,
        "_blank",
        "noopener,noreferrer"
      );
    }
  };

  const handleShareList = async () => {
    if (filteredProducts.length === 0) return;

    try {
      setShareListLoading(true);

      const response = await fetch(
        "/api/favoritos/compartir",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productIds: filteredProducts.map(
              (product) => product.id
            ),
          }),
        }
      );

      const result = await response.json();

      if (
        !response.ok ||
        !result?.ok ||
        !result?.url
      ) {
        throw new Error(
          result?.error ||
          "No se pudo compartir la lista"
        );
      }

      const publicUrl =
        typeof window !== "undefined"
          ? new URL(
              result.url,
              window.location.origin
            ).toString()
          : result.url;

      await navigator.clipboard.writeText(publicUrl);

      setShareListCopied(true);

      if (
        typeof navigator !== "undefined" &&
        navigator.share
      ) {
        try {
          await navigator.share({
            title: "Mis favoritos | DCimpress 3D",
            text: "Te comparto mi lista de favoritos.",
            url: publicUrl,
          });
        } catch {
          // Usuario canceló.
        }
      }

      window.setTimeout(
        () => setShareListCopied(false),
        2200
      );
    } catch (error) {
      console.error("[share-list]", error);
      alert("No se pudo generar la lista compartida.");
    } finally {
      setShareListLoading(false);
    }
  };

  const setProductFilter = (filter: ProductFilterD1) => {
    const currentPersonajeId =
      data.pagination?.personajeId ?? null;

    const currentUniversoId =
      data.pagination?.universoId ?? null;

    const currentProveedorId =
      data.pagination?.proveedorId ?? null;

    const currentSort =
      data.pagination?.sort ?? "newest";

    if (filter.type === "personaje") {
      const nextValue =
        currentPersonajeId === filter.value
          ? null
          : filter.value;

      window.location.href = buildUrl({
        personajeId: nextValue,
        page: 1,
      });

      return;
    }

    if (filter.type === "universo") {
      const nextValue =
        currentUniversoId === filter.value
          ? null
          : filter.value;

      window.location.href = buildUrl({
        universoId: nextValue,
        page: 1,
      });

      return;
    }

    if (filter.type === "proveedor") {
      const nextValue =
        currentProveedorId === filter.value
          ? null
          : filter.value;

      window.location.href = buildUrl({
        proveedorId: nextValue,
        page: 1,
      });

      return;
    }

    if (
      filter.type === "price" ||
      filter.type === "popularity"
    ) {
      const nextSort =
        currentSort === filter.value
          ? "newest"
          : filter.value;

      window.location.href = buildUrl({
        sort: nextSort,
        page: 1,
      });
    }
  };

  const currentPage =
    data.pagination?.currentPage || 1;

  const totalPages = favoritesOnly
    ? 1
    : data.pagination?.totalPages || 1;

  const totalProducts = favoritesOnly
    ? filteredProducts.length
    : data.pagination?.totalProducts ??
      filteredProducts.length;

  const itemsPerPage = favoritesOnly
    ? filteredProducts.length || 1
    : data.pagination?.itemsPerPage ||
      filteredProducts.length;

  const pageCount = favoritesOnly
    ? filteredProducts.length
    : data.pagination?.pageCount ??
      (data.products?.length || 0);

  const pageStart =
    totalProducts === 0
      ? 0
      : (currentPage - 1) * itemsPerPage + 1;

  const pageEnd =
    totalProducts === 0
      ? 0
      : Math.min(
          (currentPage - 1) * itemsPerPage + pageCount,
          totalProducts
        );

  const buildPageHref = (page: number) =>
    buildUrl({ page });

  const getVisiblePages = () => {
    const pages: number[] = [];
    const maxVisible = 5;

    let start = Math.max(1, currentPage - 2);
    let end = Math.min(
      totalPages,
      start + maxVisible - 1
    );

    if (end - start + 1 < maxVisible) {
      start = Math.max(
        1,
        end - maxVisible + 1
      );
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  /*
   * Los filtros laterales ahora proceden
   * de los resultados obtenidos bajo demanda.
   */
  const sidebarCharacterFilters = useMemo(() => {
    return sidebarCharacters.map((item) => ({
      type: "personaje" as const,
      label: item.title,
      value: item.id,
      active:
        item.id ===
        String(data.initialPersonajeId ?? ""),
    }));
  }, [sidebarCharacters, data.initialPersonajeId]);

  /*
   * CONTINUA EN PARTE 2:
   *
   * const renderFiltersContent = () => (
   *
   * Aquí colocaremos el JSX completo y
   * las adaptaciones del filtro lateral.
   */

  const selectedCharacterName =
    data.selectedCharacter?.name ||
    data.personajeNombre ||
    null;

  const renderFiltersContent = () => (
    <div className="grid grid-cols-1 gap-6 border border-[#00eeff] p-4 sm:p-5 md:p-6 bg-[#0f0f0f] rounded-2xl backdrop-blur-sm shadow-[0_0_30px_rgba(0,238,255,0.08)]">

      <div className="flex items-center justify-between gap-3">
        <div className="text-[18px] sm:text-[20px] leading-none font-bold italic text-red-500">
          {favoritesOnly ? "Mis Me gusta" : "Filtros"}
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center justify-center px-3 py-2 rounded-full border border-red-500/40 text-red-400 hover:text-white hover:border-red-500 transition uppercase tracking-[0.16em] font-black text-[9px] bg-red-500/10 hover:bg-red-500/20"
          >
            Quitar filtros
          </button>
        )}
      </div>

      {favoritesOnly && (
        <>
          <div className="text-sm text-zinc-400 leading-relaxed">
            Aquí puedes revisar tus productos guardados, buscar dentro de tu selección y enviarnos solo lo que quieras cotizar.
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/10 bg-black px-4 py-3">
              <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500 font-black mb-2">
                Guardados
              </div>
              <div className="text-3xl font-black text-white leading-none">
                {favoriteProducts.length}
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-black px-4 py-3">
              <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500 font-black mb-2">
                Visibles
              </div>
              <div className="text-3xl font-black text-white leading-none">
                {filteredProducts.length}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[#00eeff]/20 bg-black px-4 py-3">
            <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500 font-black mb-2">
              Por cotizar
            </div>
            <div className="text-3xl font-black text-[#00eeff] leading-none">
              {quotableVisibleProducts.length}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <button
              type="button"
              onClick={handleInstagramQuote}
              disabled={quotableVisibleProducts.length === 0}
              className={`inline-flex items-center justify-center px-4 py-3 rounded-full border transition uppercase tracking-[0.18em] font-black text-[10px] ${
                quotableVisibleProducts.length > 0
                  ? "border-[#00eeff]/40 text-[#00eeff] hover:text-white hover:border-[#00eeff] bg-[#00eeff]/10 hover:bg-[#00eeff]/20"
                  : "pointer-events-none border-white/10 text-white/30 bg-white/5"
              }`}
            >
              {instagramCopied
                ? "Mensaje copiado"
                : "Compártenos tus favoritos para cotizar"}
            </button>

            <div className="text-[11px] leading-relaxed text-zinc-500 text-center -mt-1">
              Copiamos tu selección visible y abrimos Instagram para que nos la pegues en DM.
            </div>

            <a
              href={paintingStudioUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center px-4 py-3 rounded-full border border-fuchsia-500/30 text-fuchsia-300 hover:text-white hover:border-fuchsia-400 transition uppercase tracking-[0.18em] font-black text-[10px] bg-fuchsia-500/10 hover:bg-fuchsia-500/20"
            >
              Ver estudio de pintura
            </a>

            <button
              type="button"
              onClick={handleShareList}
              disabled={shareListLoading || filteredProducts.length === 0}
              className={`inline-flex items-center justify-center px-4 py-3 rounded-full border transition uppercase tracking-[0.18em] font-black text-[10px] ${
                shareListLoading || filteredProducts.length === 0
                  ? "pointer-events-none border-white/10 text-white/30 bg-white/5"
                  : "border-white/15 text-white/85 hover:text-white hover:border-white/35 bg-white/5 hover:bg-white/10"
              }`}
            >
              {shareListLoading
                ? "Generando lista..."
                : shareListCopied
                  ? "Lista copiada"
                  : "Compartir lista con amigos"}
            </button>
          </div>
        </>
      )}

      {!favoritesOnly && filters.some((f) => f.type === "universo") && (
        <div>
          <div className={filterTitleClass}>Universos</div>
          <div className="grid grid-cols-1 gap-3 mt-4 text-[#fdfdfd]">
            {filters
              .filter((item) => item.type === "universo")
              .map((filter) => (
                <FormCheck
                  key={`universo-${filter.value}`}
                  value={filter.label}
                  label={filter.label}
                  onCheck={() => setProductFilter(filter)}
                  checked={filter.active}
                  size="sm"
                />
              ))}
          </div>
        </div>
      )}

      {!favoritesOnly && (
        <div>
          <div className={filterTitleClass}>Precio / orden</div>
          <div className="grid grid-cols-1 gap-3 mt-4 text-[#fdfdfd]">
            {filters
              .filter((item) => item.type === "price")
              .map((filter) => (
                <FormCheck
                  key={`price-${filter.value}`}
                  value={filter.label}
                  label={filter.label}
                  onCheck={() => setProductFilter(filter)}
                  checked={filter.active}
                  size="sm"
                />
              ))}
          </div>
        </div>
      )}

      {!favoritesOnly && (
        <div>
          <div className={filterTitleClass}>Novedad</div>
          <div className="grid grid-cols-1 gap-3 mt-4 text-[#fdfdfd]">
            {filters
              .filter((item) => item.type === "popularity")
              .map((filter) => (
                <FormCheck
                  key={`popularity-${filter.value}`}
                  value={filter.label}
                  label={filter.label}
                  onCheck={() => setProductFilter(filter)}
                  checked={filter.active}
                  size="sm"
                />
              ))}
          </div>
        </div>
      )}

      {/* PERSONAJES BAJO DEMANDA */}
      <div>
        <div className="flex items-center justify-between gap-3">
          <div className={filterTitleClass}>
            {favoritesOnly ? "Personajes guardados" : "Personajes"}
          </div>

          <span className="text-[10px] uppercase tracking-[0.18em] text-zinc-500 font-black">
            {sidebarCharacterFilters.length}
          </span>
        </div>

        <label className="mt-4 flex items-center px-4 border border-white/10 bg-black rounded-xl">
          <div
            dangerouslySetInnerHTML={{ __html: SearchIcon }}
            className="w-[14px] h-[14px] text-zinc-500"
          />

          <input
            type="search"
            value={sidebarCharacterSearch}
            onChange={(event) => {
  setSidebarCharacterSearch(event.target.value);
  setSidebarPage(1);
  setSidebarSearchPage(1);
  setSidebarSearchHasMore(false);
  setSidebarCharacters([]);
}}
            placeholder="Filtrar personajes..."
            className="bg-transparent px-2 py-3 w-full text-xs text-white placeholder:text-zinc-500 focus:outline-none"
          />
        </label>

        <div className="grid grid-cols-1 gap-3 mt-4 text-[#fdfdfd] max-h-[320px] overflow-y-auto pr-1">
          {sidebarCharacterFilters.map((filter) => (
            <FormCheck
              key={`personaje-${filter.value}`}
              value={filter.label}
              label={filter.label}
              onCheck={() => setProductFilter(filter)}
              checked={filter.active}
              size="sm"
            />
          ))}

          {sidebarLoading && (
            <div className="text-xs text-zinc-500 py-3">
              Cargando personajes...
            </div>
          )}

          {sidebarError && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-3 py-4 text-xs text-red-400">
              No se pudieron cargar los personajes.
            </div>
          )}

          {!sidebarLoading &&
            !sidebarError &&
            sidebarCharacterFilters.length === 0 && (
              <div className="rounded-xl border border-white/10 bg-black px-3 py-4 text-xs text-zinc-500">
                No encontramos personajes en este filtro.
              </div>
            )}

          
{!sidebarLoading &&
  !sidebarError &&
  (
    sidebarCharacterSearch.trim().length >= 2
      ? sidebarSearchHasMore
      : sidebarHasMore
  ) && (
    <button
      type="button"
      onClick={() => {
        if (sidebarCharacterSearch.trim().length >= 2) {
          setSidebarSearchPage((page) => page + 1);
        } else {
          setSidebarPage((page) => page + 1);
        }
      }}
      className="w-full rounded-xl border border-[#00eeff]/30 bg-[#00eeff]/5 px-4 py-3 text-xs font-black uppercase tracking-[0.15em] text-[#00eeff] hover:bg-[#00eeff]/10 transition"
    >
      Cargar más personajes
    </button>
  )}

        </div>
      </div>

      {!favoritesOnly && filters.some((f) => f.type === "proveedor") && (
        <div>
          <div className={filterTitleClass}>Creadores 3D</div>
          <div className="grid grid-cols-1 gap-3 mt-4 text-[#fdfdfd]">
            {filters
              .filter((item) => item.type === "proveedor")
              .map((filter) => (
                <FormCheck
                  key={`proveedor-${filter.value}`}
                  value={filter.label}
                  label={filter.label}
                  onCheck={() => setProductFilter(filter)}
                  checked={filter.active}
                  size="sm"
                />
              ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-[#0a0a0a] min-h-screen px-3 sm:px-4 md:px-6 pt-32 sm:pt-24 md:pt-24 pb-8">

      {/* BOTÓN DE FILTROS MÓVILES */}
      <div className="mt-3 mb-4 xl:hidden">
        <button
          type="button"
          onClick={() => setFiltersOpen(true)}
          className="inline-flex items-center justify-center px-4 py-3 rounded-full border border-[#00eeff]/40 text-[#00eeff] hover:text-white hover:border-[#00eeff] transition uppercase tracking-[0.18em] font-black text-[10px] bg-[#00eeff]/10"
        >
          Abrir filtros
        </button>
      </div>

      {/* MODAL DE FILTROS */}
      {filtersOpen && (
        <div className="xl:hidden fixed inset-0 z-[80] bg-black/80 backdrop-blur-sm">
          <div
            className="absolute inset-0"
            onClick={() => setFiltersOpen(false)}
          />

          <div className="absolute inset-y-0 left-0 w-full max-w-[92vw] bg-[#0a0a0a] border-r border-[#00eeff]/20 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between gap-3 px-4 py-4 border-b border-white/10 bg-[#0f0f0f]">
              <div className="text-white text-sm font-black uppercase tracking-[0.18em]">
                Filtros
              </div>

              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-white/10 text-white hover:border-red-500/40 hover:text-red-400 transition"
                aria-label="Cerrar filtros"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {renderFiltersContent()}
            </div>
          </div>
        </div>
      )}

      {/* CONTENIDO PRINCIPAL */}
      <div className="grid grid-cols-1 gap-6 xl:gap-7 items-start xl:grid-cols-[280px,minmax(0,1fr)]">

        {/* FILTROS ESCRITORIO */}
        <div className="hidden xl:block xl:sticky xl:top-28 self-start">
          {renderFiltersContent()}
        </div>

        <div className="min-w-0">

          {/* PERSONAJE SELECCIONADO */}
          {(selectedCharacterName ||
            data.activeFilterLabels?.length ||
            data.clearFilterHref) && (
            <div className="mb-5 flex flex-col gap-4">

              {selectedCharacterName && (
                <div className="rounded-2xl border border-red-500/20 bg-gradient-to-r from-red-500/10 via-[#111] to-[#111] px-4 sm:px-5 py-4 shadow-[0_0_30px_rgba(239,68,68,0.12)]">
                  <div className="text-[10px] md:text-[11px] uppercase tracking-[0.26em] text-zinc-400 font-black mb-2">
                    Explorando personaje
                  </div>

                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <h2 className="text-2xl md:text-3xl font-black uppercase italic text-white tracking-tight">
                      {selectedCharacterName}
                    </h2>

                    <a
                      href="/shop"
                      className="inline-flex items-center justify-center px-4 py-2 rounded-full border border-red-500/40 text-red-400 hover:text-white hover:border-red-500 transition uppercase tracking-[0.18em] font-black text-[9px] md:text-[10px] bg-red-500/10 hover:bg-red-500/20"
                    >
                      Ver todo el catálogo
                    </a>
                  </div>
                </div>
              )}

              {!selectedCharacterName &&
                Boolean(data.activeFilterLabels?.length) && (
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h2 className="text-2xl md:text-3xl font-black uppercase italic text-white tracking-tight">
                        Shop:{" "}
                        <span className="text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.6)]">
                          {data.activeFilterLabels?.join(" / ")}
                        </span>
                      </h2>
                    </div>

                    {data.clearFilterHref && (
                      <a
                        href={data.clearFilterHref}
                        className="inline-flex items-center justify-center px-4 py-2 rounded-full border border-red-500/40 text-red-400 hover:text-white hover:border-red-500 transition uppercase tracking-[0.18em] font-black text-[9px] md:text-[10px] bg-red-500/10 hover:bg-red-500/20"
                      >
                        Quitar filtros
                      </a>
                    )}
                  </div>
                )}
            </div>
          )}

          {/* BUSCADOR SUPERIOR */}
          {!favoritesOnly && (
            <div className="mb-5 rounded-2xl border border-white/10 bg-[#0f0f0f] px-4 sm:px-5 py-4">
              <div className="flex flex-col gap-4">

                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[10px] md:text-[11px] uppercase tracking-[0.26em] text-zinc-400 font-black mb-2">
                      Buscar personaje
                    </div>

                    <h3 className="text-white text-[15px] sm:text-[22px] md:text-[32px] leading-[1.05] font-black italic uppercase">
                      Salta directo al catálogo
                    </h3>
                  </div>

                  <div className="w-full lg:max-w-[360px]">
                    <label className="flex items-center px-4 border border-white/10 bg-black rounded-full min-h-[44px]">
                      <div
                        dangerouslySetInnerHTML={{ __html: SearchIcon }}
                        className="w-[14px] h-[14px] text-zinc-500"
                      />

                      <input
                        type="search"
                        value={characterSearch}
                        onChange={(event) =>
                          setCharacterSearch(event.target.value)
                        }
                        placeholder="Buscar personaje, universo o etiqueta..."
                        className="bg-transparent px-2 py-2.5 w-full text-xs md:text-sm text-white placeholder:text-zinc-500 focus:outline-none"
                      />

                      {characterSearch && (
                        <button
                          type="button"
                          onClick={() => setCharacterSearch("")}
                          className="text-[#3b82f6] hover:text-white transition text-sm leading-none"
                          aria-label="Limpiar búsqueda"
                        >
                          ×
                        </button>
                      )}
                    </label>
                  </div>
                </div>

                {characterSearch.trim().length > 0 && (
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500 font-black mb-3">
                      Coincidencias
                    </div>

                    {suggestionsLoading ? (
                      <div className="rounded-xl border border-white/10 bg-black px-4 py-4 text-xs text-zinc-400">
                        Buscando personajes...
                      </div>
                    ) : suggestionsError ? (
                      <div className="rounded-xl border border-red-500/20 bg-black px-4 py-4 text-xs text-red-400">
                        No se pudo completar la búsqueda.
                      </div>
                    ) : characterSuggestions.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-4 gap-3">
                        {characterSuggestions.map((item) => {
                          const isActive =
                            String(data.initialPersonajeId ?? "") ===
                            String(item.id);

                          return (
                            <a
                              key={item.id}
                              href={item.href}
                              className={`group rounded-2xl border px-4 py-3 transition min-w-0 ${
                                isActive
                                  ? "border-red-500 bg-red-500/10 shadow-[0_0_20px_rgba(239,68,68,0.15)]"
                                  : "border-white/10 bg-black hover:border-red-500/40 hover:bg-red-500/5"
                              }`}
                            >
                              <div className="text-[9px] uppercase tracking-[0.22em] text-zinc-500 font-black mb-2">
                                Personaje
                              </div>

                              <div
                                className={`text-sm md:text-[15px] font-black uppercase italic transition leading-tight break-words ${
                                  isActive
                                    ? "text-red-400"
                                    : "text-white group-hover:text-red-400"
                                }`}
                              >
                                {item.title}
                              </div>

                              {item.universe && (
                                <div className="mt-2 text-[10px] uppercase tracking-[0.16em] text-zinc-500 break-words">
                                  {item.universe}
                                </div>
                              )}

                              {!!item.tags?.length && (
                                <div className="mt-1 text-[10px] uppercase tracking-[0.14em] text-zinc-600 line-clamp-1">
                                  {item.tags.slice(0, 2).join(" · ")}
                                </div>
                              )}

                              <div className="mt-2 text-[10px] text-zinc-400">
                                {getMatchLabel(item.matchType)}
                              </div>

                              <div className="mt-2 text-[9px] uppercase tracking-[0.2em] text-zinc-500">
                                Ver catálogo
                              </div>
                            </a>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="rounded-xl border border-white/10 bg-black px-4 py-4 text-xs text-zinc-400">
                        {characterSearch.trim().length < 2
                          ? "Escribe al menos dos caracteres."
                          : "No encontramos coincidencias para esa búsqueda."}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CONTEO */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between my-5">
            <div className="text-sm uppercase tracking-[0.18em] text-zinc-400 font-bold">
              {totalProducts} Producto{totalProducts === 1 ? "" : "s"}
            </div>

            <div className="text-xs uppercase tracking-[0.16em] text-zinc-500 font-bold">
              Mostrando {pageStart}-{pageEnd} de {totalProducts}
            </div>
          </div>

          {/* TARJETAS DE PRODUCTOS */}
          {filteredProducts.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-[#0f0f0f] px-6 py-12 text-center">
              <div className="text-xl md:text-2xl font-black uppercase italic text-white">
                No hay resultados
              </div>

              <p className="text-zinc-400 mt-3 max-w-2xl mx-auto">
                Ajusta los filtros para encontrar más resultados.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              {filteredProducts.map((product, index) => (
                <ProductCard
                  key={product.slug ?? index}
                  card={product}
                />
              ))}
            </div>
          )}

          {/* PAGINACIÓN */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-10 flex-wrap">
              <a
                href={
                  currentPage > 1
                    ? buildPageHref(currentPage - 1)
                    : "#"
                }
                className={`px-4 py-2 rounded-full border text-[11px] md:text-sm uppercase tracking-[0.18em] font-bold transition ${
                  currentPage === 1
                    ? "pointer-events-none border-white/10 text-white/30"
                    : "border-red-500/40 text-red-400 hover:text-white hover:border-red-500 bg-red-500/10 hover:bg-red-500/20"
                }`}
              >
                Anterior
              </a>

              {getVisiblePages().map((page) => {
                const isActive = page === currentPage;

                return (
                  <a
                    key={page}
                    href={buildPageHref(page)}
                    aria-current={isActive ? "page" : undefined}
                    className={`w-9 h-9 md:w-10 md:h-10 rounded-full border text-xs md:text-sm font-black transition flex items-center justify-center ${
                      isActive
                        ? "bg-red-500 border-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                        : "border-white/10 text-white/70 hover:text-white hover:border-red-500/50 hover:bg-red-500/10"
                    }`}
                  >
                    {page}
                  </a>
                );
              })}

              <a
                href={
                  currentPage < totalPages
                    ? buildPageHref(currentPage + 1)
                    : "#"
                }
                className={`px-4 py-2 rounded-full border text-[11px] md:text-sm uppercase tracking-[0.18em] font-bold transition ${
                  currentPage === totalPages
                    ? "pointer-events-none border-white/10 text-white/30"
                    : "border-red-500/40 text-red-400 hover:text-white hover:border-red-500 bg-red-500/10 hover:bg-red-500/20"
                }`}
              >
                Siguiente
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
