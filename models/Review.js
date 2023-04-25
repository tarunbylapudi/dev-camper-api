const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    maxlength: 100,
    required: [true, "Please add a title for the review"],
  },
  text: {
    type: String,
    required: [true, "Please add a some text"],
  },
  rating: {
    type: Number,
    min: 1,
    max: 10,
    required: [true, "Please add a rating between 1 and 10"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  bootcamp: {
    type: mongoose.Schema.ObjectId,
    ref: "Bootcamp",
    required: true,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
});

//prevent submitting duplicate reviews
//ReviewSchema.index({ bootcamp: 1, user: 1 }, { unique: true });

//Static method to get avrageRating
ReviewSchema.statics.getAverageRating = async function (bootcampId) {
  const obj = await this.aggregate([
    { $match: { bootcamp: bootcampId } },
    { $group: { _id: "$bootcamp", averageRating: { $avg: "$rating" } } },
  ]);

  try {
    await this.model("Bootcamp").findByIdAndUpdate(bootcampId, {
      averageRating: obj[0].averageRating,
    });
  } catch (error) {
    console.log(error);
  }
};

//call getAverageRating() after save

ReviewSchema.post("save", async function () {
  console.log("save");
  await this.constructor.getAverageRating(this.bootcamp);
});

// //call getAverageCost() before remove
// ReviewSchema.pre("findOneAndDelete", async function () {
//   console.log("findOneAndDelete");
//   await this.constructor.getAverageRating(this.bootcamp);
// });

module.exports = mongoose.model("Review", ReviewSchema);
