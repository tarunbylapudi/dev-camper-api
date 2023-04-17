const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const bodyPaser = require("body-parser");
const colors = require("colors");
const fileUpload = require("express-fileupload");
const path=require('path')

const connectDB = require("./config/db");
const bootcamps = require("./routes/bootcamps");
const courses = require("./routes/courses");
const logger = require("./middleware/logger");
const errorHandler = require("./middleware/error");

//dotenv config
dotenv.config({ path: "config/config.env" });

//db connection
connectDB();

const app = express();

app.use(express.json());

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
