import React, { useMemo } from 'react';
import type { ClientConfig } from '@thebcms/client';
import type {
    ProductColorEntry,
    ProductImageGroup,
} from '../../../../bcms/types/ts';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, A11y } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface Props {
    gallery: ProductImageGroup[];
    activeColor: ProductColorEntry;
    bcms?: ClientConfig;
}

export const Gallery: React.FC<Props> = ({ gallery, activeColor }) => {
    const images = useMemo(() => {
        return gallery.filter((item) => {
            const itemColor = (item as any).version || (item as any).color;
            return itemColor?.meta.en?.slug === activeColor.meta.en?.slug;
        });
    }, [gallery, activeColor]);

    return (
        <div className="w-full lg:max-w-3xl mx-auto relative group mt-16 lg:mt-24 px-0"> 
            <style dangerouslySetInnerHTML={{ __html: `
                .swiper-button-next, .swiper-button-prev { 
                    color: #000 !important; 
                    background: rgba(255,255,255,0.7);
                    width: 35px !important;
                    height: 35px !important;
                    border-radius: 50%;
                    transform: scale(0.6);
                    z-index: 20;
                }
                .swiper-pagination-bullet-active { background: #000 !important; }
                .product-swiper { padding-bottom: 10px !important; }
            `}} />

            <Swiper
                modules={[Navigation, Pagination, A11y]}
                spaceBetween={0}
                slidesPerView={1}
                navigation
                pagination={{ clickable: true }}
                autoHeight={false}
                className="product-swiper rounded-3xl overflow-hidden shadow-sm"
            >
                {images.map((item, index) => {
                    const imageUrl = (item as any).cloudflare_url || item.image.url;
                    
                    return (
                        <SwiperSlide key={index} className="flex justify-center items-center">
                            {/* AJUSTE "FULL SCREEN" ESTÉTICO: 
                                - h-[600px] lg:h-[780px]: Subimos la altura para llenar la pantalla.
                                - max-h-[85vh]: Límite de seguridad para no perder el control.
                            */}
                            <div className="w-full h-[600px] lg:h-[780px] max-h-[85vh] flex items-center justify-center overflow-hidden bg-white">
                                <img
                                    src={imageUrl}
                                    alt={`Render ${index + 1}`}
                                    /* object-cover para efecto "card" total sin bordes blancos */
                                    className="w-full h-full object-cover block"
                                    loading="lazy"
                                />
                            </div>
                        </SwiperSlide>
                    );
                })}
            </Swiper>

            {images.length > 1 && (
                <div className="absolute top-6 right-6 z-10 pointer-events-none">
                    <span className="bg-black/80 text-white text-[9px] font-bold px-4 py-2 uppercase tracking-[3px] rounded-full backdrop-blur-sm">
                        {images.length} PERSPECTIVAS
                    </span>
                </div>
            )}
        </div>
    );
};