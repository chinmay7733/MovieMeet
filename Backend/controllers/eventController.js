const Event = require("../models/Event");

// Create Event
exports.createEvent = async (req, res) => {
  const seats = Number(req.body.seats);

  if (!Number.isInteger(seats) || seats <= 0) {
    return res.status(400).json({ message: "Seat count should be a valid positive number." });
  }

  const event = await Event.create({
    ...req.body,
    seats,
    totalSeats: seats
  });

  res.json(event);
};

// Get All Events
exports.getEvents = async (req, res) => {
  const events = await Event.find().sort({ date: 1, createdAt: 1 });
  res.json(events);
};
