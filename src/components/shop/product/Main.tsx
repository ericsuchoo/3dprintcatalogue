import React, { useState } from 'react';
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
    // Seguro para inicializar el estado sin errores
    const [activeColor, setActiveColor] = useState<ProductColorEntry>(() => {
        const firstItem = meta.gallery[0] as any;
        return firstItem?.version || firstItem?.color;
    });

    return (
        <div>
            {activeColor && (
                <div className="bg-black grid grid-cols-1 gap-8 mb-14 lg:grid-cols-2">
                    <Gallery
                        gallery={meta.gallery}
                        activeColor={activeColor}
                        bcms={bcms} 
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
                    <div className="text-white flex flex-col items-center gap-5 justify-between text-xl mb-8 lg:flex-row bg-red-500">
                        <div className="font-bold">Otras Opciones Gloriosas</div>
                        <a href="/shop" className="underline text-sm">ver </a>
                    </div>
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ">
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