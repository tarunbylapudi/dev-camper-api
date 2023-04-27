const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const bodyPaser = require("body-parser");
const colors = require("colors");
const fileUpload = require("express-fileupload");
const path = require("path");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const cors = require("cors");

const connectDB = require("./config/db");
const bootcamps = require("./routes/bootcamps");
const courses = require("./routes/courses");
const auth = require("./routes/auth");
const reviews = require("./routes/reviews");
const users = require("./routes/users");
const logger = require("./middleware/logger");
const errorHandler = require("./middleware/error");

//dotenv config
dotenv.config({ path: "config/config.env" });

//db connection
connectDB();

const app = express();

//body parser
app.use(express.json());

//cookie parser
app.use(cookieParser());

//middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

//fileUpload
app.use(fileUpload());

//sanitize data
app.use(mongoSanitize());

//set security headers
app.use(helmet());

//prevent xss attacks
app.use(xss());

//rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 2, // Limit each IP to 100 requests per `window` (here, per 10 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.use(limiter);

//prevent http param pollution
app.use(hpp());

//allow cors
app.use(cors());

//set static folder
app.use(express.static(path.join(__dirname, "public")));

//mounting routes
app.use("/api/v1/bootcamps", bootcamps);
app.use("/api/v1/courses", courses);
app.use("/api/v1/auth", auth);
app.use("/api/v1/users", users);
app.use("/api/v1/reviews", reviews);

//errorHandler
app.use(errorHandler);

const port = process.env.PORT || 5000;

const server = app.listen(
  port,
  console.log(
    `server started running in ${process.env.NODE_ENV} mode on port ${port}`
      .yellow.bold
  )
);

//handle unhandled promises
process.on("unhandledRejection", (err, Promise) => {
  console.log(`Error : ${err.message}`.red);
  server.close(() => process.exit(1));
});
