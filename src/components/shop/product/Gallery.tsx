import React, { useEffect, useMemo, useState } from "react";
import classNames from "classnames";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperClass } from "swiper";
import { Navigation, Pagination, A11y } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

type EditionImage = {
  url: string;
  nivel?: string;
};

type EditionItem = {
  id_edicion?: number | string;
  nombre_edicion?: string;
  img?: string | null;
  images?: EditionImage[];
};

interface Props {
  gallery: EditionItem[];
  activeEdition: EditionItem | null;
  fallbackImage?: string | null;
}

export const Gallery: React.FC<Props> = ({
  gallery,
  activeEdition,
  fallbackImage,
}) => {
  const [mainSwiper, setMainSwiper] = useState<SwiperClass | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [displayEdition, setDisplayEdition] = useState<EditionItem | null>(null);

  const [nivelContenido, setNivelContenido] =
    useState<"safe" | "suggestive" | "nsfw">("safe");

  useEffect(() => {
    const update = () => {
      const stored = localStorage.getItem("contenido_nivel") as any;
      if (stored) setNivelContenido(stored);
    };

    update();
    window.addEventListener("contenido-change", update);
    return () => window.removeEventListener("contenido-change", update);
  }, []);

  const puedeVer = (img?: EditionImage) => {
    if (!img?.nivel) return true;
    if (nivelContenido === "nsfw") return true;
    if (nivelContenido === "suggestive") return img.nivel !== "nsfw";
    return img.nivel === "safe";
  };

  const editions = useMemo(() => (Array.isArray(gallery) ? gallery : []), [gallery]);

  const currentEdition = activeEdition || editions[0] || null;

  const getSlidesFromEdition = (edition: EditionItem | null): EditionImage[] => {
    const imgs = edition?.images || [];
    if (imgs.length) return imgs;

    if (edition?.img) return [{ url: edition.img }];
    if (fallbackImage) return [{ url: fallbackImage }];

    return [];
  };

  useEffect(() => {
    if (!currentEdition) return;

    const currentId = String(currentEdition?.id_edicion ?? "");
    const displayId = String(displayEdition?.id_edicion ?? "");

    if (currentId === displayId) return;

    setDisplayEdition(currentEdition);
    setActiveIndex(0);

    if (mainSwiper) {
      mainSwiper.slideTo(0);
    }
  }, [currentEdition, mainSwiper]);

  const displaySlides = useMemo(
    () => getSlidesFromEdition(displayEdition),
    [displayEdition, fallbackImage]
  );

  const swiperKey = String(displayEdition?.id_edicion ?? "default");

  return (
    <div className="w-full flex flex-col lg:flex-row gap-4 bg-black">

      {/* ===================== */}
      {/* MAIN VIEWER */}
      {/* ===================== */}
      <div className="relative flex-1 bg-black rounded-[28px] overflow-hidden flex items-center justify-center">

        <Swiper
          key={swiperKey}
          modules={[Navigation, Pagination, A11y]}
          onSwiper={setMainSwiper}
          onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
          navigation
          pagination={{ clickable: true }}
        >
          {displaySlides.map((item, index) => (
            <SwiperSlide key={index}>
              <div className="relative w-full flex items-center justify-center overflow-hidden">

                {/* 🔥 BADGES SOBRE LA IMAGEN */}
                {index === 0 && (
                  <>
                    <div className="absolute top-4 left-4 z-20">
                      <span className="bg-black/80 text-white text-[10px] px-4 py-2 uppercase rounded-full">
                        {displayEdition?.nombre_edicion}
                      </span>
                    </div>

                    <div className="absolute top-4 right-4 z-20">
                      <span className="bg-black/80 text-white text-[10px] px-4 py-2 uppercase rounded-full">
                        ⚡ {displaySlides.length} PERSPECTIVA{displaySlides.length === 1 ? "" : "S"}
                      </span>
                    </div>
                  </>
                )}

                <img
                  src={item.url}
                  className={classNames(
                    "max-h-[85vh] max-w-full object-contain",
                    !puedeVer(item) && "blur-md"
                  )}
                />

                {!puedeVer(item) && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white">
                    {item.nivel === "nsfw"
                      ? "🔞 Contenido +18"
                      : "⚠️ Contenido sugestivo"}
                  </div>
                )}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

      </div>

      {/* ===================== */}
      {/* THUMBNAILS */}
      {/* ===================== */}
      {displaySlides.length > 1 && (
        <div className="hidden xl:flex flex-col gap-2 w-20 max-h-[840px] overflow-y-auto scroll-invisible order-2">

          {displaySlides.map((item, index) => {
            const isActive = index === activeIndex;

            return (
              <button
                key={index}
                onClick={() => {
                  setActiveIndex(index);
                  mainSwiper?.slideTo(index);
                }}
                className={classNames(
                  "relative w-full aspect-[3/4] rounded-xl overflow-hidden border-2 transition",
                  isActive
                    ? "border-white scale-105"
                    : "opacity-40 hover:opacity-100"
                )}
              >
                <img
                  src={item.url}
                  className={classNames(
                    "w-full h-full object-cover",
                    !puedeVer(item) && "blur-md"
                  )}
                />

                {!puedeVer(item) && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white text-xs">
                    {item.nivel === "nsfw" ? "🔞" : "⚠️"}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

    </div>
  );
};