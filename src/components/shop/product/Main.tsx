import React, { useState, useMemo } from 'react';
import type {
    ProductColorEntry,
    ProductEntryMetaItem,
} from '../../../../bcms/types/ts';
import type { ProductLite } from '../../../utils/product';
import type { ClientConfig } from '@thebcms/client';
import { ProductCard } from '../../ProductCard';
import { Gallery } from './Gallery';
import { Details } from './Details';

interface Props {
    meta: ProductEntryMetaItem;
    otherProducts: ProductLite[];
    bcms: ClientConfig;
}

export const Main: React.FC<Props> = ({ meta, otherProducts, bcms }) => {

    const [activeColor, setActiveColor] = useState<ProductColorEntry>(() => {
        const firstItem = meta.gallery[0] as any;
        return firstItem?.version || firstItem?.color;
    });

    // 🔥 ADAPTADOR (ESTO ES LO ÚNICO NUEVO)
    const galleryAdapted = useMemo(() => {
        return meta.gallery.map((item: any) => ({
            id_edicion: item._id || item.id,
            nombre_edicion: item.title || item.name || "Default",
            images: (item.images || []).map((img: any) => ({
                url: img.url,
                nivel: img.nivel_contenido || "safe",
            })),
        }));
    }, [meta.gallery]);

    return (
        <div>
            {activeColor && (
                <div className="grid grid-cols-1 gap-8 mb-14 lg:grid-cols-2">
                    
                    {/* 🔥 SOLO CAMBIA ESTO */}
                    <Gallery
                        gallery={galleryAdapted}
                        activeEdition={galleryAdapted[0]}
                        fallbackImage={null}
                    />

                    <Details
                        meta={meta}
                        activeColor={activeColor}
                        colorChange={(c) => setActiveColor(c)}
                    />
                </div>
            )}
            
            {otherProducts.length > 0 && (
                <div className="mt-20">
                    <div className="flex flex-col bg-red-50items-center gap-5 justify-between text-xl mb-8 lg:flex-row">
                        <div className="font-bold">Others you may like</div>
                        <a href="/shop" className="underline text-sm">See all</a>
                    </div>
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {otherProducts.map((product, index) => (
                            <ProductCard
                                key={index}
                                card={product}
                                bcms={bcms}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};