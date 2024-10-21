const path = require("path");

const express = require("express");
const cors = require("cors");
const compression = require("compression");

const morgan = require("morgan");
const dotenv = require("dotenv");

dotenv.config({ path: "config.env" });
const ApiError = require("./utils/apiError");
const globalError = require("./middlewares/errorMiddleware");
const dbConnection = require("./config/database");
// Routes
const mountRoutes = require("./routes");

// connect to database
dbConnection();

// Express App
const app = express();

// enable cors in all income requests
app.use(cors());
app.options("*", cors());

// compress all responses
app.use(compression());

// MiddleWare
app.use(express.json()); // parse headers and body
app.use(express.static(path.join(__dirname, "uploads"))); // serve static files in static folder

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`mode: ${process.env.NODE_ENV}`);
}

// Mount Routs
mountRoutes(app);

app.all("*", (req, res, next) => {
  next(new ApiError(`Can't Find This Route: ${req.originalUrl}`, 400));
});

// Global Error Handling Middleware inside Express
app.use(globalError);

const PORT = process.env.PORT || 8000;

const server = app.listen(PORT, () => {
  console.log(`App Running On Port ${PORT}`);
});

// @desc  handle rejections error outside express
process.on("unhandledRejection", (err) => {
  console.error(`UnhandledRejection Errors: ${err.name} | ${err.message}`);
  server.close(() => {
    console.error(`Shutting down....`);
    process.exit(1); // exit application
  });
});
