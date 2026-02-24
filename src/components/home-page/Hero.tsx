import React from 'react';
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
    logo_dc3?: PropMediaDataParsed; 
}

export const HomeHero: React.FC<Props> = ({ title, description, gallery, bcms, logo_dc3 }) => {
    const slides = gallery && gallery.length > 0 ? gallery : [];

    return (
        <section className="relative w-full bg-black h-[60vh] md:h-screen flex flex-col overflow-hidden">
            <style dangerouslySetInnerHTML={{ __html: `
                /* ANIMACIONES ELEGANTES */
                @keyframes revealUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .animate-reveal {
                    opacity: 0;
                    animation: revealUp 0.8s cubic-bezier( 1, 0.9, 0.4, 0.1) forwards;
                }

                .delay-1 { animation-delay: 0.2s; }
                .delay-2 { animation-delay: 0.4s; }
                .delay-3 { animation-delay: 0.9s; }

                .hero-ui-container {
                    position: absolute;
                    inset: 0;
                    z-index: 50;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding-top: 12vh !important; 
                    pointer-events: none;
                }

                .logo-scaling-force {
                    width: 60vw !important; 
                    max-width: 350px !important;
                    pointer-events: auto !important;
                    position: relative;
                    margin-bottom: 4.5rem !important; 
                }

                .miau-responsive { font-size: 13vw !important; top: -14vw !important; }
                .welcome-single-line { font-size: 5.5vw !important; bottom: -11vw !important; white-space: nowrap !important; text-align: center; }

                .description-wrapper {
                    margin-top: 10.5rem !important; 
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    max-width: 95vw;
                    pointer-events: auto !important;
                    text-align: center;
                    color: rgb(229, 229, 255) !important;
                    text-transform: uppercase;
                    background: rgba(0, 0, 0, 0);
                    backdrop-filter: blur(5px);
                    -webkit-backdrop-filter: blur(5px);
                    border: 1px solid rgba(255, 255, 255, 0);
                    border-radius: 20px;
                    padding: 2rem 1rem !important;
                }

                .desc-part-1 {
                    font-family: 'Orbitron Font', sans-serif !important;
                    font-weight: normal !important;
                    font-size: 34px !important;
                    letter-spacing: 0.4em !important;
                    margin-bottom: 3rem !important;
                     margin-top: 4rem !important;
                    text-shadow: 0px 28px 35px rgba(247, 203, 5, 0.93) !important;
                }

                .desc-part-2 {
                    font-family: 'Helvetica Neue', sans-serif !important;
                    font-weight: 100 !important;
                    font-size: 36px !important;
                    line-height: 1.1 !important;
                    letter-spacing: 0.05em !important;
                     margin-top: 4rem !important;
                    margin-bottom: 1.5rem !important;
                    text-shadow: 0px 28px 30px rgba(255, 102, 0, 0.95) !important;
                }

                .desc-part-3 {
                    font-family: 'Orbitron Font'!important;
                    font-weight: 100!important;
                    font-size: 75px !important;
                   
                    letter-spacing: 0.2em !important;
                    margin-bottom: 1rem !important;
                    margin-top: 6rem !important;
                    text-shadow: 0px 28px 30px rgba(247, 5, 5, 0.95) !important;
                }

                @media (min-width: 1024px) {
                    .hero-ui-container { justify-content: center !important; padding-top: 3 !important; }
                    .logo-scaling-force { width: 240px !important; margin-bottom: 4rem !important; }
                    .miau-responsive { font-size: 4.5rem !important; top: -5.5rem !important; }
                    .welcome-single-line { font-size: 2.4rem !important; bottom: -3.5rem !important; width: auto !important; }
                    
                    .description-wrapper { 
                        flex-direction: column !important;
                        gap: 1.9rem;
                        margin-top: 2rem !important; 
                        max-width: 1200px !important;
                        padding: 1rem 2rem !important;
                        border-radius: 100px;
                    }

                    .desc-part-1 {    margin-top: 10px !important; font-family: 'Orbitron Font', sans-serif !important; font-size: 16px !important; margin-bottom: 0 !important ; }
                    .desc-part-2 {    margin-top: 1rem !important; font-size: 19px !important; margin-bottom: 0 !important;  text-shadow:2px 5px 3px rgba(5, 110, 247, 0.98) !important; }
                    .desc-part-3 { 
                        font-family: 'Orbitron Font'!important;
                        font-weight: 300!important;
                        margin-top: 1rem !important; 
                        font-size: 54px !important; 
                        margin-bottom: 0 !important; 
                        text-shadow:2px 5px 3px rgb(247, 5, 5) !important;
                    }
                }

                .swiper-responsive-height { height: 100vh !important; width: 100%; }
                @media (min-width: 1024px) { .swiper-responsive-height { height: 100% !important; } }
                .custom-swiper .swiper-pagination-bullet {background: #00000000  !important; opacity: 0.1; }
                .custom-swiper .swiper-pagination-bullet-active { background: #0000000e !important; opacity: 0.1; }
            `}} />

            <div className="hero-ui-container">
                <div className="flex flex-col items-center text-center w-full px-4">
                    {logo_dc3 && (
                        /* El logo entra primero */
                        <div className="logo-scaling-force group p-2.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 drop-shadow-2xl transition-all duration-500 hover:scale-105 animate-reveal">
                            <span className="absolute left-1/2 -translate-x-1/2 text-white font-black italic tracking-tighter opacity-0 scale-50 transition-all duration-300 group-hover:opacity-100 group-hover:scale-100 group-hover:-rotate-12 drop-shadow-[0_10px_10px_rgba(0,0,0,0.9)] [text-shadow:7px_9px_0px_#0066FF] z-30 miau-responsive">
                                MIAUUUU!
                            </span>
                            <BCMSImage media={logo_dc3} clientConfig={bcms} className="w-full h-auto" />
                            <span className="absolute left-1/2 -translate-x-1/2 text-white font-black uppercase opacity-0 transition-all duration-500 delay-200 group-hover:opacity-100 drop-shadow-[0_4px_4px_rgba(0,0,0,1)] [text-shadow:7px_9px_0px_#0066FF] z-30 welcome-single-line">
                                PRRR... BIENVENIDO
                            </span>
                        </div>
                    )}
                    
                    <div className="description-wrapper">
                        {/* Cada parte tiene su propio retraso para el efecto cascada */}
                        <span className="desc-part-1 animate-reveal delay-1">En DC IMPRESS3D</span>
                        <span className="desc-part-2 animate-reveal delay-2">Creamos cada FIGURA para que sea</span>
                        <span className="desc-part-3 animate-reveal delay-3">UNICA y PROFESIONAL</span>
                    </div>
                </div>
            </div>

            <Swiper
                modules={[Autoplay, EffectFade, Pagination]}
                effect="fade"
                autoplay={{ delay: 5000, disableOnInteraction: false }}
                pagination={{ clickable: true }}
                loop={slides.length > 1}
                className="swiper-responsive-height z-0 custom-swiper"
            >
                {slides.map((img, index) => (
                    <SwiperSlide key={index} className="size-full">
                        <div className="relative size-full">
                            <div className="absolute inset-0 bg-black/40 z-10 pointer-events-none" />
                            <BCMSImage
                                media={img}
                                clientConfig={bcms}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </section>
    );
};