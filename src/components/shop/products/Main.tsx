import React, { useMemo, useState, useEffect } from "react";
import type { ShopPageDataD1, ProductLiteD1 } from "../../../types/shop-d1";
import { FormCheck } from "../../form/Check";
import { ProductCardD1 } from "../../ProductCardD1";

type Props = {
  data: ShopPageDataD1;
};

export const Main: React.FC<Props> = ({ data }) => {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (data.initialPersonajeId) {
      setActiveFilters((prev) =>
        prev.includes(data.initialPersonajeId!)
          ? prev
          : [...prev, data.initialPersonajeId!],
      );
    }
  }, [data.initialPersonajeId]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const allFilters = useMemo(() => {
    return [
      ...data.genders.map((g) => ({ label: g.title, value: g.slug })),
      ...data.categories.map((c) => ({ label: c.title, value: c.slug })),
      ...data.brands.map((b) => ({ label: b.title, value: b.slug })),
    ];
  }, [data.genders, data.categories, data.brands]);

  const filteredProducts = useMemo(() => {
    if (activeFilters.length === 0) return data.products;

    return data.products.filter((p: ProductLiteD1) => {
      const pid = p.personajeId != null ? String(p.personajeId) : "";
      const uid = p.universoId != null ? String(p.universoId) : "";
      const bid = p.proveedorId != null ? String(p.proveedorId) : "";

      return (
        activeFilters.includes(pid) ||
        activeFilters.includes(uid) ||
        activeFilters.includes(bid)
      );
    });
  }, [data.products, activeFilters]);

  return (
    <section className="bg-black/80 py-12">
      <div className="container mx-auto">
        <div className="flex flex-wrap justify-center gap-4 mb-12 max-w-[1200px] mx-auto px-4">
          {allFilters.map((f) => (
            <FormCheck
              key={f.value}
              value={String(f.value)}
              label={f.label}
              checked={activeFilters.includes(String(f.value))}
              onCheck={() =>
                setActiveFilters((prev) =>
                  prev.includes(String(f.value))
                    ? prev.filter((v) => v !== String(f.value))
                    : [...prev, String(f.value)],
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
          {filteredProducts.map((product) => (
            <ProductCardD1 key={product.slug} card={product} />
          ))}
        </div>
      </div>
    </section>
  );
};