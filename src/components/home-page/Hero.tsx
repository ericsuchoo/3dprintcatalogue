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
                /* FUENTES LOCALES */
                @font-face {
                    font-family: 'Orbitron Font';
                    src: url('/fonts/Orbitron[wght].woff') format('woff');
                    font-weight: normal; font-style: normal; font-display: swap;
                }
                @font-face {
                    font-family: 'Voga-Medium';
                    src: url('/fonts/Voga-Medium.woff') format('woff');
                    font-weight: 500; font-style: normal; font-display: swap;
                }

                /* ANIMACIONES */
                @keyframes revealUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @keyframes zoomOutLanding {
                    from { opacity: 0; transform: scale(1.5); filter: blur(10px); }
                    to { opacity: 1; transform: scale(1); filter: blur(0); }
                }

                /* EFECTO ESCANEO LÁSER */
                @keyframes laserScan {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }

                .animate-reveal {
                    opacity: 0;
                    animation: revealUp 0.8s cubic-bezier(1, 0.9, 0.4, 0.1) forwards;
                }

                /* ESTILO ESPECIAL PARA IMPRESS3D */
                .impress3d-laser {
                 font-weight: 800 !important;
                    display: inline-block;
                    opacity: 0;
                    /* Combina Zoom inicial y Escaneo infinito */
                    animation: zoomOutLanding 1s cubic-bezier(0.16, 1, 0.3, 1) forwards,
                               laserScan 4s linear infinite 1.2s;
                    
                    /* Gradiente para el brillo láser */
                    background: linear-gradient(
                        90deg, 
                        #1e357c 0%, 
                        #a3baec 45%, 
                        #96bbe6 50%, 
                        #aaa5a5 55%, 
                        #e6dede 100%
                    );
                    background-size: 200% auto;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    position: relative;
                }

                .delay-1 { animation-delay: 0.2s; }
                .delay-2 { animation-delay: 0.4s; }
                .delay-3 { animation-delay: 0.9s; }

                /* CONTENEDOR PRINCIPAL */
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
                    margin-bottom: 0.5rem !important;
                    margin-top: 0.5rem !important; 
                    background: rgba(75, 72, 72, 0);
                    backdrop-filter: blur(5px);
                     border: 1px solid rgba(255, 255, 255, 0);
                }
                .miau-responsive { font-size: 13vw !important; top: -14vw !important;  margin-top: 1.5rem !important; }
                .welcome-single-line { font-size: 5.5vw !important; bottom: -11vw !important; white-space: nowrap !important; text-align: center; }

                /* PANEL GLASS */
                .description-wrapper {
                    margin-top: 10.5rem !important; 
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    width: 95vw;
                    pointer-events: auto !important;
                    text-align: center;
                    background: rgba(75, 72, 72, 0);
                    backdrop-filter: blur(5px);
                    -webkit-backdrop-filter: blur(5px);
                    border: 1px solid rgba(255, 255, 255, 0);
                    border-radius: 20px;
                    padding: 2rem 1rem !important;
                    text-transform: uppercase;
                }

                .desc-part-1 {
                    font-family: 'Orbitron Font' !important;
                    font-size: 40px !important;
                   
                    letter-spacing: 0.4em !important;
                    margin-bottom: 1rem !important;
                    margin-top: 1rem !important;
                    color: rgb(224, 223, 221) !important;
                    text-shadow: 2px 5px 3px rgba(42, 62, 100, 0.81) !important;
                }

                .desc-part-2 {
                    font-family: 'Helvetica Neue', sans-serif !important;
                    font-weight: 100 !important;
                    font-size: 36px !important;
                    line-height: 1.1 !important;
                    letter-spacing: 0.10em !important;
                    margin-top: 4rem !important;
                    margin-bottom: 1.5rem !important;
                    color: rgb(245, 221, 181) !important;
                    text-shadow: 0px 0px 25px rgba(245, 75, 32, 0.69), 2px 5px 3px #ff5100c4 !important;
                }

                .desc-part-3-row {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1.5rem;
                    margin-top: 3rem !important;
                    margin-bottom: 1rem !important;
                }

                .word-unica {
                    font-family: 'Orbitron Font' !important;
                    font-weight: 100 !important;
                    font-size: 90px !important;
                    color: #f0efef !important;
                    letter-spacing: 0.5em !important;
                    text-shadow: 0px 0px 25px rgba(253, 0, 0, 0.6), 2px 5px 3px #000000c4 !important;
                }

                .word-separator {
                    font-family: 'Helvetica Neue', sans-serif !important;
                    font-weight: 100 !important;
                    font-size: 90px !important;
                    color: #7bb470  !important;
                    text-transform: lowercase !important;
                    letter-spacing: 0.5em !important;
                    text-shadow: 2px 5px 3px #0400ff5e , 2px 5px 3px #000000c4 !important;
                }

                .word-profesional {

                    font-family: 'Voga-Medium' !important;
                    font-weight: 10 !important;
                    font-size: 100px !important;
                    color: #f0efef !important;
                    letter-spacing: 0.4em !important;
                    margin-top: -1.5rem !important;
                    text-shadow: 0px 0px 25px rgba(0, 160, 253, 0.6), 2px 5px 3px #000000c4 !important;
                    margin-rigth: 14rem !important;
                }

                /* VISTA PC - BANNER COMPLETO */
                @media (min-width: 1024px) {
                    .hero-ui-container { justify-content: center !important; padding-top: 3 !important; }
                    .logo-scaling-force { width: 240px !important; margin-bottom: 4rem !important; }
                    .miau-responsive { font-size: 4.5rem !important; top: -5.5rem !important; }
                    .welcome-single-line { font-size: 2.4rem !important; bottom: -3.5rem !important; width: auto !important; }
                    
                    .description-wrapper { 
                        flex-direction: column !important;
                        gap: 1rem; margin-top: 2rem !important; 
                        width: 100% !important; max-width: 100% !important;
                        padding: 3rem 0 !important; border-radius: 0 !important;
                        border-left: none !important; border-right: none !important;
                    }

                    .desc-part-1 { margin-top: 0 !important; letter-spacing: 0.8em !important; font-size: 29px !important; margin-bottom: 2rem !important; }
                    .desc-part-2 { margin-top: 1rem !important; letter-spacing: 1.5rem !important; font-size: 22px !important; margin-bottom: 0 !important; }
                    
                    .desc-part-3-row { 
                        flex-direction: row !important; align-items: baseline; gap: 3.8rem;
                        margin-top: 2rem !important; margin-bottom: 0 !important; 
                    }
                    .word-unica { color: #f0efef !important; font-size:64px !important; }
                    .word-separator { margin-left: -4rem !important;  font-size: 44px !important; }
                    .word-profesional { color: #f0efef !important; margin-left: -3.5rem !important; font-family: 'Voga-Medium' !important; font-size: 74px !important;  font-weight: 10 !important;}
                }

                .swiper-responsive-height { height: 100vh !important; width: 100%; }
                @media (min-width: 1024px) { .swiper-responsive-height { height: 100% !important; } }
                .custom-swiper .swiper-pagination-bullet { background: transparent !important; opacity: 0; }
            `}} />

            <div className="hero-ui-container">
                <div className="flex flex-col items-center text-center w-full px-2">
                    {logo_dc3 && (
                        <div className="logo-scaling-force group p-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 drop-shadow-2xl transition-all duration-500 hover:scale-105 animate-reveal">
                            <span className="absolute left-1/2 -translate-x-1/2 text-white font-black italic tracking-tighter opacity-0 scale-50 transition-all duration-300 group-hover:opacity-100 group-hover:scale-100 group-hover:-rotate-12 drop-shadow-[0_10px_10px_rgba(0,0,0,0.9)] [text-shadow:7px_9px_0px_#0066FF] z-30 miau-responsive">
                                MIAUUUU!
                            </span>
                            <BCMSImage media={logo_dc3} clientConfig={bcms} className="w-full h-auto" />
                            <span className="absolute left-1/2 -translate-x-1/2 text-white font-black uppercase opacity-0 transition-all duration-500 delay-200 group-hover:opacity-100 drop-shadow-[0_4px_4px_rgba(0,0,0,1)] [text-shadow:4px_3px_0px_#0066FF] z-30 welcome-single-line">
                                PRRR... BIENVENIDO
                            </span>
                        </div>
                    )}
                    
                    <div className="description-wrapper">
                        <span className="desc-part-1 animate-reveal delay-1">
                             En<span className="impress3d-laser"> Dino Cat 3D</span>
                        </span>
                        <span className="desc-part-2 animate-reveal delay-2">Creamos cada FIGURA para que sea</span>
                        
                        <div className="desc-part-3-row animate-reveal delay-3">
                            <span className="word-unica"> UNICA</span>
                            <span className="word-separator">+</span>
                            <span className="word-profesional">PROFESIONAL</span>
                        </div>
                    </div>
                </div>
            </div>

            <Swiper
                modules={[Autoplay, EffectFade, Pagination]}
                effect="fade"
                autoplay={{ delay: 5000, disableOnInteraction: false }}
                loop={slides.length > 1}
                className="swiper-responsive-height z-0 custom-swiper"
            >
                {slides.map((img, index) => (
                    <SwiperSlide key={index} className="size-full">
                        <div className="relative size-full">
                            <div className="absolute inset-0 bg-black/40 z-10 pointer-events-none" />
                            <BCMSImage media={img} clientConfig={bcms} className="w-full h-full object-cover" />
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </section>
    );
};