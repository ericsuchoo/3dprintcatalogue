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
  const [isSwitching, setIsSwitching] = useState(false);

  const [nivelContenido, setNivelContenido] = useState<"safe" | "suggestive" | "nsfw">("safe");

  // 🔥 escuchar cambios del toggle
  useEffect(() => {
    const update = () => {
      const stored = localStorage.getItem("contenido_nivel") as any;
      if (stored) setNivelContenido(stored);
    };

    update();
    window.addEventListener("contenido-change", update);

    return () => window.removeEventListener("contenido-change", update);
  }, []);

  // 🔥 CONTROL VISIBILIDAD
  const puedeVer = (img?: EditionImage) => {
    if (!img?.nivel) return true;

    if (nivelContenido === "nsfw") return true;
    if (nivelContenido === "suggestive") return img.nivel !== "nsfw";
    return img.nivel === "safe";
  };

  const editions = useMemo<EditionItem[]>(() => {
    return Array.isArray(gallery) ? gallery : [];
  }, [gallery]);

  const currentEdition = activeEdition || editions[0] || null;

  // 🔥 FILTRADO REAL (ANTES SOLO HACÍAS BLUR)
  const getSlidesFromEdition = (edition: EditionItem | null): EditionImage[] => {
    const imgs = edition?.images || [];

    if (imgs.length) {
      const visibles = imgs.filter(puedeVer);

      // si no hay visibles → fallback a blur (no romper UX)
      return visibles.length ? visibles : imgs;
    }

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
  }, [displayEdition, fallbackImage, nivelContenido]);

  useEffect(() => {
    if (!currentEdition || !displayEdition) return;

    const currentId = String(currentEdition?.id_edicion ?? "");
    const displayId = String(displayEdition?.id_edicion ?? "");

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

      setTimeout(() => {
        setIsSwitching(false);
      }, 140);
    };

    if (img.complete) {
      finishSwitch();
    } else {
      img.onload = finishSwitch;
      img.onerror = finishSwitch;
    }
  }, [currentEdition, displayEdition]);

  useEffect(() => {
    if (!mainSwiper) return;
    mainSwiper.update();
  }, [displaySlides, mainSwiper]);

  const swiperKey = String(displayEdition?.id_edicion ?? "default");

  return (
    <div className="w-full lg:max-w-full mx-auto flex flex-col lg:flex-row gap-4 mt-0 px-0 bg-black">

      {/* THUMBNAILS */}
      {displaySlides.length > 1 && (
        <div className="order-2 lg:order-1 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto w-full lg:w-20 lg:max-h-[840px] px-4 lg:px-0 bg-black">
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
                  "relative w-16 lg:w-full aspect-[3/4] rounded-xl overflow-hidden border-2 transition",
                  isActive ? "border-white scale-105" : "opacity-40 hover:opacity-100"
                )}
              >
                <img
                  src={item.url}
                  className="w-full h-full object-cover"
                />
              </button>
            );
          })}
        </div>
      )}

      {/* MAIN */}
      <div className="relative flex-1 bg-black rounded-[28px] overflow-hidden">

        <Swiper
          key={swiperKey}
          modules={[Navigation, Pagination, A11y]}
          onSwiper={setMainSwiper}
          onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
          navigation
          pagination={{ clickable: true }}
          className="product-swiper"
        >
          {displaySlides.map((item, index) => (
            <SwiperSlide key={index}>
              <img
                src={item.url}
                className="w-full h-auto lg:h-full object-contain lg:object-cover"
              />
            </SwiperSlide>
          ))}
        </Swiper>

      </div>
    </div>
  );
};