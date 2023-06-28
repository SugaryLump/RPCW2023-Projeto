var mongoose = require("mongoose");

var resourceSchema = mongoose.Schema({
  title: String,
  subtitle: {type: String, default: ""},
  type: String,
  description: String,
  registrationDate: {type: Date, default: Date.now},
  isPublic: Boolean,
  authors: [String],
  hashTags: [String],
  posterID: String
});

module.exports = mongoose.model("resource", resourceSchema);
