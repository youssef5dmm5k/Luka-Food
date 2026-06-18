import { useState, useCallback, useMemo, useEffect } from "react";
import { MenuItem } from "@workspace/api-client-react";

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

export function useCart() {
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
          i.menuItem.id === menuItem.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
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
      removeItem(menuItemId);
      return;
    }
    setItems((current) =>
      current.map((i) =>
        i.menuItem.id === menuItemId ? { ...i, quantity } : i
      )
    );
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalPrice = useMemo(() => {
    return items.reduce((total, item) => total + item.menuItem.price * item.quantity, 0);
  }, [items]);

  const totalItems = useMemo(() => {
    return items.reduce((total, item) => total + item.quantity, 0);
  }, [items]);

  return {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    totalPrice,
    totalItems,
  };
}
