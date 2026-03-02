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

            <a href={`/shop/${card.slug}`} className="flex flex-col h-full relative">
                
                {/* CONTENEDOR DE IMAGEN + OVERLAY HOVER */}
                <div className="aspect-[3/4] overflow-hidden bg-[#111] relative">
                    <BCMSImage
                        media={card.cover}
                        clientConfig={bcms}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 group-hover:opacity-40"
                    />

                    {/* ESTE ES EL BOTÓN QUE APARECE AL PASAR EL MOUSE (OVERLAY CENTRAL) */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20 bg-black/20 backdrop-blur-[2px]">
                        <div className="bg-white text-black font-black text-[11px] px-6 py-3 rounded-full uppercase tracking-[2px] shadow-[4px_4px_0px_#000] border-2 border-black transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                            Ver Detalles
                        </div>
                        
                        {/* Pequeño detalle de escalas debajo del botón central */}
                        <div className="mt-4 flex gap-1 opacity-0 group-hover:opacity-100 delay-100 transition-opacity duration-500">
                             {card.sizes?.slice(0, 3).map((size, idx) => (
                                <span key={idx} className="text-[8px] font-bold text-white border border-white/20 px-2 py-0.5 rounded-md">
                                    {size.size.meta.en?.title}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* INFORMACIÓN FIJA (ABAJO) */}
                <div className="flex flex-col p-4 bg-black border-t border-white/5">
                    <div className="flex justify-between items-start gap-2">
                        <div className="flex-1">
                            <p className="text-[9px] font-black text-zinc-500 uppercase tracking-[2px] mb-1 italic">
                                {card.brand?.title || 'Original Series'}
                            </p>
                            <h3 className="text-sm font-black uppercase italic tracking-tighter text-white leading-tight">
                                {card.title}
                            </h3>
                        </div>
                        <div className="text-right">
                             <p className="text-base font-black text-white italic">
                                ${card.price}
                            </p>
                        </div>
                    </div>
                </div>
            </a>
        </div>
    );
};