import React, { useMemo, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperClass } from 'swiper';
import { Navigation, Pagination, A11y } from 'swiper/modules';
import classNames from 'classnames';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import type { ClientConfig } from '@thebcms/client';
import type {
    ProductColorEntry,
    ProductImageGroup,
} from '../../../../bcms/types/ts';

interface Props {
    gallery: ProductImageGroup[];
    activeColor: ProductColorEntry;
    bcms?: ClientConfig;
}

export const Gallery: React.FC<Props> = ({ gallery, activeColor, bcms }) => {
    const [mainSwiper, setMainSwiper] = useState<SwiperClass | null>(null);
    const [activeIndex, setActiveIndex] = useState(0);

    const images = useMemo(() => {
        return gallery.filter((item) => {
            const itemColor = (item as any).version || (item as any).color;
            return itemColor?.meta.en?.slug === activeColor.meta.en?.slug;
        });
    }, [gallery, activeColor]);

    return (
        /* He expandido el max-w para que ocupe más ancho en pantalla */
        <div className="w-full lg:max-w-full mx-auto flex flex-col lg:flex-row gap-4 mt-16 lg:mt-24 px-0 bg-black"> 
            
            {/* MINI VISTA (THUMBNAILS) */}
            {images.length > 1 && (
                <div className="order-2 lg:order-1 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto w-full lg:w-20 h-auto lg:max-h-[840px] pb-4 lg:pb-0 px-4 lg:px-0 custom-scrollbar flex-shrink-0 bg-black">
                    {images.map((item, index) => {
                        const imageUrl = (item as any).cloudflare_url || item.image.url;
                        return (
                            <button
                                key={index}
                                onClick={() => mainSwiper?.slideTo(index)}
                                className={classNames(
                                    "relative w-16 lg:w-full aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all duration-300 flex-shrink-0 bg-white",
                                    activeIndex === index 
                                        ? "border-black scale-105 shadow-md" 
                                        : "border-transparent opacity-40 hover:opacity-100"
                                )}
                            >
                                <img
                                    src={imageUrl}
                                    alt={`Render ${index}`}
                                    className="w-full h-full object-cover block pointer-events-none"
                                />
                            </button>
                        );
                    })}
                </div>
            )}

            {/* CARRUSEL PRINCIPAL */}
            <div className="relative flex-1 group order-1 lg:order-2 bg-white rounded-3xl overflow-hidden shadow-sm" style={{ background: 'rgba(0, 0, 0, 0)' }}>
                <style dangerouslySetInnerHTML={{ __html: `
                    .swiper-button-next, .swiper-button-prev { 
                        color: #000 !important; 
                        background: rgba(255,255,255,0.7);
                        width: 35px !important;
                        height: 35px !important;
                        border-radius: 90%;
                        transform: scale(0.6);
                        z-index: 20;
                    }
                    .swiper-pagination-bullet-active { background: #000 !important; }
                    .product-swiper { 
                        width: 100% !important; 
                        height: 100% !important; 
                        background: white !important;
                    }
                    @media (min-width: 1024px) { 
                        .product-swiper { height: 840px !important; } 
                    }
                    .custom-scrollbar::-webkit-scrollbar { width: 3px; }
                    .custom-scrollbar::-webkit-scrollbar-thumb { background: transparent; border-radius: 90rem; }
                `}} />

                <Swiper
                    modules={[Navigation, Pagination, A11y]}
                    onSwiper={setMainSwiper}
                    onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
                    spaceBetween={0}
                    slidesPerView={1}
                    navigation
                    pagination={{ clickable: true }}
                    className="product-swiper"
                >
                    {images.map((item, index) => {
                        const imageUrl = (item as any).cloudflare_url || item.image.url;
                        return (
                            <SwiperSlide key={index} className="bg-black flex items-center justify-center">
                                <img
                                    src={imageUrl}
                                    alt={`Render Full ${index + 1}`}
                                    className="w-full h-full object-cover block"
                                    loading={index === 0 ? "eager" : "lazy"}
                                />
                            </SwiperSlide>
                        );
                    })}
                </Swiper>

                <div className="absolute top-6 right-6 z-10 pointer-events-none">
                    <span className="bg-black/80 text-white text-[9px] font-bold px-4 py-2 uppercase tracking-[3px] rounded-full backdrop-blur-sm">
                        {images.length} PERSPECTIVAS
                    </span>
                </div>
            </div>
        </div>
    );
};