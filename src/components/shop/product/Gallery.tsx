import React, { useMemo, useState } from "react";
import classNames from "classnames";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperClass } from "swiper";
import { Navigation, Pagination, A11y } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

type EditionItem = {
  id_edicion?: number | string;
  nombre_edicion?: string;
  img?: string | null;
};

interface Props {
  gallery: EditionItem[]; // meta.editions
  activeEdition: EditionItem | null;
  onEditionChange: (e: EditionItem) => void;
}

export const Gallery: React.FC<Props> = ({ gallery, activeEdition, onEditionChange }) => {
  const [mainSwiper, setMainSwiper] = useState<SwiperClass | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // solo ediciones que tengan imagen
  const slides = useMemo(() => {
    const safe = Array.isArray(gallery) ? gallery : [];
    // si ninguna tiene img, igual dejamos el array para que no truene
    return safe.length ? safe : [];
  }, [gallery]);

  // Si activeEdition no viene, usamos la primera
  const current = activeEdition || slides[0] || null;

  // armamos índice del active para sync
  const currentIndex = useMemo(() => {
    if (!current) return 0;
    const idx = slides.findIndex(
      (e) =>
        String(e?.id_edicion ?? e?.nombre_edicion ?? "") ===
        String(current?.id_edicion ?? current?.nombre_edicion ?? "")
    );
    return idx >= 0 ? idx : 0;
  }, [slides, current]);

  return (
    <div className="w-full lg:max-w-full mx-auto flex flex-col lg:flex-row gap-4 mt-16 lg:mt-24 px-0 bg-black">
      {/* THUMBNAILS */}
      {slides.length > 1 && (
        <div className="order-2 lg:order-1 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto w-full lg:w-20 h-auto lg:max-h-[840px] pb-4 lg:pb-0 px-4 lg:px-0 custom-scrollbar flex-shrink-0 bg-black">
          {slides.map((item, index) => {
            const imageUrl = item?.img || "";
            const isActive = index === currentIndex;

            return (
              <button
                key={`${item?.id_edicion ?? item?.nombre_edicion ?? index}-${index}`}
                onClick={() => {
                  onEditionChange(item);
                  mainSwiper?.slideTo(index);
                }}
                className={classNames(
                  "relative w-16 lg:w-full aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all duration-300 flex-shrink-0",
                  isActive ? "border-white scale-105 shadow-md" : "border-transparent opacity-40 hover:opacity-100"
                )}
                title={item?.nombre_edicion || "Edición"}
              >
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={item?.nombre_edicion || `Edición ${index + 1}`}
                    className="w-full h-full object-cover block pointer-events-none"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-zinc-900" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* SWIPER PRINCIPAL */}
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
          modules={[Navigation, Pagination, A11y]}
          onSwiper={setMainSwiper}
          onSlideChange={(swiper) => {
            setActiveIndex(swiper.activeIndex);
            const next = slides[swiper.activeIndex];
            if (next) onEditionChange(next);
          }}
          spaceBetween={0}
          slidesPerView={1}
          navigation
          pagination={{ clickable: true }}
          className="product-swiper"
          initialSlide={currentIndex}
        >
          {slides.length ? (
            slides.map((item, index) => {
              const imageUrl = item?.img || "";
              return (
                <SwiperSlide key={`${item?.id_edicion ?? item?.nombre_edicion ?? index}-${index}`} className="bg-black flex items-center justify-center">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={item?.nombre_edicion || `Edición ${index + 1}`}
                      className="w-full h-full object-cover block"
                      loading={index === 0 ? "eager" : "lazy"}
                    />
                  ) : (
                    <div className="w-full h-full bg-zinc-900" />
                  )}
                </SwiperSlide>
              );
            })
          ) : (
            <SwiperSlide className="bg-black flex items-center justify-center">
              <div className="w-full h-full bg-zinc-900" />
            </SwiperSlide>
          )}
        </Swiper>

        <div className="absolute top-6 right-6 z-10 pointer-events-none">
          <span className="bg-black/80 text-white text-[9px] font-bold px-4 py-2 uppercase tracking-[3px] rounded-full backdrop-blur-sm">
            {slides.length} EDICIONES
          </span>
        </div>
      </div>
    </div>
  );
};