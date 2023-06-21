var mongoose = require("mongoose");

var resourceSchema = mongoose.Schema({
  title: String,
  subtitle: String,
  type: String,
  description: String,
  creationDate: Date,
  registrationDate: Date,
  isPublic: Boolean,
  author: String,
  hashTags: [String],
  resourcePath: String,
});

module.exports = mongoose.model("resource", resourceSchema);
