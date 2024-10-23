const path = require("path");

const express = require("express");
const cors = require("cors");
const compression = require("compression");
const { rateLimit } = require("express-rate-limit");

const morgan = require("morgan");
const dotenv = require("dotenv");

dotenv.config({ path: "config.env" });
const ApiError = require("./utils/apiError");
const globalError = require("./middlewares/errorMiddleware");
const dbConnection = require("./config/database");

// Routes
const mountRoutes = require("./routes");
const { checkoutWebhook } = require("./services/orderService");

// connect to database
dbConnection();

// Express App
const app = express();

// enable cors in all income requests
app.use(cors());
app.options("*", cors());

// compress all responses
app.use(compression());

// Stripe webhook Route
app.post(
  "/checkout-webhook",
  express.raw({ type: "application/json" }),
  checkoutWebhook
);

// MiddleWare
app.use(express.json({ limit: "20kb" })); // parse headers and body
app.use(express.static(path.join(__dirname, "uploads"))); // serve static files in static folder

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`mode: ${process.env.NODE_ENV}`);
}

// Limit each IP to 100 requests per `window` (here, per 15 minutes)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too Many Requests please try agin after 15 min",
});

app.use("/api/v1/auth", limiter);

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
