var mongoose = require("mongoose");

var resourceSchema = mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String, default: "" },
  type: mongoose.Types.ObjectId,
  description: String,
  registrationDate: { type: Date, default: Date.now },
  directory: String,
  isPublic: Boolean,
  authors: [String],
  hashTags: [String],
  posterID: String,
  comments: {
    type: [
      {
        text: String,
        rating: Number,
        posterID: mongoose.Types.ObjectId,
      },
    ],
    default: [],
  },
});

module.exports = mongoose.model("resource", resourceSchema);
