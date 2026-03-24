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
  nivel?: string; // 👈 NUEVO (opcional, no rompe nada)
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
  const [isSwitching, setIsSwitching] = useState(false);

  // 🔥 NSFW MODE (sin UI visible, solo lógica)
  const [modoNSFW, setModoNSFW] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("modo_nsfw");
    setModoNSFW(stored === "true");
  }, []);

  const isNSFW = (img?: EditionImage) => img?.nivel === "nsfw";

  const editions = useMemo<EditionItem[]>(() => {
    return Array.isArray(gallery) ? gallery : [];
  }, [gallery]);

  const currentEdition = activeEdition || editions[0] || null;

  const getSlidesFromEdition = (edition: EditionItem | null): EditionImage[] => {
    const imgs = edition?.images || [];
    if (imgs.length) return imgs;

    if (edition?.img) return [{ url: edition.img }];
    if (fallbackImage) return [{ url: fallbackImage }];

    return [];
  };

  useEffect(() => {
    if (!displayEdition && currentEdition) {
      setDisplayEdition(currentEdition);
    }
  }, [currentEdition, displayEdition]);

  const displaySlides = useMemo<EditionImage[]>(() => {
    return getSlidesFromEdition(displayEdition);
  }, [displayEdition, fallbackImage]);

  useEffect(() => {
    if (!currentEdition) return;
    if (!displayEdition) return;

    const currentId = String(currentEdition?.id_edicion ?? currentEdition?.nombre_edicion ?? "");
    const displayId = String(displayEdition?.id_edicion ?? displayEdition?.nombre_edicion ?? "");

    if (currentId === displayId) return;

    const nextSlides = getSlidesFromEdition(currentEdition);
    const firstImageUrl = nextSlides[0]?.url;

    if (!firstImageUrl) {
      setDisplayEdition(currentEdition);
      setActiveIndex(0);
      return;
    }

    setIsSwitching(true);

    const img = new Image();
    img.src = firstImageUrl;

    const finishSwitch = () => {
      setDisplayEdition(currentEdition);
      setActiveIndex(0);

      window.setTimeout(() => {
        setIsSwitching(false);
      }, 140);
    };

    if (img.complete) {
      finishSwitch();
    } else {
      img.onload = finishSwitch;
      img.onerror = finishSwitch;
    }
  }, [currentEdition, displayEdition, fallbackImage]);

  useEffect(() => {
    if (!mainSwiper) return;
    mainSwiper.update();
  }, [displaySlides, mainSwiper]);

  const swiperKey = String(
    displayEdition?.id_edicion ?? displayEdition?.nombre_edicion ?? "default"
  );

  return (
    <div className="w-full lg:max-w-full mx-auto flex flex-col lg:flex-row gap-4 mt-0 px-0 bg-black">
      
      {/* 🔹 THUMBNAILS (SIN CAMBIAR DISEÑO) */}
      {displaySlides.length > 1 && (
        <div className="order-2 lg:order-1 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto w-full lg:w-20 h-auto lg:max-h-[840px] pb-4 lg:pb-0 px-4 lg:px-0 custom-scrollbar flex-shrink-0 bg-black">
          {displaySlides.map((item: EditionImage, index: number) => {
            const isActive = index === activeIndex;

            return (
              <button
                key={`${item.url}-${index}`}
                onClick={() => {
                  setActiveIndex(index);
                  mainSwiper?.slideTo(index);
                }}
                className={classNames(
                  "relative w-16 lg:w-full aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all duration-300 flex-shrink-0",
                  isActive
                    ? "border-white scale-105 shadow-md"
                    : "border-transparent opacity-40 hover:opacity-100"
                )}
                title={displayEdition?.nombre_edicion || `Imagen ${index + 1}`}
              >
                <img
                  src={item.url}
                  alt={displayEdition?.nombre_edicion || `Imagen ${index + 1}`}
                  className={classNames(
                    "w-full h-full object-cover block pointer-events-none",
                    isNSFW(item) && !modoNSFW && "blur-md"
                  )}
                  loading="lazy"
                />

                {isNSFW(item) && !modoNSFW && (
                  <div className="absolute inset-0 flex items-center justify-center text-white text-[10px] bg-black/50">
                    +18
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* 🔹 MAIN SWIPER (INTACTO) */}
      <div className="relative flex-1 group order-1 lg:order-2 bg-black rounded-[28px] overflow-hidden shadow-[0_12px_30px_rgba(0,0,0,0.18)] mt-2 lg:mt-0">
        
        <div
          className={classNames(
            "transition-all duration-200",
            isSwitching ? "opacity-90 blur-[1px]" : "opacity-100 blur-0"
          )}
        >
          <Swiper
            key={swiperKey}
            modules={[Navigation, Pagination, A11y]}
            onSwiper={setMainSwiper}
            onSlideChange={(swiper) => {
              setActiveIndex(swiper.activeIndex);
            }}
            spaceBetween={0}
            slidesPerView={1}
            navigation
            pagination={{ clickable: true }}
            className="product-swiper"
            initialSlide={0}
          >
            {displaySlides.length ? (
              displaySlides.map((item: EditionImage, index: number) => (
                <SwiperSlide
                  key={`${item.url}-${index}`}
                  className="bg-black flex items-center justify-center h-auto lg:h-[840px]"
                >
                  <div className="relative w-full h-full flex items-center justify-center">
                    <img
                      src={item.url}
                      alt={displayEdition?.nombre_edicion || `Imagen ${index + 1}`}
                      className={classNames(
                        "w-full h-auto max-h-[78vh] lg:h-full lg:max-h-none object-contain lg:object-cover block",
                        isNSFW(item) && !modoNSFW && "blur-md"
                      )}
                      loading={index === 0 ? "eager" : "lazy"}
                    />

                    {isNSFW(item) && !modoNSFW && (
                      <div className="absolute inset-0 flex items-center justify-center text-white text-sm bg-black/40">
                        🔞 Contenido +18
                      </div>
                    )}
                  </div>
                </SwiperSlide>
              ))
            ) : (
              <SwiperSlide className="bg-black flex items-center justify-center min-h-[320px] lg:h-[840px]">
                <div className="w-full h-full bg-zinc-900" />
              </SwiperSlide>
            )}
          </Swiper>
        </div>

        {isSwitching && (
          <div className="absolute inset-0 z-30 pointer-events-none bg-black/10 backdrop-blur-[1px]" />
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/45 via-black/10 to-transparent z-10" />

        {displayEdition?.nombre_edicion && (
          <div className="absolute bottom-5 left-5 z-20 pointer-events-none">
            <span className="bg-black/82 text-white text-[9px] md:text-[10px] font-black px-4 py-2 uppercase tracking-[0.24em] rounded-full backdrop-blur-md border border-red-500/45 shadow-[0_0_14px_rgba(239,68,68,0.28)]">
              {displayEdition.nombre_edicion}
            </span>
          </div>
        )}

        <div className="absolute bottom-5 right-5 z-20 pointer-events-none">
          <span className="bg-black/88 text-white text-[9px] font-black px-4 py-2 uppercase tracking-[0.24em] rounded-full backdrop-blur-md border border-red-500/55 shadow-[0_0_16px_rgba(239,68,68,0.35)]">
            ⚡ {displaySlides.length} PERSPECTIVA{displaySlides.length === 1 ? "" : "S"}
          </span>
        </div>
      </div>
    </div>
  );
};