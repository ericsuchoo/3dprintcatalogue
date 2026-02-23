import React, { type PropsWithChildren } from 'react';
import { CartProvider } from '../context/CartContext';
import { FavoritesProvider } from '../context/FavoritesContext';

export const ContextWrapper: React.FC<PropsWithChildren> = ({ children }) => {
    return (
        <CartProvider>
            <FavoritesProvider>
                {children}
            </FavoritesProvider>
        </CartProvider>
    );
};

export default ContextWrapper;