import React, { useEffect, useMemo, useState } from "react";
import { Gallery } from "./Gallery";
import { Details } from "./Details";
import { ProductCardD1 as ProductCard } from "../../ProductCardD1";

interface Props {
  data: any;
}

export const Main: React.FC<Props> = ({ data }) => {
  const meta = data?.meta || {};

  const editions = useMemo(() => {
    return Array.isArray(meta?.editions) ? meta.editions : [];
  }, [meta]);

  const [activeEdition, setActiveEdition] = useState<any>(editions[0] || null);

  useEffect(() => {
    setActiveEdition(editions[0] || null);
  }, [editions]);

  const otherProducts = Array.isArray(data?.otherProducts) ? data.otherProducts : [];

  return (
    <div className="container bg-black px-4 md:px-6 pt-16 md:pt-20 lg:pt-20">
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_620px] gap-6 xl:gap-8 items-start">
        <Gallery
          gallery={editions}
          activeEdition={activeEdition}
          fallbackImage={meta?.cover?.url || null}
        />

        <div className="xl:sticky xl:top-24 self-start">
          <Details
            meta={meta}
            activeEdition={activeEdition}
            editionChange={setActiveEdition}
          />
        </div>
      </div>

      {otherProducts.length > 0 && (
        <div className="mt-16">
          <div className="bg-red-500 text-white font-black italic text-xl px-4 py-2 uppercase tracking-tight">
            Otras opciones gloriosas
          </div>

          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 mt-6">
            {otherProducts.map((product: any, index: number) => (
              <ProductCard
                key={product.slug ?? index}
                card={product}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};