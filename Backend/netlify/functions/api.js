const dotenv = require("dotenv");
const serverless = require("serverless-http");
const app = require("../../app");
const connectDB = require("../../config/db");
const seedDefaultEvents = require("../../utils/seedDefaultEvents");

dotenv.config();

let initPromise;

const ensureAppReady = async () => {
  if (!initPromise) {
    initPromise = (async () => {
      await connectDB();
      await seedDefaultEvents();
    })().catch((error) => {
      initPromise = null;
      throw error;
    });
  }

  return initPromise;
};

const expressHandler = serverless(app);

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  await ensureAppReady();
  return expressHandler(event, context);
};
