import API from "./api";

export const getSeatAvailability = async (eventId) => {
  const res = await API.get(`/bookings/event/${eventId}/seats`);
  return res.data;
};

export const bookEvent = async (eventId, seatNumber) => {
  const res = await API.post("/bookings", { eventId, seatNumber });
  return res.data;
};

export const getBookings = async () => {
  const res = await API.get("/bookings/my");
  return res.data;
};
