import React from "react";
import { Btn, type BtnTheme } from "../Btn";

interface Props {
  data: {
    meta: any;
    productsCount: number;
  }[];
  ctaTheme: BtnTheme;
}

function getImageSrc(media: any): string | null {
  if (!media) return null;
  if (typeof media.url === "string" && media.url.length > 0) return media.url;
  if (typeof media.src === "string" && media.src.length > 0) return media.src;
  return null;
}

/* pagina de cards universo */
const FALLBACK_IMG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='800'%3E%3Crect width='100%25' height='100%25' fill='black'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='white' font-size='28' font-family='Arial'%3ESin imagen%3C/text%3E%3C/svg%3E";

export const HomeCategories: React.FC<Props> = ({ data, ctaTheme }) => {
  return (
    <section>
      <div className="grid grid-cols-2 lg:grid-cols-3 bg-black">
        {data.map((item, index) => {
          const card = item;
          const title = card.meta?.title || "Universo";

          const media = card.meta?.gallery?.[0];
          const imageUrl = getImageSrc(media);

          const universoId = card.meta?.id_universo;

          const href =
            card.productsCount > 0 && universoId != null
              ? `/explorar?universoId=${encodeURIComponent(String(universoId))}`
              : "/explorar";

          const isLastOddCard = data.length % 2 !== 0 && index === data.length - 1;

          return (
            <div
              key={index}
              className={[
                "group relative aspect-square flex items-end overflow-hidden bg-black",
                "p-4 md:p-6 lg:p-9",
                isLastOddCard ? "col-span-2 lg:col-span-1" : "",
              ].join(" ")}
            >
              <div className="relative z-20 transition-all duration-500 ease-out group-hover:translate-y-4 group-hover:opacity-0">
                <h2 className="flex items-end flex-wrap gap-2 md:gap-4 text-white leading-none drop-shadow-lg">
                  <span className="text-[20px] sm:text-[24px] md:text-[32px] lg:text-[40px] font-bold uppercase italic tracking-tighter">
                    {title}
                  </span>
                  <span className="text-[13px] sm:text-[15px] md:text-[18px] lg:text-[34px] font-light opacity-80">
                    ({card.productsCount} Personaje{card.productsCount !== 1 ? "s" : ""})
                  </span>
                </h2>
              </div>

              <a
                href={href}
                className="absolute z-30 inset-0 bg-black/60 flex flex-col items-center justify-center text-center transition-all duration-500 ease-in-out opacity-0 group-hover:opacity-100 backdrop-blur-[3px]"
              >
                <div className="text-white text-[20px] sm:text-[24px] md:text-[28px] lg:text-[36px] font-black uppercase italic leading-none mb-4 md:mb-6 translate-y-4 transition-transform duration-500 group-hover:translate-y-0 [text-shadow:_-2px_-2px_0_#000,_2px_-2px_0_#000,_-2px_2px_0_#000,_2px_2px_0_#000]">
                  {title}
                </div>
                <div className="translate-y-8 transition-transform duration-500 group-hover:translate-y-0">
                  <Btn theme={ctaTheme} label="Ver Personajes" />
                </div>
              </a>

              <div className="absolute top-0 left-0 size-full z-0">
                <img
                  src={imageUrl || FALLBACK_IMG}
                  alt={title}
                  className="size-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                  loading="lazy"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:from-black/40 transition-colors duration-500" />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};