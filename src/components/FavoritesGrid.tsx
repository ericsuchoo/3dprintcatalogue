import { useMemo, useEffect, useState } from 'react';
import { useFavorites } from '../context/FavoritesContext';
import { ProductCard } from './ProductCard';

export const FavoritesGrid = ({ products = [] }: { products: any[] }) => {
    const { favorites } = useFavorites();
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    const favoriteProducts = useMemo(() => {
        if (!isLoaded || !favorites) return [];
        // Filtramos comparando contra slug e ID para recuperar tu lógica de ayer
        return products.filter(p => 
            favorites.includes(p.slug) || favorites.includes(p._id)
        );
    }, [favorites, products, isLoaded]);

    if (!isLoaded) return null;

    if (favoriteProducts.length === 0) {
        return (
            <div className="py-32 text-center">
                <p className="text-[10px] tracking-[4px] text-gray-400 uppercase font-bold">Tu selección está vacía</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
            {favoriteProducts.map((product) => (
                // Pasamos el objeto completo 'product' como 'card' para que ProductCard lo lea bien
                <ProductCard key={product.slug} card={product} />
            ))}
        </div>
    );
};