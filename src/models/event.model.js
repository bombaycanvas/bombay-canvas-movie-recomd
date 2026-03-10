const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },

    contentId: {
      type: Number,
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ["movie", "tv", "anime"],
      required: true,
    },

    event: {
      type: String,
      enum: ["impression", "watch_time", "skip", "like"],
      required: true,
    },

    duration: {
      type: Number, // seconds watched
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);
