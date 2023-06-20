var mongoose = require("mongoose");

var resourceSchema = mongoose.Schema({
  title: String,
  subtitle: String,
  type: String,
  description: String,
  creationDate: Date,
  registrationDate: Date,
  public: Boolean,
  author: String,
  hashTags: [String],
});

module.exports = mongoose.model("resource", resourceSchema);
