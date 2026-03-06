import React, { useEffect, useMemo, useState } from "react";
import SearchIcon from "../../../assets/icons/search.svg?raw";
import TrashIcon from "../../../assets/icons/trash.svg?raw";

import type { ShopPageDataD1, ProductLiteD1 } from "../../../types/shop-d1";
import { FormCheck } from "../../form/Check";
import { ProductCardD1 as ProductCard } from "../../ProductCardD1";
import { useFavorites } from "../../../context/FavoritesContext";

export type ProductFilter = {
  type: "gender" | "category" | "brand" | "price" | "popularity";
  label: string;
  value: string | number;
  active: boolean;
};

interface Props {
  data: ShopPageDataD1;
}

export const Main: React.FC<Props> = ({ data }) => {
  const { favorites } = useFavorites();

  const [loadedProducts, setLoadedProducts] = useState(12);
  const [searchVal, setSearchVal] = useState("");

  const [filters, setFilters] = useState<ProductFilter[]>([
    { active: false, type: "price", label: "Lowest", value: 0 },
    { active: false, type: "price", label: "Most expensive", value: 1 },
    // Popularity en D1 no existe aún (units_sold/date del BCMS), pero dejamos UI
    { active: false, type: "popularity", label: "Best selling", value: 0 },
    { active: false, type: "popularity", label: "New comer", value: 1 },
  ]);

  // ✅ Genera filtros dinámicos desde D1 (personajes/universos/proveedores)
  useEffect(() => {
    const gendersFilters: ProductFilter[] = (data.genders || []).map((g) => ({
      active: false,
      label: g.title,
      value: g.slug,
      type: "gender",
    }));

    const categoriesFilters: ProductFilter[] = (data.categories || []).map((c) => ({
      active: false,
      label: c.title,
      value: c.slug,
      type: "category",
    }));

    const brandsFilters: ProductFilter[] = (data.brands || []).map((b) => ({
      active: false,
      label: b.title,
      value: b.slug,
      type: "brand",
    }));

    setFilters((prev) => {
      // Evita duplicados si el componente re-monta
      const base = prev.filter((p) => p.type === "price" || p.type === "popularity");
      return [...base, ...brandsFilters, ...categoriesFilters, ...gendersFilters];
    });
  }, [data.genders, data.categories, data.brands]);

  const activeFilters = useMemo(() => filters.filter((f) => f.active), [filters]);

  const clearFilters = () => {
    setFilters((prev) => prev.map((f) => ({ ...f, active: false })));
    setSearchVal("");
    setLoadedProducts(12);
  };

  const setProductFilter = (value: string | number) => {
    setFilters((prev) =>
      prev.map((p) => (p.label === value ? { ...p, active: !p.active } : p)),
    );
  };

  const filteredProducts = useMemo(() => {
    const products = (data.products || []) as ProductLiteD1[];

    return products
      .filter((p) => {
        // ✅ SOLO favoritos
        if (!favorites.includes(p.slug)) return false;

        let show = true;

        // ✅ búsqueda
        if (searchVal) {
          const haystack = `${p.title} ${p.subtitle ?? ""} ${p.description ?? ""} $${p.price}`
            .toLowerCase()
            .trim();
          show = show && haystack.includes(searchVal.toLowerCase().trim());
        }

        // ✅ filtros activos (IDs)
        activeFilters.forEach((filter) => {
          switch (filter.type) {
            case "gender": {
              // personajeId
              const pid = p.personajeId != null ? String(p.personajeId) : "";
              show = show && pid === String(filter.value);
              break;
            }
            case "category": {
              // universoId
              const uid = p.universoId != null ? String(p.universoId) : "";
              show = show && uid === String(filter.value);
              break;
            }
            case "brand": {
              // proveedorId
              const bid = p.proveedorId != null ? String(p.proveedorId) : "";
              show = show && bid === String(filter.value);
              break;
            }
          }
        });

        return show;
      })
      // ✅ sort price (si está activo)
      .sort((a, b) => {
        const priceFilter = activeFilters.find((f) => f.type === "price");
        if (!priceFilter) return 0;
        if (priceFilter.value === 0) return a.price - b.price;
        if (priceFilter.value === 1) return b.price - a.price;
        return 0;
      });
    // popularity lo dejamos sin efecto por ahora (no hay units_sold/date)
  }, [data.products, activeFilters, searchVal, favorites]);

  const loadMore = () => setLoadedProducts((prev) => prev + 12);

  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-10 items-start lg:grid-cols-[198px,1fr] lg:grid-rows-[auto,1fr]">
      {/* Sidebar */}
      <div className="lg:row-span-2 sticky top-0">
        <div className="grid grid-cols-1 gap-8 border border-appGray-300 p-8">
          <div className="text-2xl leading-none font-bold tracking-[-2%] italic text-red-500">
            Mis Me gusta
          </div>

          {/* Personajes */}
          <div>
            <div className="text-2xl leading-none tracking-[-2%] mb-5">Personajes</div>
            <div className="grid grid-cols-1 gap-4">
              {filters
                .filter((f) => f.type === "gender")
                .map((filter, index) => (
                  <FormCheck
                    key={index}
                    value={filter.label}
                    label={filter.label}
                    onCheck={(value) => setProductFilter(value)}
                    checked={!filter.active}
                    size="sm"
                  />
                ))}
            </div>
          </div>

          {/* Price */}
          <div>
            <div className="text-2xl leading-none tracking-[-2%] mb-5">Price</div>
            <div className="grid grid-cols-1 gap-4">
              {filters
                .filter((f) => f.type === "price")
                .map((filter, index) => (
                  <FormCheck
                    key={index}
                    value={filter.label}
                    label={filter.label}
                    onCheck={(value) => setProductFilter(value)}
                    checked={!filter.active}
                    size="sm"
                  />
                ))}
            </div>
          </div>

          {/* Popularity (UI sin efecto aún) */}
          <div>
            <div className="text-2xl leading-none tracking-[-2%] mb-5">Popularity</div>
            <div className="grid grid-cols-1 gap-4">
              {filters
                .filter((f) => f.type === "popularity")
                .map((filter, index) => (
                  <FormCheck
                    key={index}
                    value={filter.label}
                    label={filter.label}
                    onCheck={(value) => setProductFilter(value)}
                    checked={!filter.active}
                    size="sm"
                  />
                ))}
            </div>
          </div>

          {/* Universos */}
          <div>
            <div className="text-2xl leading-none tracking-[-2%] mb-5">Universos</div>
            <div className="grid grid-cols-1 gap-4">
              {filters
                .filter((f) => f.type === "category")
                .map((filter, index) => (
                  <FormCheck
                    key={index}
                    value={filter.label}
                    label={filter.label}
                    onCheck={(value) => setProductFilter(value)}
                    checked={!filter.active}
                    size="sm"
                  />
                ))}
            </div>
          </div>

          {/* Proveedores */}
          <div>
            <div className="text-2xl leading-none tracking-[-2%] mb-5">Proveedores</div>
            <div className="grid grid-cols-1 gap-4">
              {filters
                .filter((f) => f.type === "brand")
                .map((filter, index) => (
                  <FormCheck
                    key={index}
                    value={filter.label}
                    label={filter.label}
                    onCheck={(value) => setProductFilter(value)}
                    checked={!filter.active}
                    size="sm"
                  />
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="lg:col-start-2">
        <div className="flex flex-col gap-4 lg:flex-row lg:gap-8">
          <label className="flex items-center px-5 flex-1 border border-appGray-300">
            <div dangerouslySetInnerHTML={{ __html: SearchIcon }} className="w-[18px] h-[18px]" />
            <input
              type="search"
              value={searchVal}
              onChange={(e) => {
                setSearchVal(e.target.value);
                setLoadedProducts(12);
              }}
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