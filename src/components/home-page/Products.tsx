import React, { useMemo, useState, useEffect } from "react";
import type { ClientConfig } from "@thebcms/client";
import { FormCheck } from "../form/Check";
import { ProductCard } from "../ProductCard";

/**
 * Exportamos ProductFilter para que otros módulos puedan importarlo:
 * import type { ProductFilter } from '../../home-page/Products';
 */
export interface ProductFilter {
  type: "category" | "gender" | "brand" | "price" | "popularity";
  label: string;
  value: string | number;
  active: boolean;
}

function getProductGenderSlug(p: any): string {
  // D1
  if (p?.personajeSlug) return String(p.personajeSlug);

  // BCMS fallback
  if (p?.gender?.slug) return String(p.gender.slug);

  return "";
}

function getProductCategorySlugs(p: any): string[] {
  // D1 (no categories por ahora)
  if (Array.isArray(p?.categorySlugs)) return p.categorySlugs.map(String);

  // BCMS fallback
  if (Array.isArray(p?.categories)) {
    return p.categories
      .map((c: any) => c?.meta?.en?.slug)
      .filter(Boolean)
      .map(String);
  }

  return [];
}

/**
 * HomeProducts (exportado como const)
 */
export const HomeProducts: React.FC<{
  products: any[];
  filters: any;
  bcms: ClientConfig;
}> = ({ products, filters, bcms }) => {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const allFilters = useMemo(() => {
    const genders = (filters?.genders || []).map((g: any) => ({
      label: g.title,
      value: g.slug,
    }));

    const categories = (filters?.categories || []).map((c: any) => ({
      label: c.title,
      value: c.slug,
    }));

    return [...genders, ...categories].filter((f) => f.value);
  }, [filters]);

  const filteredProducts = useMemo(() => {
    if (activeFilters.length === 0) return products;

    return products.filter((p: any) => {
      const g = getProductGenderSlug(p);
      const cats = getProductCategorySlugs(p);

      return activeFilters.includes(g) || cats.some((slug) => activeFilters.includes(slug));
    });
  }, [products, activeFilters]);

  return (
    <section className="bg-black/80 py-12">
      <div className="container mx-auto">
        <div className="flex flex-wrap justify-center gap-4 mb-12 max-w-[1200px] mx-auto px-4">
          {allFilters.map((f) => (
            <FormCheck
              key={String(f.value)}
              value={String(f.value)}
              label={f.label}
              checked={activeFilters.includes(String(f.value))}
              onCheck={() =>
                setActiveFilters((prev) =>
                  prev.includes(String(f.value)) ? prev.filter((v) => v !== String(f.value)) : [...prev, String(f.value)]
                )
              }
            />
          ))}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
            gap: isMobile ? "15px" : "25px",
            maxWidth: "1300px",
            margin: "0 auto",
            padding: "0 20px",
            width: "100%",
          }}
        >
          {filteredProducts.map((product: any) => (
            <ProductCard key={product.slug} card={product} bcms={bcms} />
          ))}
        </div>
      </div>
    </section>
  );
};