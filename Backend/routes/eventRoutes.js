const router = require("express").Router();
const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");
const { createEvent, getEvents } = require("../controllers/eventController");

router.get("/", getEvents);
router.post("/", protect, adminOnly, createEvent);

module.exports = router;
