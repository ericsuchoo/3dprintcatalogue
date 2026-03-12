import React, { useEffect, useMemo, useState } from "react";
import SearchIcon from "../../../assets/icons/search.svg?raw";

import { FormCheck } from "../../form/Check";
import { ProductCardD1 as ProductCard } from "../../ProductCardD1";

import type { ShopPageDataD1, ProductLiteD1 } from "../../../types/shop-d1";
import { useFavorites } from "../../../context/FavoritesContext";

export interface ProductFilterD1 {
  type: "personaje" | "universo" | "proveedor" | "price" | "popularity";
  label: string;
  value: string;
  active: boolean;
}

type CharacterSuggestion = {
  id: string;
  title: string;
  href: string;
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

export const Main: React.FC<Props> = ({ data, favoritesOnly = false }) => {
  const { favorites } = useFavorites();

  const [searchVal, setSearchVal] = useState("");
  const [characterSearch, setCharacterSearch] = useState("");

  const [filters, setFilters] = useState<ProductFilterD1[]>([
    { active: false, type: "price", label: "Lowest", value: "price_asc" },
    { active: false, type: "price", label: "Most expensive", value: "price_desc" },
    { active: false, type: "popularity", label: "New comer", value: "newest" },
  ]);

  const filterTitleClass =
    "inline-block pb-2 border-b-2 border-[#00eeff] text-sm uppercase tracking-[0.18em] text-zinc-200 font-black shadow-[0_8px_18px_rgba(0,238,255,0.16)]";

  useEffect(() => {
    const personajesFilters: ProductFilterD1[] = (data.genders || []).map((p) => ({
      active: false,
      label: p.title,
      value: String(p.slug),
      type: "personaje",
    }));

    const universosFilters: ProductFilterD1[] = (data.categories || []).map((u) => ({
      active: false,
      label: u.title,
      value: String(u.slug),
      type: "universo",
    }));

    const proveedoresFilters: ProductFilterD1[] = (data.brands || []).map((b) => ({
      active: false,
      label: b.title,
      value: String(b.slug),
      type: "proveedor",
    }));

    setFilters((prev) => {
      const base = prev.filter((f) => f.type === "price" || f.type === "popularity");

      return base
        .map((f) => {
          if (f.type === "price" && data.initialSort && f.value === data.initialSort) {
            return { ...f, active: true };
          }
          if (f.type === "popularity" && data.initialSort === "newest" && f.value === "newest") {
            return { ...f, active: true };
          }
          return { ...f, active: false };
        })
        .concat([...proveedoresFilters, ...universosFilters, ...personajesFilters]);
    });
  }, [data.genders, data.categories, data.brands, data.initialSort]);

  useEffect(() => {
    setFilters((prev) =>
      prev.map((f) => {
        if (f.type === "personaje") {
          return { ...f, active: f.value === String(data.initialPersonajeId ?? "") };
        }
        if (f.type === "universo") {
          return { ...f, active: f.value === String(data.initialUniversoId ?? "") };
        }
        if (f.type === "proveedor") {
          return { ...f, active: f.value === String(data.initialProveedorId ?? "") };
        }
        return f;
      })
    );
  }, [data.initialPersonajeId, data.initialUniversoId, data.initialProveedorId]);

  const activeFilters = useMemo(() => filters.filter((f) => f.active), [filters]);

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
  }) => {
    const params = new URLSearchParams();

    const personajeId = next.personajeId ?? data.pagination?.personajeId ?? null;
    const universoId = next.universoId ?? data.pagination?.universoId ?? null;
    const proveedorId = next.proveedorId ?? data.pagination?.proveedorId ?? null;
    const sort = next.sort ?? data.pagination?.sort ?? "newest";
    const page = next.page ?? null;

    if (personajeId) params.set("personajeId", personajeId);
    if (universoId) params.set("universoId", universoId);
    if (proveedorId) params.set("proveedorId", proveedorId);
    if (sort && sort !== "newest") params.set("sort", sort);
    if (page && page > 1) params.set("page", String(page));

    const query = params.toString();
    return `${data.pagination?.basePath || "/shop"}${query ? `?${query}` : ""}`;
  };

  const clearFilters = () => {
    if (favoritesOnly) {
      window.location.href = "/shop-2";
      return;
    }

    window.location.href = data.clearFilterHref || "/shop";
  };

  const filteredProducts = useMemo(() => {
    const products = (data.products || []) as ProductLiteD1[];

    return products.filter((p) => {
      if (favoritesOnly && !favorites.includes(String(p.slug))) return false;

      if (searchVal) {
        const haystack =
          `${p.title} ${p.subtitle || ""} ${p.description || ""} ${p.price ?? ""}`.toLowerCase();

        if (!haystack.includes(searchVal.toLowerCase())) return false;
      }

      return true;
    });
  }, [data.products, searchVal, favorites, favoritesOnly]);

  const setProductFilter = (filter: ProductFilterD1) => {
    const currentPersonajeId = data.pagination?.personajeId ?? null;
    const currentUniversoId = data.pagination?.universoId ?? null;
    const currentProveedorId = data.pagination?.proveedorId ?? null;
    const currentSort = data.pagination?.sort ?? "newest";

    if (filter.type === "personaje") {
      const nextValue = currentPersonajeId === filter.value ? null : filter.value;
      window.location.href = buildUrl({
        personajeId: nextValue,
        page: 1,
      });
      return;
    }

    if (filter.type === "universo") {
      const nextValue = currentUniversoId === filter.value ? null : filter.value;
      window.location.href = buildUrl({
        universoId: nextValue,
        page: 1,
      });
      return;
    }

    if (filter.type === "proveedor") {
      const nextValue = currentProveedorId === filter.value ? null : filter.value;
      window.location.href = buildUrl({
        proveedorId: nextValue,
        page: 1,
      });
      return;
    }

    if (filter.type === "price" || filter.type === "popularity") {
      const nextSort = currentSort === filter.value ? "newest" : filter.value;
      window.location.href = buildUrl({
        sort: nextSort,
        page: 1,
      });
    }
  };

  const currentPage = data.pagination?.currentPage || 1;
  const totalPages = favoritesOnly ? 1 : data.pagination?.totalPages || 1;
  const totalProducts = favoritesOnly
    ? filteredProducts.length
    : data.pagination?.totalProducts ?? filteredProducts.length;
  const itemsPerPage = favoritesOnly
    ? filteredProducts.length || 1
    : data.pagination?.itemsPerPage || filteredProducts.length;
  const pageCount = favoritesOnly
    ? filteredProducts.length
    : data.pagination?.pageCount ?? (data.products?.length || 0);

  const pageStart = totalProducts === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const pageEnd =
    totalProducts === 0 ? 0 : Math.min((currentPage - 1) * itemsPerPage + pageCount, totalProducts);

  const buildPageHref = (page: number) => buildUrl({ page });

  const getVisiblePages = () => {
    const pages: number[] = [];
    const maxVisible = 5;

    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const characterSuggestions = useMemo(() => {
    const source =
      (data.quickCharacterSuggestions || []).length > 0
        ? data.quickCharacterSuggestions || []
        : (data.genders || []).map((p) => ({
            id: String(p.slug),
            title: p.title,
            href: `/shop?personajeId=${p.slug}`,
          }));

    const q = normalizeText(characterSearch);

    const result = !q
      ? source
      : source.filter((item) => normalizeText(item.title).includes(q));

    return result.slice(0, 12);
  }, [data.quickCharacterSuggestions, data.genders, characterSearch]);

  const selectedCharacterName = data.selectedCharacter?.name || data.personajeNombre || null;

  return (
    <div className="bg-[#0a0a0a] min-h-screen px-4 md:px-6 pt-24 md:pt-28 pb-8">
      <div className="grid grid-cols-1 gap-x-10 gap-y-10 items-start lg:grid-cols-[240px,1fr] lg:grid-rows-[auto,1fr]">
        <div className="lg:row-span-2 sticky top-28">
          <div className="grid grid-cols-1 gap-8 border border-[#00eeff] p-6 md:p-8 bg-[#0f0f0f] rounded-xl backdrop-blur-sm shadow-[0_0_30px_rgba(0,238,255,0.08)] max-h-[calc(100vh-8rem)] overflow-y-auto">
            <div className="text-2xl leading-none font-bold italic text-red-500">
              {favoritesOnly ? "Mis Me gusta" : "Filtros"}
            </div>

            {filters.some((f) => f.type === "universo") && (
              <div>
                <div className={filterTitleClass}>Universos</div>
                <div className="grid grid-cols-1 gap-4 mt-4 text-[#fdfdfd]">
                  {filters
                    .filter((e) => e.type === "universo")
                    .map((filter, index) => (
                      <FormCheck
                        key={index}
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

            <div>
              <div className={filterTitleClass}>Precio / orden</div>
              <div className="grid grid-cols-1 gap-4 mt-4 text-[#fdfdfd]">
                {filters
                  .filter((e) => e.type === "price")
                  .map((filter, index) => (
                    <FormCheck
                      key={index}
                      value={filter.label}
                      label={filter.label}
                      onCheck={() => setProductFilter(filter)}
                      checked={filter.active}
                      size="sm"
                    />
                  ))}
              </div>
            </div>

            <div>
              <div className={filterTitleClass}>Novedad</div>
              <div className="grid grid-cols-1 gap-4 mt-4 text-[#fdfdfd]">
                {filters
                  .filter((e) => e.type === "popularity")
                  .map((filter, index) => (
                    <FormCheck
                      key={index}
                      value={filter.label}
                      label={filter.label}
                      onCheck={() => setProductFilter(filter)}
                      checked={filter.active}
                      size="sm"
                    />
                  ))}
              </div>
            </div>

            <div>
              <div className={filterTitleClass}>Personajes</div>
              <div className="grid grid-cols-1 gap-4 mt-4 text-[#fdfdfd]">
                {filters
                  .filter((e) => e.type === "personaje")
                  .map((filter, index) => (
                    <FormCheck
                      key={index}
                      value={filter.label}
                      label={filter.label}
                      onCheck={() => setProductFilter(filter)}
                      checked={filter.active}
                      size="sm"
                    />
                  ))}
              </div>
            </div>

            {filters.some((f) => f.type === "proveedor") && (
              <div>
                <div className={filterTitleClass}>Creadores 3D</div>
                <div className="grid grid-cols-1 gap-4 mt-4 text-[#fdfdfd]">
                  {filters
                    .filter((e) => e.type === "proveedor")
                    .map((filter, index) => (
                      <FormCheck
                        key={index}
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

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-2 inline-flex items-center justify-center px-5 py-3 rounded-full border border-red-500/40 text-red-400 hover:text-white hover:border-red-500 transition uppercase tracking-[0.22em] font-black text-[10px] md:text-xs bg-red-500/10 hover:bg-red-500/20"
              >
                Quitar filtros
              </button>
            )}
          </div>
        </div>

        <div className="lg:col-start-2">
          {(selectedCharacterName || data.activeFilterLabels?.length || data.clearFilterHref) && (
            <div className="mb-8 flex flex-col gap-4">
              {selectedCharacterName && (
                <div className="rounded-2xl border border-red-500/20 bg-gradient-to-r from-red-500/10 via-[#111] to-[#111] px-6 py-5 shadow-[0_0_30px_rgba(239,68,68,0.12)]">
                  <div className="text-[11px] md:text-xs uppercase tracking-[0.28em] text-zinc-400 font-black mb-2">
                    Explorando personaje
                  </div>
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <h2 className="text-3xl md:text-4xl font-black uppercase italic text-white tracking-tight">
                      {selectedCharacterName}
                    </h2>

                    <a
                      href="/shop"
                      className="inline-flex items-center justify-center px-5 py-2 rounded-full border border-red-500/40 text-red-400 hover:text-white hover:border-red-500 transition uppercase tracking-[0.22em] font-black text-[10px] md:text-xs bg-red-500/10 hover:bg-red-500/20"
                    >
                      Ver todo el catálogo
                    </a>
                  </div>
                </div>
              )}

              {!selectedCharacterName && data.activeFilterLabels?.length ? (
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h2 className="text-3xl md:text-4xl font-black uppercase italic text-white tracking-tight">
                      Shop:{" "}
                      <span className="text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.6)]">
                        {data.activeFilterLabels.join(" / ")}
                      </span>
                    </h2>
                  </div>

                  {data.clearFilterHref && (
                    <a
                      href={data.clearFilterHref}
                      className="inline-flex items-center justify-center px-5 py-2 rounded-full border border-red-500/40 text-red-400 hover:text-white hover:border-red-500 transition uppercase tracking-[0.22em] font-black text-[10px] md:text-xs bg-red-500/10 hover:bg-red-500/20"
                    >
                      Quitar filtros
                    </a>
                  )}
                </div>
              ) : null}
            </div>
          )}

          {!favoritesOnly && (
            <div className="mb-8 rounded-2xl border border-white/10 bg-[#0f0f0f] p-5 md:p-6">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                  <div>
                    <div className="text-[11px] md:text-xs uppercase tracking-[0.28em] text-zinc-400 font-black mb-2">
                      Explora por personaje
                    </div>
                    <h3 className="text-white text-2xl md:text-3xl font-black italic uppercase">
                      Busca y salta directo al shop
                    </h3>
                  </div>

                  <div className="w-full md:max-w-[420px]">
                    <label className="flex items-center px-5 border border-white/10 bg-black rounded-lg">
                      <div
                        dangerouslySetInnerHTML={{ __html: SearchIcon }}
                        className="w-[18px] h-[18px] text-zinc-500"
                      />
                      <input
                        type="search"
                        value={characterSearch}
                        onChange={(e) => setCharacterSearch(e.target.value)}
                        placeholder="Buscar personaje..."
                        className="bg-transparent px-2 py-4 w-full text-sm text-white placeholder:text-zinc-500 focus:outline-none"
                      />
                    </label>
                  </div>
                </div>

                <div className="text-xs uppercase tracking-[0.18em] text-zinc-500 font-bold">
                  {characterSearch ? "Coincidencias" : "Personajes destacados"}
                </div>

                {characterSuggestions.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                    {characterSuggestions.map((item) => {
                      const isActive =
                        String(data.initialPersonajeId ?? "") === String(item.id);

                      return (
                        <a
                          key={item.id}
                          href={item.href}
                          className={`group rounded-xl border p-4 transition ${
                            isActive
                              ? "border-red-500 bg-red-500/10 shadow-[0_0_20px_rgba(239,68,68,0.15)]"
                              : "border-white/10 bg-black hover:border-red-500/40 hover:bg-red-500/5"
                          }`}
                        >
                          <div className="text-[10px] uppercase tracking-[0.24em] text-zinc-500 font-black mb-2">
                            Personaje
                          </div>
                          <div
                            className={`text-sm md:text-base font-black uppercase italic transition ${
                              isActive
                                ? "text-red-400"
                                : "text-white group-hover:text-red-400"
                            }`}
                          >
                            {item.title}
                          </div>
                          <div className="mt-3 text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                            Ver catálogo
                          </div>
                        </a>
                      );
                    })}
                  </div>
                )}

                {characterSearch && characterSuggestions.length === 0 && (
                  <div className="rounded-xl border border-white/10 bg-black px-4 py-5 text-sm text-zinc-400">
                    No encontramos coincidencias para ese personaje.
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
            <label className="flex items-center px-5 flex-1 border border-white/10 bg-[#0f0f0f] rounded-lg">
              <div
                dangerouslySetInnerHTML={{ __html: SearchIcon }}
                className="w-[18px] h-[18px] text-zinc-500"
              />
              <input
                type="search"
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                placeholder={favoritesOnly ? "Buscar en mis favoritos..." : "Buscar figuras..."}
                className="bg-transparent px-2 py-4 w-full text-sm text-white placeholder:text-zinc-500 focus:outline-none"
              />
            </label>
          </div>

          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between my-6">
            <div className="text-sm uppercase tracking-[0.18em] text-zinc-400 font-bold">
              {totalProducts} Producto{totalProducts === 1 ? "" : "s"}
            </div>

            <div className="text-xs uppercase tracking-[0.16em] text-zinc-500 font-bold">
              Mostrando {pageStart}-{pageEnd} de {totalProducts}
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-[#0f0f0f] px-6 py-12 text-center">
              <div className="text-xl md:text-2xl font-black uppercase italic text-white">
                No hay resultados
              </div>
              <p className="text-zinc-400 mt-3 max-w-2xl mx-auto">
                Ajusta los filtros o limpia la búsqueda local.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {filteredProducts.map((product, index) => (
                <ProductCard key={product.slug ?? index} card={product} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-12 flex-wrap">
              <a
                href={currentPage > 1 ? buildPageHref(currentPage - 1) : "#"}
                className={`px-4 py-2 rounded-full border text-xs md:text-sm uppercase tracking-[0.18em] font-bold transition ${
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
                    className={`w-10 h-10 rounded-full border text-sm font-black transition flex items-center justify-center ${
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
                href={currentPage < totalPages ? buildPageHref(currentPage + 1) : "#"}
                className={`px-4 py-2 rounded-full border text-xs md:text-sm uppercase tracking-[0.18em] font-bold transition ${
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