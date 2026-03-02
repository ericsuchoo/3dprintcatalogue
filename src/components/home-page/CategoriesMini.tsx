import React from 'react';
import { BCMSImage } from '@thebcms/components-react';
import type { ClientConfig } from '@thebcms/client';
import { Btn, type BtnTheme } from '../Btn';

interface Props {
    data: {
        meta: any; 
        productsCount: number;
    }[];
    ctaTheme: BtnTheme;
    bcms: ClientConfig;
}

export const CategoriesMini: React.FC<Props> = ({ data, ctaTheme, bcms }) => {
    return (
        <section className="px-4">
            {/* Ajuste de Grid: Más columnas para cards más pequeñas */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {data.map((item, index) => (
                    <div
                        key={index}
                        className="group relative aspect-[4/5] flex items-end p-4 overflow-hidden bg-zinc-900 rounded-lg"
                    >
                        {/* Títulos reducidos para encajar en espacio pequeño */}
                        <div className="relative z-20 transition-all duration-500 group-hover:opacity-0">
                            <h2 className="text-white leading-tight">
                                <div className="text-[14px] md:text-[16px] font-black uppercase italic tracking-tighter">
                                    {item.meta.title}
                                </div>
                                <div className="text-[10px] uppercase opacity-60 font-bold">
                                    {item.productsCount} Model{item.productsCount !== 1 ? 's' : ''}
                                </div>
                            </h2>
                        </div>

                        {/* Overlay simplificado */}
                        <a
                            href={`/shop${item.productsCount > 0 ? '?gender=' + item.meta.slug : ''}`}
                            className="absolute z-30 inset-0 bg-red-600/90 flex flex-col items-center justify-center text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        >
                            <span className="text-white text-[12px] font-black uppercase italic mb-2">
                                Ver {item.meta.title}
                            </span>
                            {/* Versión pequeña del botón */}
                            <div className="scale-75">
                                <Btn theme={ctaTheme} label="Explorar" />
                            </div>
                        </a>

                        {/* Imagen */}
                        <div className="absolute top-0 left-0 size-full z-0">
                            {item.meta.gallery?.[0] && (
                                <BCMSImage
                                    media={item.meta.gallery[0]}
                                    clientConfig={bcms}
                                    className="size-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};