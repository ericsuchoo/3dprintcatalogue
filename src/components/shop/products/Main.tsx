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
  };
  favoritesOnly?: boolean;
}

export const Main: React.FC<Props> = ({ data, favoritesOnly = false }) => {
  const { favorites } = useFavorites();

  const [loadedProducts, setLoadedProducts] = useState(12);
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
    setFilters((prev) =>
      prev.map((f) => ({
        ...f,
        active: false,
      }))
    );
    setSearchVal("");
    setLoadedProducts(12);
  };

  const filteredProducts = useMemo(() => {
    const products = (data.products || []) as ProductLiteD1[];

    let out = products.filter((p) => {
      if (favoritesOnly && !favorites.includes(String(p.slug))) return false;

      if (searchVal) {
        const haystack =
          `${p.title} ${p.subtitle || ""} ${p.description || ""} ${p.price ?? ""}`.toLowerCase();
        if (!haystack.includes(searchVal.toLowerCase())) return false;
      }

      for (const f of activeFilters) {
        if (f.type === "personaje") {
          if (String(p.personajeId ?? "") !== String(f.value)) return false;
        }
        if (f.type === "universo") {
          if (String(p.universoId ?? "") !== String(f.value)) return false;
        }
        if (f.type === "proveedor") {
          if (String(p.proveedorId ?? "") !== String(f.value)) return false;
        }
      }

      return true;
    });

    out = out.sort((a, b) => {
      const priceFilter = activeFilters.find((x) => x.type === "price");
      if (!priceFilter) return 0;
      const ap = Number(a.price ?? 0);
      const bp = Number(b.price ?? 0);
      return priceFilter.value === "0" ? ap - bp : bp - ap;
    });

    out = out.sort((a: any, b: any) => {
      const popFilter = activeFilters.find((x) => x.type === "popularity");
      if (!popFilter) return 0;

      const aUnits = Number(a.units_sold ?? 0);
      const bUnits = Number(b.units_sold ?? 0);
      const aDate = Number(a.date ?? 0);
      const bDate = Number(b.date ?? 0);

      if (popFilter.value === "0") return bUnits - aUnits;
      return bDate - aDate;
    });

    return out;
  }, [data.products, activeFilters, searchVal, favorites, favoritesOnly]);

  const setProductFilter = (value: string) => {
    setFilters((prev) =>
      prev.map((p) => (p.label === value ? { ...p, active: !p.active } : p))
    );
    setLoadedProducts(12);
  };

  const loadMore = () => setLoadedProducts((prev) => prev + 12);

  return (
    <div className="bg-[#0a0a0a] min-h-screen px-4 md:px-6 pt-24 md:pt-28 pb-8">
      <div className="grid grid-cols-1 gap-x-10 gap-y-10 items-start lg:grid-cols-[240px,1fr] lg:grid-rows-[auto,1fr]">
        {/* SIDEBAR */}
        <div className="lg:row-span-2 sticky top-28">
          <div className="grid grid-cols-1 gap-8 border border-white/10 p-6 md:p-8 bg-[#0f0f0f] rounded-xl backdrop-blur-sm">
            <div className="text-2xl leading-none font-bold italic text-red-500">
              {favoritesOnly ? "Mis Me gusta" : "Filtros"}
            </div>

            {/* UNIVERSOS */}
            {filters.some((f) => f.type === "universo") && (
              <div>
                <div className="text-sm uppercase tracking-[0.18em] mb-4 text-zinc-400 font-bold">
                  Universos
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {filters
                    .filter((e) => e.type === "universo")
                    .map((filter, index) => (
                      <FormCheck
                        key={index}
                        value={filter.label}
                        label={filter.label}
                        onCheck={(value) => setProductFilter(String(value))}
                        checked={!filter.active}
                        size="sm"
                      />
                    ))}
                </div>
              </div>
            )}

            {/* PRECIO */}
            <div>
              <div className="text-sm uppercase tracking-[0.18em] mb-4 text-zinc-400 font-bold">
                Precio
              </div>
              <div className="grid grid-cols-1 gap-4">
                {filters
                  .filter((e) => e.type === "price")
                  .map((filter, index) => (
                    <FormCheck
                      key={index}
                      value={filter.label}
                      label={filter.label}
                      onCheck={(value) => setProductFilter(String(value))}
                      checked={!filter.active}
                      size="sm"
                    />
                  ))}
              </div>
            </div>

            {/* POPULARIDAD */}
            <div>
              <div className="text-sm uppercase tracking-[0.18em] mb-4 text-zinc-400 font-bold">
                Popularidad
              </div>
              <div className="grid grid-cols-1 gap-4">
                {filters
                  .filter((e) => e.type === "popularity")
                  .map((filter, index) => (
                    <FormCheck
                      key={index}
                      value={filter.label}
                      label={filter.label}
                      onCheck={(value) => setProductFilter(String(value))}
                      checked={!filter.active}
                      size="sm"
                    />
                  ))}
              </div>
            </div>

            {/* PERSONAJES */}
            <div>
              <div className="text-sm uppercase tracking-[0.18em] mb-4 text-zinc-400 font-bold">
                Personajes
              </div>
              <div className="grid grid-cols-1 gap-4">
                {filters
                  .filter((e) => e.type === "personaje")
                  .map((filter, index) => (
                    <FormCheck
                      key={index}
                      value={filter.label}
                      label={filter.label}
                      onCheck={(value) => setProductFilter(String(value))}
                      checked={!filter.active}
                      size="sm"
                    />
                  ))}
              </div>
            </div>

            {/* PROVEEDORES */}
            {filters.some((f) => f.type === "proveedor") && (
              <div>
                <div className="text-sm uppercase tracking-[0.18em] mb-4 text-zinc-400 font-bold">
                  Creadores 3D
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {filters
                    .filter((e) => e.type === "proveedor")
                    .map((filter, index) => (
                      <FormCheck
                        key={index}
                        value={filter.label}
                        label={filter.label}
                        onCheck={(value) => setProductFilter(String(value))}
                        checked={!filter.active}
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

          {/* Search + clear */}
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

          <div className="text-sm uppercase tracking-[0.18em] my-6 text-zinc-400 font-bold">
            {filteredProducts.length} Variante{filteredProducts.length === 1 ? "" : "s"}
          </div>

          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {filteredProducts.map((product, index) => (
              <ProductCard
                key={product.slug ?? index}
                card={product}
                style={{ display: index < loadedProducts ? "" : "none" }}
              />
            ))}
          </div>

          {loadedProducts < filteredProducts.length && (
            <button
              className="flex max-w-max text-sm uppercase tracking-[0.25em] px-10 py-4 bg-red-500/10 border border-red-500/40 text-red-400 mx-auto mt-12 transition-all duration-300 hover:bg-red-500 hover:text-white hover:shadow-[0_0_20px_rgba(239,68,68,0.5)]"
              onClick={loadMore}
            >
              Cargar más
            </button>
          )}
        </div>
      </div>
    </div>
  );
};