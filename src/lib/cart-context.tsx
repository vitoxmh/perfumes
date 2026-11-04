"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CartProduct = {
  id: number;
  slug: string;
  name: string;
  brand: string;
  price: number;
  imageUrl: string | null;
};

export type CartLine = CartProduct & { quantity: number };

type CartContextValue = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  add: (product: CartProduct, quantity?: number) => void;
  setQuantity: (id: number, quantity: number) => void;
  remove: (id: number) => void;
  clear: () => void;
  hydrated: boolean;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "carrito-v1";

export function CartProvider({
  children,
  initialCount,
}: {
  children: ReactNode;
  initialCount?: number;
}) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, hydrated]);

  const value = useMemo<CartContextValue>(() => {
    const count = lines.reduce((acc, l) => acc + l.quantity, 0);
    const subtotal = lines.reduce((acc, l) => acc + l.quantity * l.price, 0);
    return {
      lines,
      count,
      subtotal,
      hydrated,
      add: (product, quantity = 1) =>
        setLines((prev) => {
          const existing = prev.find((l) => l.id === product.id);
          if (existing) {
            return prev.map((l) =>
              l.id === product.id ? { ...l, quantity: l.quantity + quantity } : l
            );
          }
          return [...prev, { ...product, quantity }];
        }),
      setQuantity: (id, quantity) =>
        setLines((prev) =>
          prev
            .map((l) => (l.id === id ? { ...l, quantity: Math.max(0, quantity) } : l))
            .filter((l) => l.quantity > 0)
        ),
      remove: (id) => setLines((prev) => prev.filter((l) => l.id !== id)),
      clear: () => setLines([]),
    };
  }, [lines, hydrated]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>");
  return ctx;
}
