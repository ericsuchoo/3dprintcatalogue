import React from 'react';
import { BCMSImage } from '@thebcms/components-react';
// Cambiamos el tipo para que sea más genérico o apunte a la estructura de Género
import type { ClientConfig } from '@thebcms/client';
import { Btn, type BtnTheme } from '../Btn';

interface Props {
    data: {
        // Cambiamos el nombre de la variable de meta para claridad, aunque use la misma estructura
        meta: any; 
        productsCount: number;
    }[];
    ctaTheme: BtnTheme;
    bcms: ClientConfig;
}

export const HomeCategories: React.FC<Props> = ({ data, ctaTheme, bcms }) => {
    return (
        <section>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {data.map((item, index) => {
                    const gender = item; // Ahora representa un Género (ej. Robot, Demonio)
                    
                    return (
                        <div
                            key={index}
                            className="group relative aspect-square flex items-end p-8 overflow-hidden bg-black"
                        >
                            {/* Título y contador (Estado inicial) */}
                            <div className="relative z-20 transition-all duration-500 ease-out group-hover:translate-y-4 group-hover:opacity-0">
                                <h2 className="flex items-end flex-wrap gap-4 text-white leading-none drop-shadow-lg">
                                    <span className="text-[32px] md:text-[40px] font-bold uppercase italic tracking-tighter">
                                        {gender.meta.title}
                                    </span>
                                    <span className="text-[18px] md:text-[24px] font-light opacity-80">
                                        ({gender.productsCount} Model
                                        {gender.productsCount !== 1 ? 's' : ''})
                                    </span>
                                </h2>
                            </div>

                            {/* Overlay de acción (Estado Hover) */}
                            <a
                                href={`/shop${
                                    gender.productsCount > 0
                                        ? '?gender=' + gender.meta.slug
                                        : ''
                                }`}
                                className="absolute z-30 inset-0 bg-black/60 flex flex-col items-center justify-center text-center transition-all duration-500 ease-in-out opacity-0 group-hover:opacity-100 backdrop-blur-[3px]"
                            >
                                <div className="text-white text-[28px] font-black uppercase italic leading-none mb-6 md:text-[36px] translate-y-4 transition-transform duration-500 group-hover:translate-y-0 [text-shadow:_-2px_-2px_0_#000,_2px_-2px_0_#000,_-2px_2px_0_#000,_2px_2px_0_#000]">
                                    {gender.meta.title}
                                </div>
                                <div className="translate-y-8 transition-transform duration-500 group-hover:translate-y-0">
                                    <Btn theme={ctaTheme} label="Ver Modelos" />
                                </div>
                            </a>

                            {/* Imagen con efecto de Zoom */}
                            <div className="absolute top-0 left-0 size-full z-0">
                                {gender.meta.gallery && gender.meta.gallery[0] && (
                                    <BCMSImage
                                        media={gender.meta.gallery[0]}
                                        clientConfig={bcms}
                                        className="size-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                                    />
                                )}
                                {/* Overlay oscuro sutil constante */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:from-black/40 transition-colors duration-500" />
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};