const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
  seatNumber: Number
}, { timestamps: true });

bookingSchema.index(
  { eventId: 1, seatNumber: 1 },
  {
    unique: true,
    partialFilterExpression: { seatNumber: { $exists: true, $type: "number" } }
  }
);

module.exports = mongoose.model("Booking", bookingSchema);
