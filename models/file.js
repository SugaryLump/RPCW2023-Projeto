var mongoose = require("mongoose");

var fileSchema = mongoose.Schema({
  checkSum: String,
  path: String,
});

module.exports = mongoose.model("file", fileSchema);
