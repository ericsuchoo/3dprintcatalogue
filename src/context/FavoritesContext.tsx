import React, { createContext, useContext, useState, useEffect } from 'react';

interface FavoritesContextType {
    favorites: string[];
    toggleFavorite: (slug: string) => void;
    favCount: number;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [favorites, setFavorites] = useState<string[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem('user_favorites');
        if (saved) {
            try {
                setFavorites(JSON.parse(saved));
            } catch (e) {
                console.error("Error cargando favoritos", e);
            }
        }
    }, []);

    const toggleFavorite = (slug: string) => {
        const saved = localStorage.getItem('user_favorites');
        const current = saved ? JSON.parse(saved) : [];
        const newFavs = current.includes(slug)
            ? current.filter((id: string) => id !== slug)
            : [...current, slug];
        
        localStorage.setItem('user_favorites', JSON.stringify(newFavs));
        setFavorites(newFavs);
    };

    return (
        <FavoritesContext.Provider value={{ favorites, toggleFavorite, favCount: favorites.length }}>
            {children}
        </FavoritesContext.Provider>
    );
};

export function useFavorites() {
    const context = useContext(FavoritesContext);
    if (context === undefined) {
        // Fallback para evitar que la app explote si se usa fuera del provider
        return { favorites: [], toggleFavorite: () => {}, favCount: 0 };
    }
    return context;
}