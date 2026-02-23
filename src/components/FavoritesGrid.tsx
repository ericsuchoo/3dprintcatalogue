import React from 'react';
import { useFavorites } from '../context/FavoritesContext';
import { ProductCard } from './ProductCard';

interface Props {
    allProducts: any[]; 
}

const FavoritesGrid: React.FC<Props> = ({ allProducts }) => {
    const { favorites } = useFavorites();

    const favoriteProducts = allProducts.filter(product => 
        favorites.includes(product.slug)
    );

    if (favoriteProducts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-32 border border-gray-100 rounded-sm bg-gray-50/30">
                <span className="text-3xl mb-4">🖤</span>
                <p className="text-[10px] text-appGray-400 font-black uppercase tracking-[3px]">Tu lista está vacía</p>
                <a href="/shop" className="mt-8 px-8 py-3 bg-black text-white text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all">Explorar Catálogo</a>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-12">
            {favoriteProducts.map((product) => (
                <div key={product.slug}>
                    {/* @ts-ignore - Evita errores de props obligatorias de BCMS en el Build */}
                    <ProductCard card={product} />
                </div>
            ))}
        </div>
    );
};

export default FavoritesGrid;