import React from 'react';
import { BCMSImage } from '@thebcms/components-react';
import type { ClientConfig } from '@thebcms/client';
import { Btn, type BtnTheme } from '../Btn';

interface Props {
    data: { meta: any; productsCount: number; }[];
    ctaTheme: BtnTheme;
    bcms: ClientConfig;
}

export const HomeCategories: React.FC<Props> = ({ data, ctaTheme, bcms }) => {
    return (
        <section>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {data.map((item, index) => {
                    const isExternal = item.meta.gallery?.[0]?.src?.includes('http');
                    
                    return (
                        <div key={index} className="group relative aspect-square flex items-end p-8 overflow-hidden bg-black">
                            {/* Títulos */}
                            <div className="relative z-20 transition-all duration-500 ease-out group-hover:translate-y-4 group-hover:opacity-0">
                                <h2 className="flex items-end flex-wrap gap-4 text-white leading-none drop-shadow-lg">
                                    <span className="text-[32px] md:text-[40px] font-bold uppercase italic tracking-tighter">
                                        {item.meta.title}
                                    </span>
                                    <span className="text-[18px] md:text-[24px] font-light opacity-80">
                                        ({item.productsCount} Models)
                                    </span>
                                </h2>
                            </div>

                            {/* Hover Overlay */}
                            <a href={`/shop?gender=${item.meta.slug}`} className="absolute z-30 inset-0 bg-black/60 flex flex-col items-center justify-center text-center transition-all duration-500 opacity-0 group-hover:opacity-100 backdrop-blur-[3px]">
                                <div className="text-white text-[28px] font-black uppercase italic mb-6 md:text-[36px]">
                                    {item.meta.title}
                                </div>
                                <Btn theme={ctaTheme} label="Ver Modelos" />
                            </a>

                            {/* LÓGICA DE IMAGEN CORREGIDA */}
                            <div className="absolute top-0 left-0 size-full z-0">
                                {item.meta.gallery?.[0] && (
                                    isExternal ? (
                                        <img 
                                            src={item.meta.gallery[0].src} 
                                            alt={item.meta.title}
                                            className="size-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                        />
                                    ) : (
                                        <BCMSImage 
                                            media={item.meta.gallery[0]} 
                                            clientConfig={bcms}
                                            className="size-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                        />
                                    )
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};