import { useMemo } from 'react'; 
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
            className={classNames('group flex flex-col h-full bg-black/90 relative border border-transparent hover:border-gray-100 transition-all duration-300 rounded-xl overflow-hidden', className)}
            title={card.title}
        >
            {/* ETIQUETA DINÁMICA: TIPO DE PERSONAJE */}
            <div className="absolute top-4 left-4 z-30">
                <span className="bg-black/60 backdrop-blur-md text-white text-[8px] font-black px-3 py-1.5 rounded-full uppercase tracking-[2px] border border-white/10">
                    {card.gender?.title || 'Modelo'}
                </span>
            </div>

            {/* BOTÓN DE FAVORITOS */}
            <button 
                onClick={(e) => {
                    e.preventDefault();
                    toggleFavorite(productID);
                }}
                className="absolute top-4 right-4 z-30 p-2.5 bg-white/10 backdrop-blur-sm rounded-full shadow-md hover:scale-110 active:scale-95 transition-all"
            >
                <svg 
                    className={classNames("w-5 h-5 transition-colors", isFavorite ? "fill-red-500 stroke-red-500" : "fill-none stroke-white")}
                    viewBox="0 0 24 24" strokeWidth="2"
                >
                    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l8.84-8.84 1.06-1.06a5.5 5.5 0 000-7.78z" />
                </svg>
            </button>

            <a href={`/shop/${card.slug}`} className="flex flex-col h-full">
                {/* CONTENEDOR DE IMAGEN OPTIMIZADA */}
                <div className="aspect-[3/4] overflow-hidden bg-[#F2F2F2] relative">
                    {/* Cambiamos <img> por <BCMSImage> para que use el banner_card WebP 
                      que definimos en productToLite. Esto ahorra mucho espacio y carga más rápido.
                    */}
                    <BCMSImage
                        media={card.cover}
                        clientConfig={bcms}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    
                    {/* OVERLAY DE TALLAS AL HACER HOVER */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-white/95">
                        <p className="text-[9px] font-bold uppercase text-gray-400 mb-2">Escalas disponibles</p>
                        <div className="flex flex-wrap gap-1">
                            {card.sizes?.map((size, idx) => (
                                <span key={idx} className="text-[10px] font-black border border-black/10 px-1.5 py-0.5 text-black">
                                    {size.size.meta.en?.title}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* INFORMACIÓN */}
                <div className="pt-6 pb-4 px-3 bg-black">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <p className="text-[10px] font-medium text-gray-500 uppercase tracking-[2px] mb-1">
                                {card.brand?.title || 'Original'}
                            </p>
                            <h3 className="text-sm font-black uppercase italic tracking-tighter text-white">
                                {card.title}
                            </h3>
                        </div>
                        <p className="text-sm font-black text-white">${card.price}</p>
                    </div>

                    {card.version && (
                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/5">
                            <div 
                                className="w-2.5 h-2.5 rounded-full border border-white/10" 
                                style={{ backgroundColor: (card.version as any).color || '#fff' }} 
                            />
                            <p className="text-[9px] font-bold uppercase text-gray-500 tracking-widest">{card.version.title}</p>
                        </div>
                    )}
                </div>
            </a>
        </div>
    );
};