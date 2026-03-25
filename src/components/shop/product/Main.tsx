import React, { useEffect, useMemo, useState } from "react";
import { Gallery } from "./Gallery";
import { Details } from "./Details";
import { ProductCardD1 as ProductCard } from "../../ProductCardD1";
import { ContentFilter } from "./ContentFilter";

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

  // 🔥 detectar niveles
  const hasSuggestive = editions.some((ed: any) =>
    ed.images?.some((img: any) => img.nivel === "suggestive")
  );

  const hasNSFW = editions.some((ed: any) =>
    ed.images?.some((img: any) => img.nivel === "nsfw")
  );

  const otherProducts = Array.isArray(data?.otherProducts) ? data.otherProducts : [];

  return (
    <div className="w-full max-w-[1600px] mx-auto bg-black px-0 sm:px-0 md:px-6 pt-16 md:pt-20 lg:pt-20">
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.6fr)_560px] gap-4 sm:gap-5 xl:gap-8 items-start">
        
        <Gallery
          gallery={editions}
          activeEdition={activeEdition}
          fallbackImage={meta?.cover?.url || null}
        />

        <div className="xl:sticky xl:top-24 self-start w-full">
          
          {/* 🔥 SOLO aparece si aplica */}
          {(hasSuggestive || hasNSFW) && (
            <ContentFilter
              hasSuggestive={hasSuggestive}
              hasNSFW={hasNSFW}
            />
          )}

          <Details
            meta={meta}
            activeEdition={activeEdition}
            editionChange={setActiveEdition}
          />
        </div>
      </div>

      {otherProducts.length > 0 && (
        <div className="mt-14 sm:mt-16 px-4 sm:px-4 md:px-0">
          <div className="bg-red-500 text-white font-black italic text-lg sm:text-xl px-4 py-2 uppercase tracking-tight">
            Otras opciones gloriosas
          </div>

          <div className="grid grid-cols-2 gap-4 sm:gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 mt-5 sm:mt-6">
            {otherProducts.map((product: any, index: number) => (
              <ProductCard key={product.slug ?? index} card={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};