const Booking = require("../models/Booking");
const Event = require("../models/Event");
const User = require("../models/User");
const { sendBookingCompletedEmail } = require("../utils/emailService");

const normalizeSeatNumber = (value) => {
  const seatNumber = Number(value);
  return Number.isInteger(seatNumber) ? seatNumber : NaN;
};

const syncEventSeatState = async (event) => {
  const bookings = await Booking.find({ eventId: event._id }).sort({ createdAt: 1, _id: 1 });
  const currentRemainingSeats = Math.max(Math.floor(Number(event.seats ?? 0)), 0);
  const existingTotalSeats = Math.floor(Number(event.totalSeats));
  const derivedTotalSeats = Number.isInteger(existingTotalSeats)
    && existingTotalSeats > 0
    ? existingTotalSeats
    : currentRemainingSeats + bookings.length;

  const assignedSeats = new Set();
  const bookingsNeedingSeatNumbers = [];

  bookings.forEach((booking) => {
    const seatNumber = normalizeSeatNumber(booking.seatNumber);
    const seatAlreadyAssigned = assignedSeats.has(seatNumber);
    const seatOutOfBounds = seatNumber < 1 || seatNumber > derivedTotalSeats;

    if (Number.isNaN(seatNumber) || seatAlreadyAssigned || seatOutOfBounds) {
      bookingsNeedingSeatNumbers.push(booking._id);
      return;
    }

    assignedSeats.add(seatNumber);
  });

  const freeSeatNumbers = [];
  for (let seatNumber = 1; seatNumber <= derivedTotalSeats; seatNumber += 1) {
    if (!assignedSeats.has(seatNumber)) {
      freeSeatNumbers.push(seatNumber);
    }
  }

  if (bookingsNeedingSeatNumbers.length > 0) {
    await Booking.bulkWrite(
      bookingsNeedingSeatNumbers
        .map((bookingId, index) => {
          const seatNumber = freeSeatNumbers[index];

          if (!seatNumber) {
            return null;
          }

          assignedSeats.add(seatNumber);

          return {
            updateOne: {
              filter: { _id: bookingId },
              update: { $set: { seatNumber } }
            }
          };
        })
        .filter(Boolean)
    );
  }

  const remainingSeats = Math.max(derivedTotalSeats - bookings.length, 0);
  const shouldUpdateEvent = event.totalSeats !== derivedTotalSeats || event.seats !== remainingSeats;

  if (shouldUpdateEvent) {
    event.totalSeats = derivedTotalSeats;
    event.seats = remainingSeats;
    await event.save();
  }

  return {
    totalSeats: derivedTotalSeats,
    remainingSeats,
    bookedSeatNumbers: Array.from(assignedSeats).sort((a, b) => a - b)
  };
};

exports.getEventSeatMap = async (req, res) => {
  const { eventId } = req.params;
  const event = await Event.findById(eventId);

  if (!event) {
    return res.status(404).json({ message: "Event not found." });
  }

  const seatState = await syncEventSeatState(event);

  res.json({
    eventId: event._id,
    totalSeats: seatState.totalSeats,
    availableSeats: seatState.remainingSeats,
    bookedSeats: seatState.bookedSeatNumbers
  });
};

// Book Event
exports.bookEvent = async (req, res) => {
  const { eventId, seatNumber: requestedSeatNumber } = req.body;
  const seatNumber = normalizeSeatNumber(requestedSeatNumber);

  const event = await Event.findById(eventId);

  if (!event) {
    return res.status(404).json({ message: "Event not found." });
  }

  const seatState = await syncEventSeatState(event);

  if (!Number.isInteger(seatNumber) || seatNumber <= 0) {
    return res.status(400).json({ message: "Please choose a valid seat number." });
  }

  if (seatNumber > seatState.totalSeats) {
    return res.status(400).json({ message: "Selected seat does not exist for this event." });
  }

  if (seatState.remainingSeats <= 0) {
    return res.status(409).json({ message: "No seats available." });
  }

  if (seatState.bookedSeatNumbers.includes(seatNumber)) {
    return res.status(409).json({ message: "That seat is already booked. Please pick another one." });
  }

  const updatedEvent = await Event.findOneAndUpdate(
    { _id: eventId, seats: { $gt: 0 } },
    { $inc: { seats: -1 } },
    { new: true }
  );

  if (!updatedEvent) {
    return res.status(409).json({ message: "No seats available." });
  }

  try {
    const booking = await Booking.create({
      userId: req.user,
      eventId,
      seatNumber
    });

    res.json({
      ...booking.toObject(),
      message: `Booking confirmed for seat ${seatNumber}.`
    });

    User.findById(req.user)
      .select("name email")
      .then((user) => {
        if (!user?.email) {
          return;
        }

        return sendBookingCompletedEmail({
          name: user.name,
          email: user.email,
          bookingId: booking._id,
          eventTitle: event.title || "MovieMeet Event",
          seatNumber,
          eventDate: event.date,
          location: event.location
        });
      })
      .catch((mailError) => {
        console.error(`Booking confirmation email failed for user ${req.user}: ${mailError.message}`);
      });
  } catch (error) {
    await Event.findByIdAndUpdate(eventId, { $inc: { seats: 1 } });

    if (error?.code === 11000) {
      return res.status(409).json({
        message: "That seat was just booked by someone else. Please choose another seat."
      });
    }

    throw error;
  }
};

// Get My Bookings
exports.getMyBookings = async (req, res) => {
  const bookings = await Booking.find({ userId: req.user })
    .sort({ createdAt: -1 })
    .populate("eventId");

  res.json(bookings);
};
