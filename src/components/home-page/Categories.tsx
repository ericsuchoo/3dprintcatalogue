import React from 'react';
import { BCMSImage } from '@thebcms/components-react';
import type { ProductCategoryEntryMetaItem } from '../../../bcms/types/ts';
import { Btn, type BtnTheme } from '../Btn';
import type { ClientConfig } from '@thebcms/client';

interface Props {
    data: {
        meta: ProductCategoryEntryMetaItem;
        productsCount: number;
    }[];
    ctaTheme: BtnTheme;
    bcms: ClientConfig;
}

export const HomeCategories: React.FC<Props> = ({ data, ctaTheme, bcms }) => {
    return (
        <section>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {data.map((category, index) => {
                    return (
                        <div
                            key={index}
                            className="group relative aspect-square flex items-end p-8 overflow-hidden bg-black"
                        >
                            {/* Título y contador (Estado inicial) */}
                            <div className="relative z-20 transition-all duration-500 ease-out group-hover:translate-y-4 group-hover:opacity-0">
                                <h2 className="flex items-end flex-wrap gap-4 text-white leading-none drop-shadow-lg">
                                    <span className="text-[32px] md:text-[40px] font-bold">
                                        {category.meta.title}
                                    </span>
                                    <span className="text-[18px] md:text-[24px] opacity-80">
                                        ({category.productsCount} Product
                                        {category.productsCount !== 1 ? 's' : ''})
                                    </span>
                                </h2>
                            </div>

                            {/* Overlay de acción (Estado Hover) */}
                            <a
                                href={`/shop${
                                    category.productsCount > 0
                                        ? '?category=' + category.meta.slug
                                        : ''
                                }`}
                                className="absolute z-30 inset-0 bg-black/50 flex flex-col items-center justify-center text-center transition-all duration-500 ease-in-out opacity-0 group-hover:opacity-100 backdrop-blur-[2px]"
                            >
                                <div className="text-white text-[28px] font-bold leading-none mb-6 md:text-[32px] translate-y-4 transition-transform duration-500 group-hover:translate-y-0">
                                    {category.meta.title}
                                </div>
                                <div className="translate-y-8 transition-transform duration-500 group-hover:translate-y-0">
                                    <Btn theme={ctaTheme} label="Shop now" />
                                </div>
                            </a>

                            {/* Imagen con efecto de Zoom */}
                            <div className="absolute top-0 left-0 size-full z-0">
                                <BCMSImage
                                    media={category.meta.gallery[0]}
                                    clientConfig={bcms}
                                    className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                                />
                                {/* Overlay oscuro sutil constante para legibilidad del texto blanco */}
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};