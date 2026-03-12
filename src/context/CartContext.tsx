import { createContext, useContext, useState, type ReactNode } from "react";

interface CartItem {
  slug: string;
  title: string;
  size: string;
  color: string;
  price: number;
  cover: string;
  amount: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addCartItem: (item: CartItem) => void;
  removeCartItem: (item: CartItem) => void;
  cartLength: number;
  totalCartPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const addCartItem = (item: CartItem) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find(
        (cartItem) =>
          cartItem.slug === item.slug &&
          cartItem.size === item.size &&
          cartItem.color === item.color
      );

      if (existingItem) {
        return prevItems.map((cartItem) =>
          cartItem.slug === item.slug &&
          cartItem.size === item.size &&
          cartItem.color === item.color
            ? { ...cartItem, amount: cartItem.amount + 1 }
            : cartItem
        );
      }

      return [...prevItems, { ...item, amount: 1 }];
    });
  };

  const removeCartItem = (item: CartItem) => {
    setCartItems((prevItems) => {
      const index = prevItems.findIndex(
        (cartItem) =>
          cartItem.slug === item.slug &&
          cartItem.size === item.size &&
          cartItem.color === item.color
      );

      if (index === -1) return prevItems;

      if (prevItems[index].amount > 1) {
        return prevItems.map((cartItem, i) =>
          i === index
            ? { ...cartItem, amount: cartItem.amount - 1 }
            : cartItem
        );
      }

      const updated = [...prevItems];
      updated.splice(index, 1);
      return updated;
    });
  };

  const cartLength = cartItems.reduce((acc, item) => acc + item.amount, 0);

  const totalCartPrice = cartItems
    .reduce((acc, item) => acc + item.price * item.amount, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addCartItem,
        removeCartItem,
        cartLength,
        totalCartPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}