import React, { useState } from 'react';
import LoadingIcon from '../assets/icons/loader.svg?raw';
import classNames from 'classnames';
import type { ProductLite } from '../utils/product';
import type { ClientConfig } from '@thebcms/client';
import { useCart } from '../context/CartContext';
import type { ProductSizeEntryMetaItem } from '../../bcms/types/ts';

interface ProductCardProps {
    card: ProductLite;
    bcms: ClientConfig;
    style?: React.CSSProperties;
    className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
    card,
    style,
    className,
}) => {
    const { addCartItem } = useCart();
    const [isLoading, setIsloading] = useState(false);
    const [emptySizeError, setEmptySizeError] = useState<string | null>(null);
    const [selectedSize, setSelectedSize] = useState<ProductSizeEntryMetaItem | null>(null);

    // Priorizamos la URL de Cloudflare
    const displayImage = card.cloudflare_cover || card.cover?.url;
    const materialName = card.categories?.[0]?.meta.en?.title;

    const addToCart = () => {
        if (selectedSize) {
            setIsloading(true);
            setEmptySizeError(null);
            setTimeout(() => {
                addCartItem({
                    slug: card.slug,
                    title: card.title,
                    amount: 0,
                    size: selectedSize as ProductSizeEntryMetaItem,
                    cover: card.cover,
                    price: card.discounted_price || card.price,
                    color: card.version, // Enviamos la versión seleccionada
                });
                setIsloading(false);
            }, 750);
        } else {
            setEmptySizeError('Por favor selecciona una talla');
        }
    };

    return (
        <div className={classNames('flex flex-col relative', className)} style={style}>
            <a href={`/shop/${card.slug}`} className="group flex flex-col relative">
                
                {/* Badge de Material */}
                {materialName && (
                    <div className="absolute top-3 left-3 z-10">
                        <span className={classNames(
                            "text-[10px] uppercase tracking-tighter px-2.5 py-1 font-extrabold shadow-sm text-white",
                            materialName.toLowerCase().includes('resina') ? "bg-indigo-900" : "bg-black"
                        )}>
                            {materialName}
                        </span>
                    </div>
                )}

                <div className="flex overflow-hidden mb-6 bg-gray-100">
                    <div className="size-full">
                        <img
                            src={displayImage}
                            alt={card.title}
                            className="w-full h-[320px] object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                        />
                    </div>
                </div>
                
                <div className="mb-6">
                    <h3 className="text-2xl leading-none tracking-[-0.5px] mb-3">
                        {card.title}
                    </h3>
                    {/* Versión del producto */}
                    <p className="text-[10px] text-gray-500 mb-2 uppercase tracking-widest font-bold italic">
                        {card.version?.title}
                    </p>
                    <div className="flex items-center gap-1">
                        <span className="text-2xl font-bold">
                            ${(card.discounted_price || card.price).toFixed(2)}
                        </span>
                    </div>
                </div>
            </a>

            <div>
                {/* Mensaje de error si no hay talla seleccionada */}
                {emptySizeError && (
                    <div className="text-appError text-xs font-bold mb-2">
                        {emptySizeError}
                    </div>
                )}
                
                <div className="flex flex-wrap gap-3 mb-6">
                    {card.sizes.map((size, index) => (
                        <button
                            key={index}
                            disabled={!size.available}
                            className={classNames(
                                'w-8 h-8 flex items-center justify-center border text-xs transition-all',
                                {
                                    'bg-black text-white border-black':
                                        selectedSize?.title === size.size.meta.en?.title,
                                    'border-gray-200 hover:border-black':
                                        size.available && selectedSize?.title !== size.size.meta.en?.title,
                                    'opacity-30 cursor-not-allowed': !size.available
                                }
                            )}
                            onClick={() => {
                                setSelectedSize(size.size.meta.en as ProductSizeEntryMetaItem);
                                setEmptySizeError(null);
                            }}
                        >
                            {size.size.meta.en?.title}
                        </button>
                    ))}
                </div>
            </div>

            <button
                className="flex justify-center items-center w-full bg-appText text-white py-4 hover:bg-opacity-90 transition-all disabled:bg-gray-400"
                disabled={isLoading}
                onClick={addToCart}
            >
                <span>{isLoading ? 'Añadiendo...' : 'Añadir al carrito'}</span>
                {isLoading && (
                    <div
                        dangerouslySetInnerHTML={{ __html: LoadingIcon }}
                        className="w-3.5 h-3.5 ml-3 animate-spin"
                    />
                )}
            </button>
        </div>
    );
};