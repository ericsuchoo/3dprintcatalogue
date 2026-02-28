import React from 'react';
import { useFavorites } from '../../context/FavoritesContext';

const Header: React.FC = () => {
    const { favCount } = useFavorites();

    return (
        <header className="fixed top-0 left-0 w-full z-50 text-white bg-black border-b border-white/10 backdrop-blur-md bg-opacity-90">
            <div className="container flex justify-between items-center py-4">
                <a href="/" className="font-black text-[20px] md:text-[24px] uppercase tracking-tighter italic">
                    DCImpress <span className="text-red-500">3D</span> Store
                </a>
                
                <nav className="flex gap-6 md:gap-8 items-center">
                    {/* NUEVO ENLACE A LA PESTAÑA DE EXPLORAR GÉNEROS */}
                    <a href="/explorar" className="text-[14px] md:text-[16px] text-white uppercase font-bold tracking-widest hover:text-red-500 transition-colors">
                        Explorar
                    </a>

                    <a href="/shop" className="text-[14px] md:text-[16px] text-white uppercase font-bold tracking-widest hover:text-red-500 transition-colors">
                        Tienda
                    </a>
                    
                    {/* Contenedor relativo para posicionar el badge */}
                    <a href="/shop-2" className="relative text-[14px] md:text-[16px] text-white uppercase font-bold tracking-widest hover:text-red-500 transition-colors">
                        Favoritos
                        {favCount > 0 && (
                            <span className="absolute -top-2 -right-5 bg-red-600 text-white px-1.5 py-0.5 rounded-full text-[9px] font-black animate-pulse leading-none flex items-center justify-center min-w-[18px] h-[18px] border border-black">
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