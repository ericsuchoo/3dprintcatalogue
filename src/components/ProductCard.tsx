import React from 'react';
import classNames from 'classnames';
import { BCMSImage } from '@thebcms/components-react';
import { useFavorites } from '../context/FavoritesContext';
import type { ProductLite } from '../utils/product';

export interface ProductCardProps {
    card: ProductLite;
    className?: string;
    style?: React.CSSProperties;
    bcms?: any;
}

export const ProductCard: React.FC<ProductCardProps> = ({ card, className, style, bcms }) => {
    const { favorites, toggleFavorite } = useFavorites();
    const productID = card.slug; 
    const isFavorite = favorites.includes(productID);

    return (
        <div 
            style={style} 
            className={classNames(
                'group flex flex-col h-full bg-black relative border border-white/5 hover:border-white/20 transition-all duration-500 rounded-2xl overflow-hidden shadow-2xl', 
                className
            )}
        >
            {/* ETIQUETA SUPERIOR (GÉNERO) */}
            <div className="absolute top-3 left-3 z-30">
                <span className="bg-white text-black text-[9px] font-black px-3 py-1 rounded-sm uppercase tracking-tighter shadow-[2px_2px_0px_rgba(0,0,0,1)] border border-black">
                    {card.gender?.title || 'Modelo'}
                </span>
            </div>

            {/* BOTÓN DE FAVORITOS (Siempre visible pero resalta en hover) */}
            <button 
                onClick={(e) => {
                    e.preventDefault();
                    toggleFavorite(productID);
                }}
                className="absolute top-3 right-3 z-40 p-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10 hover:bg-white hover:text-black transition-all duration-300"
            >
                <svg 
                    className={classNames("w-4 h-4 transition-colors", isFavorite ? "fill-red-500 stroke-red-500" : "fill-none stroke-white hover:stroke-black")}
                    viewBox="0 0 24 24" strokeWidth="2.5"
                >
                    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l8.84-8.84 1.06-1.06a5.5 5.5 0 000-7.78z" />
                </svg>
            </button>

         
        </div>
    );
};