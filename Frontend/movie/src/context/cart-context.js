import { createContext } from "react";

export const CartContext = createContext({
  items: [],
  totalItems: 0,
  totalAmount: 0,
  addSeats: () => 0,
  removeSeat: () => {},
  removeSeats: () => {},
  clearCart: () => {},
  getSeatsForEvent: () => [],
});
