import { createContext, useContext, useState, useCallback, useMemo, useEffect, type ReactNode } from "react";
import type { MenuItem } from "@workspace/api-client-react";

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (menuItem: MenuItem) => void;
  removeItem: (menuItemId: number) => void;
  updateQuantity: (menuItemId: number, quantity: number) => void;
  clearCart: () => void;
  totalPrice: number;
  totalItems: number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem("luka_cart");
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  useEffect(() => {
    localStorage.setItem("luka_cart", JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((menuItem: MenuItem) => {
    setItems((current) => {
      const existing = current.find((i) => i.menuItem.id === menuItem.id);
      if (existing) {
        return current.map((i) =>
          i.menuItem.id === menuItem.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...current, { menuItem, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((menuItemId: number) => {
    setItems((current) => current.filter((i) => i.menuItem.id !== menuItemId));
  }, []);

  const updateQuantity = useCallback((menuItemId: number, quantity: number) => {
    if (quantity <= 0) {
      setItems((current) => current.filter((i) => i.menuItem.id !== menuItemId));
      return;
    }
    setItems((current) =>
      current.map((i) => (i.menuItem.id === menuItemId ? { ...i, quantity } : i))
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalPrice = useMemo(
    () => items.reduce((t, i) => t + i.menuItem.price * i.quantity, 0),
    [items]
  );
  const totalItems = useMemo(
    () => items.reduce((t, i) => t + i.quantity, 0),
    [items]
  );

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalPrice, totalItems }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
