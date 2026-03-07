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
  onEditionChange: (e: EditionItem) => void;
  fallbackImage?: string | null;
}

export const Gallery: React.FC<Props> = ({
  gallery,
  activeEdition,
  onEditionChange,
  fallbackImage,
}) => {
  const [mainSwiper, setMainSwiper] = useState<SwiperClass | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const editions = useMemo(() => {
    return Array.isArray(gallery) ? gallery : [];
  }, [gallery]);

  const currentEdition = activeEdition || editions[0] || null;

  const slides = useMemo(() => {
    const imgs = currentEdition?.images || [];
    if (imgs.length) return imgs;

    if (currentEdition?.img) return [{ url: currentEdition.img }];
    if (fallbackImage) return [{ url: fallbackImage }];

    return [];
  }, [currentEdition, fallbackImage]);

  useEffect(() => {
    setActiveIndex(0);
    if (mainSwiper) {
      mainSwiper.slideTo(0);
    }
  }, [currentEdition?.id_edicion, mainSwiper]);

  return (
    <div className="w-full lg:max-w-full mx-auto flex flex-col lg:flex-row gap-4 mt-16 lg:mt-24 px-0 bg-black">
      {slides.length > 1 && (
        <div className="order-2 lg:order-1 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto w-full lg:w-20 h-auto lg:max-h-[840px] pb-4 lg:pb-0 px-4 lg:px-0 custom-scrollbar flex-shrink-0 bg-black">
          {slides.map((item, index) => {
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
                title={currentEdition?.nombre_edicion || `Imagen ${index + 1}`}
              >
                <img
                  src={item.url}
                  alt={currentEdition?.nombre_edicion || `Imagen ${index + 1}`}
                  className="w-full h-full object-cover block pointer-events-none"
                  loading="lazy"
                />
              </button>
            );
          })}
        </div>
      )}

      <div className="relative flex-1 group order-1 lg:order-2 bg-white rounded-3xl overflow-hidden shadow-sm">
        <style
          dangerouslySetInnerHTML={{
            __html: `
              .swiper-button-next, .swiper-button-prev { 
                color: #000 !important; 
                background: rgba(255,255,255,0.7);
                width: 35px !important;
                height: 35px !important;
                border-radius: 999px;
                transform: scale(0.6);
                z-index: 20;
              }
              .swiper-pagination-bullet-active { background: #000 !important; }
              .product-swiper { width: 100% !important; height: 100% !important; background: white !important; }
              @media (min-width: 1024px) { .product-swiper { height: 840px !important; } }
              .custom-scrollbar::-webkit-scrollbar { width: 3px; }
              .custom-scrollbar::-webkit-scrollbar-thumb { background: transparent; border-radius: 999px; }
            `,
          }}
        />

        <Swiper
          key={String(currentEdition?.id_edicion ?? "default")}
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
          {slides.length ? (
            slides.map((item, index) => (
              <SwiperSlide
                key={`${item.url}-${index}`}
                className="bg-black flex items-center justify-center"
              >
                <img
                  src={item.url}
                  alt={currentEdition?.nombre_edicion || `Imagen ${index + 1}`}
                  className="w-full h-full object-cover block"
                  loading={index === 0 ? "eager" : "lazy"}
                />
              </SwiperSlide>
            ))
          ) : (
            <SwiperSlide className="bg-black flex items-center justify-center">
              <div className="w-full h-full bg-zinc-900" />
            </SwiperSlide>
          )}
        </Swiper>

        <div className="absolute top-6 right-6 z-10 pointer-events-none">
          <span className="bg-black/80 text-white text-[9px] font-bold px-4 py-2 uppercase tracking-[3px] rounded-full backdrop-blur-sm">
            {slides.length} PERSPECTIVA{slides.length === 1 ? "" : "S"}
          </span>
        </div>
      </div>
    </div>
  );
};