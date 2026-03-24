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
  nivel?: string; // 🔥 nuevo (opcional)
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

  // 🔥 modo NSFW persistente
  const [modoNSFW, setModoNSFW] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("modo_nsfw");
    setModoNSFW(stored === "true");
  }, []);

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

  // 🔥 helper
  const isNSFW = (img?: EditionImage) => img?.nivel === "nsfw";

  return (
    <div className="w-full lg:max-w-full mx-auto flex flex-col lg:flex-row gap-4 mt-0 px-0 bg-black">
      
      {/* 🔥 TOGGLE NSFW */}
      <div className="absolute top-4 right-4 z-40">
        <button
          onClick={() => {
            const next = !modoNSFW;
            setModoNSFW(next);
            localStorage.setItem("modo_nsfw", String(next));
          }}
          className="text-xs px-3 py-1 rounded bg-white/10 text-white border border-white/20 backdrop-blur"
        >
          {modoNSFW ? "NSFW ON 🔥" : "NSFW OFF"}
        </button>
      </div>

      {displaySlides.length > 1 && (
        <div className="order-2 lg:order-1 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto w-full lg:w-20 h-auto lg:max-h-[840px] pb-4 lg:pb-0 px-4 lg:px-0 custom-scrollbar flex-shrink-0 bg-black">
          {displaySlides.map((item, index) => {
            const isActive = index === activeIndex;
            const nsfw = isNSFW(item);

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
              >
                <img
                  src={item.url}
                  className={classNames(
                    "w-full h-full object-cover",
                    nsfw && !modoNSFW && "blur-md"
                  )}
                />

                {nsfw && !modoNSFW && (
                  <div className="absolute inset-0 flex items-center justify-center text-white text-[10px] bg-black/50">
                    +18
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      <div className="relative flex-1 group order-1 lg:order-2 bg-black rounded-[28px] overflow-hidden">

        <Swiper
          key={swiperKey}
          modules={[Navigation, Pagination, A11y]}
          onSwiper={setMainSwiper}
          onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
          slidesPerView={1}
          navigation
          pagination={{ clickable: true }}
          className="product-swiper"
        >
          {displaySlides.map((item, index) => {
            const nsfw = isNSFW(item);

            return (
              <SwiperSlide key={index}>
                <div className="relative w-full h-full flex items-center justify-center">
                  <img
                    src={item.url}
                    className={classNames(
                      "w-full h-auto object-contain transition",
                      nsfw && !modoNSFW && "blur-md"
                    )}
                  />

                  {nsfw && !modoNSFW && (
                    <div className="absolute inset-0 flex items-center justify-center text-white text-sm bg-black/40">
                      🔞 Contenido +18
                    </div>
                  )}
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>

      </div>
    </div>
  );
};