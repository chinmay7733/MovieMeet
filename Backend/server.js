const dotenv = require("dotenv");
const app = require("./app");
const connectDB = require("./config/db");
const seedDefaultEvents = require("./utils/seedDefaultEvents");

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  await seedDefaultEvents();

  app.listen(PORT, () => console.log(`Server running on ${PORT}`));
};

startServer();
