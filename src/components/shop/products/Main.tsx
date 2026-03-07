import React, { useEffect, useMemo, useState } from "react";
import SearchIcon from "../../../assets/icons/search.svg?raw";
import TrashIcon from "../../../assets/icons/trash.svg?raw";

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

interface Props {
  data: ShopPageDataD1 & {
    personajeNombre?: string | null;
    clearFilterHref?: string | null;
    pagination?: {
      currentPage: number;
      totalPages: number;
      totalProducts: number;
      itemsPerPage: number;
      pageCount?: number;
      basePath: string;
      personajeId?: string | null;
    };
  };
  favoritesOnly?: boolean;
}

export const Main: React.FC<Props> = ({ data, favoritesOnly = false }) => {
  const { favorites } = useFavorites();
  const [searchVal, setSearchVal] = useState("");

  const [filters, setFilters] = useState<ProductFilterD1[]>([
    { active: false, type: "price", label: "Lowest", value: "0" },
    { active: false, type: "price", label: "Most expensive", value: "1" },
    { active: false, type: "popularity", label: "Best selling", value: "0" },
    { active: false, type: "popularity", label: "New comer", value: "1" },
  ]);

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
      return [...base, ...proveedoresFilters, ...universosFilters, ...personajesFilters];
    });
  }, [data.genders, data.categories, data.brands]);

  useEffect(() => {
    if (!data?.initialPersonajeId) return;

    setFilters((prev) =>
      prev.map((f) =>
        f.type === "personaje" && f.value === String(data.initialPersonajeId)
          ? { ...f, active: true }
          : f
      )
    );
  }, [data?.initialPersonajeId]);

  const activeFilters = useMemo(() => filters.filter((f) => f.active), [filters]);

  const clearFilters = () => {
    window.location.href = data.clearFilterHref || "/shop";
  };

  // La paginación real ya viene del servidor (D1).
  // Aquí solo aplicamos búsqueda local, favoritos y orden visual
  // sobre los productos que ya llegaron en esta página.
  const filteredProducts = useMemo(() => {
    const products = (data.products || []) as ProductLiteD1[];

    let out = products.filter((p) => {
      if (favoritesOnly && !favorites.includes(String(p.slug))) return false;

      if (searchVal) {
        const haystack =
          `${p.title} ${p.subtitle || ""} ${p.description || ""} ${p.price ?? ""}`.toLowerCase();

        if (!haystack.includes(searchVal.toLowerCase())) return false;
      }

      return true;
    });

    const priceFilter = activeFilters.find((x) => x.type === "price");
    if (priceFilter) {
      out = [...out].sort((a, b) => {
        const ap = Number(a.price ?? 0);
        const bp = Number(b.price ?? 0);
        return priceFilter.value === "0" ? ap - bp : bp - ap;
      });
    }

    const popFilter = activeFilters.find((x) => x.type === "popularity");
    if (popFilter) {
      out = [...out].sort((a: any, b: any) => {
        const aUnits = Number(a.units_sold ?? a.units ?? 0);
        const bUnits = Number(b.units_sold ?? b.units ?? 0);

        const aDate = new Date(a.date ?? 0).getTime();
        const bDate = new Date(b.date ?? 0).getTime();

        if (popFilter.value === "0") return bUnits - aUnits;
        return bDate - aDate;
      });
    }

    return out;
  }, [data.products, activeFilters, searchVal, favorites, favoritesOnly]);

  const setProductFilter = (value: string) => {
    setFilters((prev) =>
      prev.map((p) => (p.label === value ? { ...p, active: !p.active } : p))
    );
  };

  const currentPage = data.pagination?.currentPage || 1;
  const totalPages = data.pagination?.totalPages || 1;
  const totalProducts = data.pagination?.totalProducts ?? filteredProducts.length;
  const itemsPerPage = data.pagination?.itemsPerPage || filteredProducts.length;
  const pageCount = data.pagination?.pageCount ?? (data.products?.length || 0);

  const pageStart = totalProducts === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const pageEnd =
    totalProducts === 0 ? 0 : Math.min((currentPage - 1) * itemsPerPage + pageCount, totalProducts);

  const buildPageHref = (page: number) => {
    const params = new URLSearchParams();

    if (data.pagination?.personajeId) {
      params.set("personajeId", data.pagination.personajeId);
    }

    if (page > 1) {
      params.set("page", String(page));
    }

    const query = params.toString();
    return `${data.pagination?.basePath || "/shop"}${query ? `?${query}` : ""}`;
  };

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

  return (
    <div className="bg-[#0a0a0a] min-h-screen px-4 md:px-6 pt-24 md:pt-28 pb-8">
      <div className="grid grid-cols-1 gap-x-10 gap-y-10 items-start lg:grid-cols-[240px,1fr] lg:grid-rows-[auto,1fr]">
        {/* SIDEBAR */}
        <div className="lg:row-span-2 sticky top-28">
          <div className="grid grid-cols-1 gap-8 border border-white/10 p-6 md:p-8 bg-[#0f0f0f] rounded-xl backdrop-blur-sm">
            <div className="text-2xl leading-none font-bold italic text-red-500">
              {favoritesOnly ? "Mis Me gusta" : "Filtros"}
            </div>

            {filters.some((f) => f.type === "universo") && (
              <div>
                <div className="text-sm uppercase tracking-[0.18em] mb-4 text-zinc-400 font-bold">
                  Universos
                </div>
                <div className="grid grid-cols-1 gap-4 text-[#a200ff]">
                  {filters
                    .filter((e) => e.type === "universo")
                    .map((filter, index) => (
                      <FormCheck
                        key={index}
                        value={filter.label}
                        label={filter.label}
                        onCheck={(value) => setProductFilter(String(value))}
                        checked={filter.active}
                        size="sm"
                      />
                    ))}
                </div>
              </div>
            )}

            <div>
              <div className="text-sm uppercase tracking-[0.18em] mb-4 text-zinc-400 font-bold">
                Precio
              </div>
              <div className="grid grid-cols-1 gap-4 text-[#ff0000]">
                {filters
                  .filter((e) => e.type === "price")
                  .map((filter, index) => (
                    <FormCheck
                      key={index}
                      value={filter.label}
                      label={filter.label}
                      onCheck={(value) => setProductFilter(String(value))}
                      checked={filter.active}
                      size="sm"
                    />
                  ))}
              </div>
            </div>

            <div>
              <div className="text-sm uppercase tracking-[0.18em] mb-4 text-zinc-400 font-bold">
                Popularidad
              </div>
              <div className="grid grid-cols-1 gap-4 text-[#ffd900]">
                {filters
                  .filter((e) => e.type === "popularity")
                  .map((filter, index) => (
                    <FormCheck
                      key={index}
                      value={filter.label}
                      label={filter.label}
                      onCheck={(value) => setProductFilter(String(value))}
                      checked={filter.active}
                      size="sm"
                    />
                  ))}
              </div>
            </div>

            <div>
              <div className="text-sm uppercase tracking-[0.18em] mb-4 text-zinc-400 font-bold">
                Personajes
              </div>
              <div className="grid grid-cols-1 gap-4 text-[#66ff00]">
                {filters
                  .filter((e) => e.type === "personaje")
                  .map((filter, index) => (
                    <FormCheck
                      key={index}
                      value={filter.label}
                      label={filter.label}
                      onCheck={(value) => setProductFilter(String(value))}
                      checked={filter.active}
                      size="sm"
                    />
                  ))}
              </div>
            </div>

            {filters.some((f) => f.type === "proveedor") && (
              <div>
                <div className="text-sm uppercase tracking-[0.18em] mb-4 text-zinc-400 font-bold">
                  Creadores 3D
                </div>
                <div className="grid grid-cols-1 gap-4 text-[#00ffea]">
                  {filters
                    .filter((e) => e.type === "proveedor")
                    .map((filter, index) => (
                      <FormCheck
                        key={index}
                        value={filter.label}
                        label={filter.label}
                        onCheck={(value) => setProductFilter(String(value))}
                        checked={filter.active}
                        size="sm"
                      />
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CONTENT */}
        <div className="lg:col-start-2">
          {(data.personajeNombre || data.clearFilterHref) && (
            <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                {data.personajeNombre && (
                  <h2 className="text-3xl md:text-4xl font-black uppercase italic text-white tracking-tight">
                    Shop:{" "}
                    <span className="text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.6)]">
                      {data.personajeNombre}
                    </span>
                  </h2>
                )}
              </div>

              {data.clearFilterHref && (
                <a
                  href={data.clearFilterHref}
                  className="inline-flex items-center justify-center px-5 py-2 rounded-full border border-red-500/40 text-red-400 hover:text-white hover:border-red-500 transition uppercase tracking-[0.22em] font-black text-[10px] md:text-xs bg-red-500/10 hover:bg-red-500/20"
                >
                  Quitar filtro
                </a>
              )}
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

            <button
              className="flex items-center justify-center gap-2 px-5 py-4 rounded-lg transition-colors duration-300 text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 hover:text-white"
              onClick={clearFilters}
            >
              <div dangerouslySetInnerHTML={{ __html: TrashIcon }} className="w-[16px] h-[16px]" />
              <span className="text-sm uppercase tracking-[0.18em] font-bold">
                Limpiar filtros
              </span>
            </button>
          </div>

          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between my-6">
            <div className="text-sm uppercase tracking-[0.18em] text-zinc-400 font-bold">
              {totalProducts} Variante{totalProducts === 1 ? "" : "s"}
            </div>

            <div className="text-xs uppercase tracking-[0.16em] text-zinc-500 font-bold">
              Mostrando {pageStart}-{pageEnd} de {totalProducts}
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-[#0f0f0f] px-6 py-12 text-center">
              <div className="text-xl md:text-2xl font-black uppercase italic text-white">
                No hay resultados en esta página
              </div>
              <p className="text-zinc-400 mt-3 max-w-2xl mx-auto">
                Prueba a limpiar la búsqueda local o cambiar de página.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
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