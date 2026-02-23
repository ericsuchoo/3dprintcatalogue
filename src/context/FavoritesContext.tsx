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
        const newFavs = favorites.includes(slug)
            ? favorites.filter((id) => id !== slug)
            : [...favorites, slug];
        
        setFavorites(newFavs);
        localStorage.setItem('user_favorites', JSON.stringify(newFavs));
    };

    return (
        <FavoritesContext.Provider value={{ favorites, toggleFavorite, favCount: favorites.length }}>
            {children}
        </FavoritesContext.Provider>
    );
};

export const useFavorites = () => {
    const context = useContext(FavoritesContext);
    if (!context) return { favorites: [], toggleFavorite: () => {}, favCount: 0 };
    return context;
};