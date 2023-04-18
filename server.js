const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const bodyPaser = require("body-parser");
const colors = require("colors");
const fileUpload = require("express-fileupload");
const path = require("path");
const cookieParser = require("cookie-parser");

const connectDB = require("./config/db");
const bootcamps = require("./routes/bootcamps");
const courses = require("./routes/courses");
const auth = require("./routes/auth");
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

//set static folder
app.use(express.static(path.join(__dirname, "public")));

//mounting routes
app.use("/api/v1/bootcamps", bootcamps);
app.use("/api/v1/courses", courses);
app.use("/api/v1/auth", auth);

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
