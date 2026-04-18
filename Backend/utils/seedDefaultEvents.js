const Event = require("../models/Event");
const defaultEvents = require("../data/defaultEvents");

const seedDefaultEvents = async () => {
  const existingEvents = await Event.countDocuments();

  if (existingEvents > 0) {
    return;
  }

  await Event.insertMany(defaultEvents);
  console.log("Default explore events created");
};

module.exports = seedDefaultEvents;
