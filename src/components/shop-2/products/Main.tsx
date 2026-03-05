import React, { useEffect, useMemo, useState } from "react";
import SearchIcon from "../../../assets/icons/search.svg?raw";
import TrashIcon from "../../../assets/icons/trash.svg?raw";

import { FormCheck } from "../../form/Check";
import { ProductCardD1 as ProductCard } from "../../ProductCardD1";
import { useFavorites } from "../../../context/FavoritesContext";

import type { ProductLiteD1, ShopPageDataD1 } from "../../../types/shop-d1";

type ProductFilterType = "personaje" | "universo" | "proveedor";

type ProductFilter = {
  active: boolean;
  type: ProductFilterType;
  label: string;
  value: string; // siempre string para comparar fácil
};

interface Props {
  data: ShopPageDataD1; // ✅ en D1 tu wrapper pasa data completo
}

export const Main: React.FC<Props> = ({ data }) => {
  const { favorites } = useFavorites();

  const [loadedProducts, setLoadedProducts] = useState(12);
  const [searchVal, setSearchVal] = useState("");

  // ✅ armamos filtros desde data (personajes/universos/proveedores)
  const [filters, setFilters] = useState<ProductFilter[]>([]);

  useEffect(() => {
    const personajeFilters: ProductFilter[] = (data.genders || []).map((p) => ({
      active: false,
      label: p.title,
      value: String(p.slug), // en tu data: slug = id_personaje
      type: "personaje",
    }));

    const universoFilters: ProductFilter[] = (data.categories || []).map((u) => ({
      active: false,
      label: u.title,
      value: String(u.slug), // en tu data: slug = id_universo
      type: "universo",
    }));

    const proveedorFilters: ProductFilter[] = (data.brands || []).map((b) => ({
      active: false,
      label: b.title,
      value: String(b.slug), // en tu data: slug = id_proveedor
      type: "proveedor",
    }));

    setFilters([...proveedorFilters, ...universoFilters, ...personajeFilters]);
  }, [data.brands, data.categories, data.genders]);

  const activeFilters = useMemo(() => filters.filter((f) => f.active), [filters]);

  const clearFilters = () => {
    setFilters((prev) => prev.map((f) => ({ ...f, active: false })));
    setSearchVal("");
    setLoadedProducts(12);
  };

  const setProductFilter = (value: string) => {
    setFilters((prev) => prev.map((f) => (f.value === value ? { ...f, active: !f.active } : f)));
    setLoadedProducts(12);
  };

  const filteredProducts = useMemo(() => {
    return (data.products || [])
      .filter((p: ProductLiteD1) => {
        // ✅ favoritos: usa slug igual que antes
        if (!favorites.includes(p.slug)) return false;

        // search
        if (searchVal) {
          const haystack = `${p.title} ${p.subtitle ?? ""} ${p.price}`.toLowerCase();
          if (!haystack.includes(searchVal.toLowerCase())) return false;
        }

        // filtros activos
        let ok = true;
        for (const f of activeFilters) {
          if (f.type === "personaje") {
            ok = ok && String(p.personajeId ?? "") === f.value;
          }
          if (f.type === "universo") {
            ok = ok && String(p.universoId ?? "") === f.value;
          }
          if (f.type === "proveedor") {
            ok = ok && String(p.proveedorId ?? "") === f.value;
          }
        }
        return ok;
      });
  }, [data.products, activeFilters, searchVal, favorites]);

  const loadMore = () => setLoadedProducts((prev) => prev + 12);

  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-10 items-start lg:grid-cols-[198px,1fr] lg:grid-rows-[auto,1fr]">
      {/* SIDEBAR */}
      <div className="lg:row-span-2 sticky top-0">
        <div className="grid grid-cols-1 gap-8 border border-appGray-300 p-8">
          <div className="text-2xl leading-none font-bold tracking-[-2%] italic text-red-500">
            Mis Me gusta
          </div>

          {/* PERSONAJES */}
          <div>
            <div className="text-2xl leading-none tracking-[-2%] mb-5">Personajes</div>
            <div className="grid grid-cols-1 gap-4">
              {filters
                .filter((e) => e.type === "personaje")
                .map((filter, index) => (
                  <FormCheck
                    key={`${filter.type}-${filter.value}-${index}`}
                    value={filter.value}
                    label={filter.label}
                    onCheck={(value) => setProductFilter(String(value))}
                    checked={!filter.active}
                    size="sm"
                  />
                ))}
            </div>
          </div>

          {/* UNIVERSOS */}
          <div>
            <div className="text-2xl leading-none tracking-[-2%] mb-5">Universos</div>
            <div className="grid grid-cols-1 gap-4">
              {filters
                .filter((e) => e.type === "universo")
                .map((filter, index) => (
                  <FormCheck
                    key={`${filter.type}-${filter.value}-${index}`}
                    value={filter.value}
                    label={filter.label}
                    onCheck={(value) => setProductFilter(String(value))}
                    checked={!filter.active}
                    size="sm"
                  />
                ))}
            </div>
          </div>

          {/* PROVEEDORES */}
          <div>
            <div className="text-2xl leading-none tracking-[-2%] mb-5">Proveedores</div>
            <div className="grid grid-cols-1 gap-4">
              {filters
                .filter((e) => e.type === "proveedor")
                .map((filter, index) => (
                  <FormCheck
                    key={`${filter.type}-${filter.value}-${index}`}
                    value={filter.value}
                    label={filter.label}
                    onCheck={(value) => setProductFilter(String(value))}
                    checked={!filter.active}
                    size="sm"
                  />
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="lg:col-start-2">
        <div className="flex flex-col gap-4 lg:flex-row lg:gap-8">
          <label className="flex items-center px-5 flex-1 border border-appGray-300">
            <div dangerouslySetInnerHTML={{ __html: SearchIcon }} className="w-[18px] h-[18px]" />
            <input
              type="search"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              placeholder="Buscar en mis favoritos..."
              className="bg-transparent px-1.5 py-[15px] w-full text-lg leading-none tracking-[-2%] placeholder:text-appText focus:outline-none"
            />
          </label>

          <button
            className="flex items-center gap-1.5 p-[15px] transition-colors duration-300 text-appError bg-appError/10 hover:bg-appError/20"
            onClick={clearFilters}
          >
            <div dangerouslySetInnerHTML={{ __html: TrashIcon }} className="w-[18px] h-[18px]" />
            <span className="text-lg leading-none tracking-[-2%] mb-1">Clear filters</span>
          </button>
        </div>

        <div className="text-2xl leading-none tracking-[-2%] my-6">
          {filteredProducts.length} Product{filteredProducts.length === 1 ? "" : "s"} guardado
          {filteredProducts.length === 1 ? "" : "s"}
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product, index) => (
            <ProductCard
              key={product.slug}
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
            Load more
          </button>
        )}
      </div>
    </div>
  );
};