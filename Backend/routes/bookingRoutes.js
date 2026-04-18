const router = require("express").Router();
const protect = require("../middleware/authMiddleware");

const {
  getEventSeatMap,
  bookEvent,
  getMyBookings
} = require("../controllers/bookingController");

router.get("/event/:eventId/seats", getEventSeatMap);
router.post("/", protect, bookEvent);
router.get("/my", protect, getMyBookings);

module.exports = router;
