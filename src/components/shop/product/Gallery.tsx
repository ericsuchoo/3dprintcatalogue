import React, { useMemo, useState } from 'react';
import classNames from 'classnames';
// Ya no necesitamos BCMSImage para las fotos de Cloudflare
import type {
    ProductColorEntry,
} from '../../../../bcms/types/ts';

interface Props {
    // Cambiamos el tipo a 'any' temporalmente para que no te dé error de Typescript 
    // hasta que se regeneren los tipos con el nuevo campo cloudflare_url
    gallery: any[]; 
    activeColor: ProductColorEntry;
}

export const Gallery: React.FC<Props> = ({ gallery, activeColor }) => {
    const [activeImage, setActiveImage] = useState(0);

    const galleryByColor = useMemo(() => {
        setActiveImage(0);
        return gallery.filter(
            (e) => e.color.meta.en?.slug === activeColor.meta.en?.slug,
        );
    }, [gallery, activeColor]);

    return (
        <div className="flex flex-col">
            {galleryByColor[activeImage] && (
                <img
                    src={galleryByColor[activeImage].cloudflare_url} // <--- Usamos tu nuevo campo
                    alt="Product render"
                    className="flex aspect-square w-full object-cover mb-6 flex-1"
                />
            )}
            <div className="flex gap-4 overflow-x-auto">
                {galleryByColor.map((item, index) => (
                    <button
                        key={index}
                        className={classNames(
                            'group flex flex-shrink-0 w-[124px] aspect-square border p-2 transition-colors duration-300',
                            index === activeImage
                                ? 'border-appText'
                                : 'border-appGray-300',
                        )}
                        onClick={() => setActiveImage(index)}
                    >
                        <div className="overflow-hidden w-full h-full">
                            <img
                                src={item.cloudflare_url} // <--- Usamos tu nuevo campo
                                alt={`Thumbnail ${index}`}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};