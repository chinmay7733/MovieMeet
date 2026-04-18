import { useEffect, useState } from "react";
import { CartContext } from "./cart-context";

const CART_STORAGE_KEY = "moviemeet-cart";
const TICKET_PRICE = 249;

const readStoredCart = () => {
  try {
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    const parsedCart = storedCart ? JSON.parse(storedCart) : [];

    return Array.isArray(parsedCart) ? parsedCart : [];
  } catch {
    return [];
  }
};

export function CartProvider({ children }) {
  const [items, setItems] = useState(readStoredCart);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addSeats = (event, seatNumbers) => {
    let addedCount = 0;

    setItems((currentItems) => {
      const existingCartKeys = new Set(currentItems.map((item) => item.cartKey));
      const nextItems = [...currentItems];

      seatNumbers
        .slice()
        .sort((firstSeat, secondSeat) => firstSeat - secondSeat)
        .forEach((seatNumber) => {
          const cartKey = `${event._id}-${seatNumber}`;

          if (existingCartKeys.has(cartKey)) {
            return;
          }

          nextItems.push({
            cartKey,
            eventId: event._id,
            title: event.title,
            date: event.date,
            location: event.location,
            seatNumber,
            price: TICKET_PRICE,
          });
          existingCartKeys.add(cartKey);
          addedCount += 1;
        });

      return nextItems;
    });

    return addedCount;
  };

  const removeSeat = (cartKey) => {
    setItems((currentItems) => currentItems.filter((item) => item.cartKey !== cartKey));
  };

  const removeSeats = (cartKeys) => {
    const cartKeySet = new Set(cartKeys);
    setItems((currentItems) => currentItems.filter((item) => !cartKeySet.has(item.cartKey)));
  };

  const clearCart = () => {
    setItems([]);
  };

  const getSeatsForEvent = (eventId) =>
    items
      .filter((item) => item.eventId === eventId)
      .map((item) => item.seatNumber)
      .sort((firstSeat, secondSeat) => firstSeat - secondSeat);

  const totalItems = items.length;
  const totalAmount = items.reduce(
    (sum, item) => sum + Number(item.price ?? TICKET_PRICE),
    0
  );

  const value = {
    items,
    totalItems,
    totalAmount,
    addSeats,
    removeSeat,
    removeSeats,
    clearCart,
    getSeatsForEvent,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
