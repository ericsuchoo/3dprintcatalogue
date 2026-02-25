import React from 'react';
import { useFavorites } from '../../context/FavoritesContext';

const Header: React.FC = () => {
    const { favCount } = useFavorites();

    return (
        <header className="fixed top-0 left-0 w-full z-50 text-white bg-black border-b border-gray-100">
            <div className="container flex justify-between items-center py-3">
                <a href="/" className="font-bold text-[24px] uppercase tracking-tighter">
                    DCImpress 3D Store
                </a>
                <nav className="flex gap-8 items-center">
                    <a href="/shop" className="text-[18px] text-white uppercase tracking-widest hover:text-red-500 transition-colors">
                        Tienda
                    </a>
                    
                    {/* Contenedor relativo para posicionar el badge */}
                    <a href="/shop-2" className="relative text-[18px] text-white uppercase tracking-widest hover:text-red-500 transition-colors">
                        Mis Me gusta
                        {favCount > 0 && (
                            <span className="absolute -top-2 -right-4 bg-red-500 text-white px-1.5 py-0.5 rounded-full text-[10px] font-bold animate-pulse leading-none flex items-center justify-center min-w-[18px] h-[18px]">
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