import React from 'react';
import type { ClientConfig } from '@thebcms/client';
import type {
    ProductColorEntry,
    ProductImageGroup,
} from '../../../../bcms/types/ts';

interface Props {
    gallery: ProductImageGroup[];
    activeColor: ProductColorEntry;
    bcms?: ClientConfig; // Añadimos ? para que sea opcional y no de error
}

export const Gallery: React.FC<Props> = ({ gallery, activeColor }) => {
    // CORRECCIÓN: Filtramos usando .version o .color para que no explote
    const images = gallery.filter((item) => {
        const itemColor = (item as any).version || (item as any).color;
        return itemColor?.meta.en?.slug === activeColor.meta.en?.slug;
    });

    return (
        <div className="flex flex-col gap-4 ">
            {images.map((item, index) => {
                // Priorizamos la URL de Cloudflare si existe
                const imageUrl = (item as any).cloudflare_url || item.image.url;
                
                return (
                    <img
                        key={index}
                        src={imageUrl}
                        alt="Product Gallery"
                        className="w-full h-auto object-cover border border-appGray-200"
                    />
                );
            })}
        </div>
    );
};