import { useMemo } from 'react'; // Eliminamos 'React' no usado y añadimos useMemo si fuera necesario, o solo lo que uses.
import classNames from 'classnames';
import { useFavorites } from '../context/FavoritesContext';
import type { ProductLite } from '../utils/product';

export interface ProductCardProps {
    card: ProductLite;
    className?: string;
    style?: React.CSSProperties;
    bcms?: any;
}

export const ProductCard: React.FC<ProductCardProps> = ({ card, className, style }) => {
    const { favorites, toggleFavorite } = useFavorites();
    const productID = card.slug; 
    const isFavorite = favorites.includes(productID);

    return (
        <div 
            style={style} 
            className={classNames('group flex flex-col h-full bg-black/90 relative border border-transparent hover:border-gray-100 transition-all duration-300', className)}
            title={card.title}
        >
            <button 
                onClick={(e) => {
                    e.preventDefault();
                    toggleFavorite(productID);
                }}
                className="absolute top-4 right-4 z-30 p-2.5 bg-white/10 backdrop-blur-sm rounded-full shadow-md hover:scale-110 active:scale-95 transition-all"
            >
                <svg 
                    className={classNames("w-5 h-5 transition-colors", isFavorite ? "fill-red-500 stroke-red-500" : "fill-none stroke-black")}
                    viewBox="0 0 24 24" strokeWidth="2"
                >
                    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l8.84-8.84 1.06-1.06a5.5 5.5 0 000-7.78z" />
                </svg>
            </button>

            <a href={`/shop/${card.slug}`} className="flex flex-col h-full">
                <div className="aspect-[3/4] overflow-hidden bg-[#F2F2F2] relative">
                    <img
                        src={card.cloudflare_cover || card.cover?.url}
                        alt={card.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    
                    <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-white/90">
                        <p className="text-[9px] font-bold uppercase text-gray-400 mb-2">Tallas disponibles</p>
                        <div className="flex flex-wrap gap-1">
                            {card.sizes?.map((size, idx) => (
                                <span key={idx} className="text-[10px] font-black border border-black/10 px-1.5 py-0.5">
                                    {size.size.meta.en?.title}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="pt-6 pb-2 px-1">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-[2px] mb-1">
                                {card.brand?.title || 'Original'}
                            </p>
                            <h3 className="text-sm font-black uppercase italic tracking-tighter">
                                {card.title}
                            </h3>
                        </div>
                        <p className="text-sm font-black">${card.price}</p>
                    </div>

                    {card.version && (
                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-50">
                            {/* CORRECCIÓN AQUÍ: Añadimos (as any) para evitar el error de TS */}
                            <div 
                                className="w-2.5 h-2.5 rounded-full" 
                                style={{ backgroundColor: (card.version as any).color }} 
                            />
                            <p className="text-[9px] font-bold uppercase text-gray-400">{card.version.title}</p>
                        </div>
                    )}
                </div>
            </a>
        </div>
    );
};