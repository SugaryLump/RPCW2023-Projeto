var mongoose = require("mongoose");

var resourceSchema = mongoose.Schema({
  title: String,
  subtitle: { type: String, default: "" },
  type: String,
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
