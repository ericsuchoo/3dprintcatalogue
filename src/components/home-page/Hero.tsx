import React from 'react';
import Logo from '../../assets/icons/logo-white.svg?raw';
import { BCMSImage } from '@thebcms/components-react';
import type { PropMediaDataParsed } from '@thebcms/types';
import type { ClientConfig } from '@thebcms/client';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Pagination } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';

interface Props {
    title: string;
    description: string;
    gallery: PropMediaDataParsed[]; 
    bcms: ClientConfig;
}

export const HomeHero: React.FC<Props> = ({
    title,
    description,
    gallery,
    bcms,
}) => {
    const slides = gallery && gallery.length > 0 ? gallery : [];

    return (
        <section className="relative overflow-hidden h-screen flex items-center bg-black">
            <div className="container relative z-20 pointer-events-none">
                <div className="flex flex-col items-center justify-center h-full text-center">
                    <h1 className="sr-only">{title}</h1>
                    <div
                        dangerouslySetInnerHTML={{ __html: Logo }}
                        className="w-[250px] text-white mb-8 md:w-[378px] drop-shadow-2xl"
                    />
                    <p className="text-xl leading-none text-white drop-shadow-md">
                        {description}
                    </p>
                </div>
            </div>

            <div className="absolute top-0 left-0 size-full z-0">
                <Swiper
                    modules={[Autoplay, EffectFade, Pagination]}
                    effect="fade"
                    autoplay={{ delay: 4000, disableOnInteraction: false }}
                    pagination={{ clickable: true }}
                    loop={slides.length > 1}
                    className="size-full custom-swiper"
                >
                    {slides.map((img, index) => (
                        <SwiperSlide key={index} className="size-full">
                            <div className="relative size-full overflow-hidden">
                                <div className="absolute inset-0 bg-black/30 z-10" />
                                <BCMSImage
                                    media={img}
                                    clientConfig={bcms}
                                    /* Cambiamos a object-center y scale-102 (solo 2% de zoom) */
                                    className="size-full object-cover  scale-[1.02] transition-transform duration-300"
                                />
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </section>
    );
};