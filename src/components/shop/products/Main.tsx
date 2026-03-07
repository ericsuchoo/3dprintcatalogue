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

  // ✅ si viene personajeId por URL, activarlo de inicio
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
      prev.map((f) =>
        f.type === "price" || f.type === "popularity" || f.type === "personaje" || f.type === "universo" || f.type === "proveedor"
          ? { ...f, active: false }
          : f
      )
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
    <div className="grid grid-cols-1 gap-x-8 gap-y-10 items-start lg:grid-cols-[240px,1fr] lg:grid-rows-[auto,1fr]">
      {/* SIDEBAR */}
      <div className="lg:row-span-2 sticky top-0">
        <div className="grid grid-cols-1 gap-8 border border-appGray-300 p-8 bg-white/95">
          <div className="text-2xl leading-none font-bold tracking-[-2%] italic text-red-500">
            {favoritesOnly ? "Mis Me gusta" : "Filtros"}
          </div>

          {/* UNIVERSOS */}
          {filters.some((f) => f.type === "universo") && (
            <div>
              <div className="text-2xl leading-none tracking-[-2%] mb-5">Universos</div>
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
            <div className="text-2xl leading-none tracking-[-2%] mb-5">Precio</div>
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
            <div className="text-2xl leading-none tracking-[-2%] mb-5">Popularidad</div>
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
            <div className="text-2xl leading-none tracking-[-2%] mb-5">Personajes</div>
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
              <div className="text-2xl leading-none tracking-[-2%] mb-5">Creadores 3D</div>
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
        {/* ✅ HEADER DE FILTRO POR PERSONAJE */}
        {(data.personajeNombre || data.clearFilterHref) && (
          <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              {data.personajeNombre && (
                <h2 className="text-2xl md:text-3xl font-black uppercase italic text-white tracking-tighter">
                  Shop: <span className="text-red-500">{data.personajeNombre}</span>
                </h2>
              )}
            </div>

            {data.clearFilterHref && (
              <a
                href={data.clearFilterHref}
                className="inline-flex items-center justify-center px-5 py-2 rounded-full border border-white/10 text-white/70 hover:text-white hover:border-white/40 transition uppercase tracking-[0.22em] font-black text-[10px] md:text-xs bg-white/5 hover:bg-white/10"
              >
                Quitar filtro
              </a>
            )}
          </div>
        )}

        {/* Search + clear */}
        <div className="flex flex-col gap-4 lg:flex-row lg:gap-8">
          <label className="flex items-center px-5 flex-1 border border-appGray-300 bg-white/95">
            <div dangerouslySetInnerHTML={{ __html: SearchIcon }} className="w-[18px] h-[18px]" />
            <input
              type="search"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              placeholder={favoritesOnly ? "Buscar en mis favoritos..." : "Buscar figuras..."}
              className="bg-transparent px-1.5 py-[15px] w-full text-lg leading-none tracking-[-2%] placeholder:text-appText focus:outline-none"
            />
          </label>

          <button
            className="flex items-center gap-1.5 p-[15px] transition-colors duration-300 text-appError bg-appError/10 hover:bg-appError/20"
            onClick={clearFilters}
          >
            <div dangerouslySetInnerHTML={{ __html: TrashIcon }} className="w-[18px] h-[18px]" />
            <span className="text-lg leading-none tracking-[-2%] mb-1">Limpiar Filtros</span>
          </button>
        </div>

        <div className="text-2xl leading-none tracking-[-2%] my-6 text-white">
          {filteredProducts.length} Variante{filteredProducts.length === 1 ? "" : "s"}
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
            className="flex max-w-max text-2xl leading-none tracking-[-0.5px] px-14 pt-3.5 pb-[18px] bg-white border border-appGray-400 mx-auto mt-12 transition-colors duration-300 hover:bg-appText hover:text-white"
            onClick={loadMore}
          >
            Cargar más
          </button>
        )}
      </div>
    </div>
  );
};