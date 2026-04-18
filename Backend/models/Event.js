const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: String,
  date: String,
  location: String,
  seats: Number,
  totalSeats: Number
}, { timestamps: true });

module.exports = mongoose.model("Event", eventSchema);
