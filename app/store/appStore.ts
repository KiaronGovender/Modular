import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem, UserRole, Order } from "@/app/types";

interface AppState {
  userRole: UserRole;
  cart: CartItem[];
  orders: Order[];

  // Actions
  setUserRole: (role: UserRole) => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  addOrder: (order: Order) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial state
      userRole: "retail",
      cart: [],
      orders: [
        {
          id: "ORD-2024-001",
          date: new Date("2024-12-15"),
          items: [],
          total: 12450,
          status: "delivered",
          role: "retail",
        },
        {
          id: "ORD-2024-002",
          date: new Date("2025-01-10"),
          items: [],
          total: 28900,
          status: "shipped",
          role: "wholesale",
        },
        {
          id: "ORD-2024-003",
          date: new Date("2025-01-25"),
          items: [],
          total: 15600,
          status: "processing",
          role: "retail",
        },
      ],

      // Actions
      setUserRole: (role) => set({ userRole: role }),

      addToCart: (item) =>
        set((state) => ({
          cart: [...state.cart, item],
        })),

      removeFromCart: (itemId) =>
        set((state) => ({
          cart: state.cart.filter((item) => item.id !== itemId),
        })),

      clearCart: () => set({ cart: [] }),

      addOrder: (order) =>
        set((state) => ({
          orders: [order, ...state.orders],
        })),
    }),
    { name: "modular-store" },
  ),
);
