import React from 'react';
import { useFavorites } from '../../context/FavoritesContext';

const Header: React.FC = () => {
    const { favCount } = useFavorites();

    return (
        <header className="fixed top-0 left-0 w-full z-50 bg-white border-b border-gray-100">
            <div className="container flex justify-between items-center py-4">
                <a href="/" className="font-bold text-xl uppercase tracking-tighter">
                    DCImpress 3D Store
                </a>
                <nav className="flex gap-6 items-center">
                    <a href="/shop" className="text-[10px] font-black uppercase tracking-widest">Tienda</a>
                    <a href="/shop-2" className="text-[10px] font-black uppercase tracking-widest">Mis Me gusta</a>
                    <a href="/favorites" className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest">
                        Favoritos 
                        {favCount > 0 && (
                            <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-[9px] animate-pulse">
                                {favCount}
                            </span>
                        )}
                    </a>
                </nav>
            </div>
        </header>
    );
};

export default Header;