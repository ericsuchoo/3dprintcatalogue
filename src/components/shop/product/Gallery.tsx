import React, { useEffect, useMemo, useRef, useState } from "react";
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
  const [previousEdition, setPreviousEdition] = useState<EditionItem | null>(null);

  const [isSwitching, setIsSwitching] = useState(false);
  const [showTransitionLayer, setShowTransitionLayer] = useState(false);

  const switchTimeoutRef = useRef<number | null>(null);
  const finalTimeoutRef = useRef<number | null>(null);

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

  const displaySlides = useMemo<EditionImage[]>(() => {
    return getSlidesFromEdition(displayEdition);
  }, [displayEdition, fallbackImage]);

  const previousSlides = useMemo<EditionImage[]>(() => {
    return getSlidesFromEdition(previousEdition);
  }, [previousEdition, fallbackImage]);

  useEffect(() => {
    if (!displayEdition) {
      setDisplayEdition(currentEdition);
    }
  }, [currentEdition, displayEdition]);

  useEffect(() => {
    if (!currentEdition) return;

    const currentId = String(currentEdition?.id_edicion ?? currentEdition?.nombre_edicion ?? "");
    const displayId = String(displayEdition?.id_edicion ?? displayEdition?.nombre_edicion ?? "");

    if (currentId === displayId) return;

    const nextSlides = getSlidesFromEdition(currentEdition);
    if (!nextSlides.length) {
      setDisplayEdition(currentEdition);
      setActiveIndex(0);
      if (mainSwiper) {
        mainSwiper.slideTo(0, 0);
      }
      return;
    }

    setIsSwitching(true);
    setPreviousEdition(displayEdition);

    const preloadAll = async () => {
      await Promise.all(
        nextSlides.map(
          (slide) =>
            new Promise<void>((resolve) => {
              const img = new Image();
              img.src = slide.url;
              img.onload = () => resolve();
              img.onerror = () => resolve();
              if (img.complete) resolve();
            })
        )
      );
    };

    preloadAll().then(() => {
      setShowTransitionLayer(true);

      if (switchTimeoutRef.current) {
        window.clearTimeout(switchTimeoutRef.current);
      }
      if (finalTimeoutRef.current) {
        window.clearTimeout(finalTimeoutRef.current);
      }

      switchTimeoutRef.current = window.setTimeout(() => {
        setDisplayEdition(currentEdition);
        setActiveIndex(0);

        if (mainSwiper) {
          mainSwiper.slideTo(0, 0);
          mainSwiper.update();
        }

        finalTimeoutRef.current = window.setTimeout(() => {
          setShowTransitionLayer(false);
          setIsSwitching(false);
          setPreviousEdition(null);
        }, 260);
      }, 180);
    });

    return () => {
      if (switchTimeoutRef.current) window.clearTimeout(switchTimeoutRef.current);
      if (finalTimeoutRef.current) window.clearTimeout(finalTimeoutRef.current);
    };
  }, [currentEdition, displayEdition, mainSwiper]);

  useEffect(() => {
    if (!mainSwiper) return;
    mainSwiper.update();
  }, [displaySlides, mainSwiper]);

  const previousHero = previousSlides[0]?.url || "";
  const currentHero = displaySlides[activeIndex]?.url || displaySlides[0]?.url || "";

  return (
    <div className="w-full lg:max-w-full mx-auto flex flex-col lg:flex-row gap-4 mt-0 px-0 bg-black">
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
                  className="w-full h-full object-cover block pointer-events-none"
                  loading="lazy"
                />
              </button>
            );
          })}
        </div>
      )}

      <div className="relative flex-1 group order-1 lg:order-2 bg-white rounded-[28px] overflow-hidden shadow-[0_12px_30px_rgba(0,0,0,0.18)] mt-2 lg:mt-0 min-h-[420px] sm:min-h-[520px] lg:min-h-[840px]">
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
                z-index: 25;
              }
              .swiper-pagination-bullet-active { background: #ef4444 !important; }
              .product-swiper { width: 100% !important; height: 100% !important; background: white !important; }
              @media (min-width: 1024px) { .product-swiper { height: 840px !important; } }
              .custom-scrollbar::-webkit-scrollbar { width: 3px; }
              .custom-scrollbar::-webkit-scrollbar-thumb { background: transparent; border-radius: 999px; }
            `,
          }}
        />

        {previousHero && (
          <div
            className={classNames(
              "absolute inset-0 z-10 transition-all duration-500",
              showTransitionLayer ? "opacity-100 blur-0 scale-100" : "opacity-0 blur-[4px] scale-[1.02]"
            )}
          >
            <img
              src={previousHero}
              alt="Imagen anterior"
              className="w-full h-full object-cover block"
            />
          </div>
        )}

        <div
          className={classNames(
            "absolute inset-0 z-20 transition-all duration-500",
            showTransitionLayer ? "opacity-0 blur-[6px] scale-[1.03]" : "opacity-100 blur-0 scale-100"
          )}
        >
          <Swiper
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
                  className="bg-black flex items-center justify-center"
                >
                  <img
                    src={item.url}
                    alt={displayEdition?.nombre_edicion || `Imagen ${index + 1}`}
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
        </div>

        {isSwitching && (
          <div className="absolute inset-0 z-30 pointer-events-none bg-black/8 backdrop-blur-[1.5px]" />
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/45 via-black/10 to-transparent z-30" />

        {displayEdition?.nombre_edicion && (
          <div className="absolute bottom-5 left-5 z-40 pointer-events-none">
            <span className="bg-black/82 text-white text-[9px] md:text-[10px] font-black px-4 py-2 uppercase tracking-[0.24em] rounded-full backdrop-blur-md border border-red-500/45 shadow-[0_0_14px_rgba(239,68,68,0.28)]">
              {displayEdition.nombre_edicion}
            </span>
          </div>
        )}

        <div className="absolute bottom-5 right-5 z-40 pointer-events-none">
          <span className="bg-black/88 text-white text-[9px] font-black px-4 py-2 uppercase tracking-[0.24em] rounded-full backdrop-blur-md border border-red-500/55 shadow-[0_0_16px_rgba(239,68,68,0.35)]">
            ⚡ {displaySlides.length} PERSPECTIVA{displaySlides.length === 1 ? "" : "S"}
          </span>
        </div>
      </div>
    </div>
  );
};