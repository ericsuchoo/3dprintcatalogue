

import React, {

  useEffect,

  useMemo,

  useState,

} from "react";

import { ProductCardD1 as ProductCard } from "../../ProductCardD1";

import CharacterSearchD1 from "../../home-page/CharacterSearchD1";

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

    quickCharacterSuggestions?: unknown[];

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

      etiquetaId?: string | null;

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

  const [filtersOpen, setFiltersOpen] = useState(false);

  type EtiquetaOption = { id: string; name: string };
  const [etiquetasOpen, setEtiquetasOpen] = useState(false);
  const [etiquetas, setEtiquetas] = useState<EtiquetaOption[]>([]);
  const [etiquetasLoading, setEtiquetasLoading] = useState(false);
  const [etiquetasError, setEtiquetasError] = useState(false);
  const [etiquetaSearch, setEtiquetaSearch] = useState("");
  const [etiquetasLoaded, setEtiquetasLoaded] = useState(false);
  const [etiquetasRetry, setEtiquetasRetry] = useState(0);

  useEffect(() => {
    if (!etiquetasOpen || etiquetasLoaded) return;
    const controller = new AbortController();
    const load = async () => {
      setEtiquetasLoading(true);
      setEtiquetasError(false);
      try {
        const response = await fetch("/api/shop/etiquetas", {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("No se pudieron cargar etiquetas");
        const payload = (await response.json()) as { results?: EtiquetaOption[] };
        if (controller.signal.aborted) return;
        setEtiquetas(Array.isArray(payload.results) ? payload.results : []);
        setEtiquetasLoaded(true);
      } catch {
        if (!controller.signal.aborted) setEtiquetasError(true);
      } finally {
        if (!controller.signal.aborted) setEtiquetasLoading(false);
      }
    };
    void load();
    return () => controller.abort();
  }, [etiquetasOpen, etiquetasLoaded, etiquetasRetry]);

  const etiquetasFiltradas = useMemo(() => {
    const term = etiquetaSearch.trim().normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "").toLowerCase();
    if (!term) return etiquetas;
    return etiquetas.filter((item) => item.name.normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "").toLowerCase().includes(term));
  }, [etiquetas, etiquetaSearch]);


  const [instagramCopied, setInstagramCopied] = useState(false);

  const [shareListCopied, setShareListCopied] = useState(false);

  const [shareListLoading, setShareListLoading] = useState(false);

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

    () => filters.filter((f) => f.active && f.value !== "newest"),

    [filters]

  );

  const hasActiveFilters =

    activeFilters.length > 0 ||

    !!data.initialPersonajeId ||

    !!data.initialUniversoId ||

    !!data.initialProveedorId ||
    !!data.pagination?.etiquetaId ||

    (data.initialSort != null && data.initialSort !== "newest");

  const buildUrl = (next: {

    personajeId?: string | null;

    universoId?: string | null;

    proveedorId?: string | null;

    etiquetaId?: string | null;

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

    const etiquetaId =
      next.etiquetaId !== undefined
        ? next.etiquetaId
        : data.pagination?.etiquetaId ?? null;

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

    if (etiquetaId) params.set("etiquetaId", etiquetaId);

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

    "https\://www.instagram.com/dinocat3d/";

  const paintingStudioUrl =

    "https\://www.instagram.com/dcpanitingstudio/";

  const instagramQuoteMessage = useMemo(() => {

    if (quotableVisibleProducts.length === 0) return "";

    const baseUrl =

      typeof window !== "undefined"

        ? window.location.origin

        : "https\://3dprintcatalogue.pages.dev";

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

    </div>

  );

  return (

    <div className="bg-[#0a0a0a] min-h-screen px-3 sm:px-4 md:px-6 pt-32 sm:pt-24 md:pt-24 pb-8">

      {/* ACCESO A FILTROS AVANZADOS Y FAVORITOS */}

      {favoritesOnly && <div className="mt-3 mb-4">

        <button

          type="button"

          onClick={() => setFiltersOpen(true)}

          className="inline-flex items-center justify-center px-4 py-3 rounded-full border border-[#00eeff]/40 text-[#00eeff] hover:text-white hover:border-[#00eeff] transition uppercase tracking-[0.18em] font-black text-[10px] bg-[#00eeff]/10"

        >

          Opciones de favoritos

        </button>

      </div>}

      {/* MODAL DE FILTROS */}

      {favoritesOnly && filtersOpen && (

        <div className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-sm">

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

      <div className="grid grid-cols-1 gap-6 items-start">

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

          {/* BUSCADOR REUTILIZADO DE EXPLORAR */}

          {!favoritesOnly && (

            <div className="mb-5">

              <CharacterSearchD1 />

            </div>

          )}

{/* FILTRO GUIADO DE FRANQUICIAS Y CATEGORIAS */}
            {!favoritesOnly && (
              <section className="mb-4 rounded-2xl border border-white/10 bg-[#0f0f0f] p-3 sm:p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    aria-expanded={etiquetasOpen}
                    aria-controls="shop-etiquetas-panel"
                    onClick={() => setEtiquetasOpen((open) => !open)}
                    className={`rounded-full border px-4 py-3 text-xs font-bold transition ${etiquetasOpen || data.pagination?.etiquetaId ? "border-[#00eeff] text-[#00eeff]" : "border-white/20 text-white hover:border-[#00eeff]/60"}`}
                  >
                    Franquicias / Categorías {etiquetasOpen ? "−" : "+"}
                  </button>
                  {data.pagination?.etiquetaId && (
                    <button
                      type="button"
                      onClick={() => window.location.assign(buildUrl({ etiquetaId: null, page: 1 }))}
                      className="rounded-full border border-red-500/40 px-3 py-2 text-xs text-red-400"
                    >
                      Quitar franquicia / categoría
                    </button>
                  )}
                </div>
                {etiquetasOpen && (
                  <div id="shop-etiquetas-panel" className="mt-4 border-t border-white/10 pt-4">
                    <label htmlFor="shop-etiqueta-search" className="mb-2 block text-xs text-zinc-400">
                      Filtra las opciones disponibles
                    </label>
                    <input
                      id="shop-etiqueta-search"
                      type="search"
                      value={etiquetaSearch}
                      onChange={(event) => setEtiquetaSearch(event.target.value)}
                      placeholder="Ej. Naruto, Dragon Ball, villanos..."
                      className="w-full max-w-lg rounded-xl border border-white/20 bg-black px-4 py-3 text-sm text-white outline-none focus:border-[#00eeff]"
                    />
                    {etiquetasLoading && <p className="mt-3 text-xs text-zinc-400">Cargando opciones...</p>}
                    {etiquetasError && (
                      <div className="mt-3 flex items-center gap-3 text-xs text-red-400">
                        No se pudieron cargar las opciones.
                        <button type="button" className="underline" onClick={() => setEtiquetasRetry((count) => count + 1)}>
                          Reintentar
                        </button>
                      </div>
                    )}
                    {!etiquetasLoading && !etiquetasError && (
                      <div className="mt-3 flex max-h-60 flex-wrap gap-2 overflow-y-auto" aria-label="Opciones de franquicias y categorías">
                        {etiquetasFiltradas.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => window.location.assign(buildUrl({ etiquetaId: item.id, page: 1 }))}
                            className={`rounded-full border px-3 py-2 text-xs transition ${data.pagination?.etiquetaId === item.id ? "border-[#00eeff] bg-[#00eeff]/10 text-[#00eeff]" : "border-white/15 text-zinc-200 hover:border-[#00eeff]/50"}`}
                          >
                            {item.name}
                          </button>
                        ))}
                        {etiquetasFiltradas.length === 0 && <p className="text-xs text-zinc-400">No hay coincidencias.</p>}
                      </div>
                    )}
                  </div>
                )}
              </section>
            )}

            {/* FILTROS HORIZONTALES DEL CATALOGO */}

{!favoritesOnly && (

  <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-[#0f0f0f] p-3 sm:p-4 mb-4">

    <span className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400">

      Filtrar por:

    </span>

    <select

      aria-label="Filtrar por universo"

      value={data.initialUniversoId ?? ""}

      onChange={(event) =>

        window.location.assign(

          buildUrl({

            universoId: event.target.value || null,

            page: 1,

          })

        )

      }

      className="rounded-full border border-[#00eeff]/40 bg-black px-4 py-3 text-xs text-white outline-none"

    >

      <option value="">Todos los universos</option>

      {(data.categories || []).map((item) => (

        <option key={item.slug} value={String(item.slug)}>

          {item.title}

        </option>

      ))}

    </select>

    <select

      aria-label="Filtrar por creador"

      value={data.initialProveedorId ?? ""}

      onChange={(event) =>

        window.location.assign(

          buildUrl({

            proveedorId: event.target.value || null,

            page: 1,

          })

        )

      }

      className="rounded-full border border-white/20 bg-black px-4 py-3 text-xs text-white outline-none"

    >

      <option value="">Todos los creadores</option>

      {(data.brands || []).map((item) => (

        <option key={item.slug} value={String(item.slug)}>

          {item.title}

        </option>

      ))}

    </select>

    <select

      aria-label="Ordenar catálogo"

      value={data.initialSort ?? "newest"}

      onChange={(event) =>

        window.location.assign(buildUrl({ sort: event.target.value, page: 1 }))

      }

      className="rounded-full border border-white/20 bg-black px-4 py-3 text-xs text-white outline-none"

    >

      <option value="newest">Más recientes</option>

      <option value="price_asc">Menor precio</option>

      <option value="price_desc">Mayor precio</option>

    </select>

    {(data.initialUniversoId || data.initialProveedorId) && (

      <button

        type="button"

        onClick={clearFilters}

        className="rounded-full border border-red-500/40 px-4 py-3 text-xs font-black uppercase text-red-400 hover:text-white"

      >

        Quitar filtros

      </button>

    )}

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
