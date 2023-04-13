const fs = require("fs");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const colors = require("colors");

//load env vars
dotenv.config({ path: "config/config.env" });

//Load models
const Bootcamp = require("./models/Bootcamp");

//conect To DB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

//read json files
const bootcamps = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/bootcamps.json`, "utf-8")
);

//import to Db
const importData = async () => {
  try {
    await Bootcamp.create(bootcamps);
    console.log("Data Imported...".green.inverse);
    process.exit();
  } catch (error) {
    console.log(error.message);
    process.exit();
  }
};

//Delete Data
const deleteData = async () => {
  try {
    await Bootcamp.deleteMany();
    console.log("Data destroyed...".red.inverse);
    process.exit();
  } catch (error) {
    console.log(error);
    process.exit();
  }
};

//script

if (process.argv[2] === "-i") {
  importData();
} else if (process.argv[2] === "-d") {
  deleteData();
}
