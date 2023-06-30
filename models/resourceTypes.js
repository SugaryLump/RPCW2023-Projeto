var mongoose = require("mongoose");

var resourceTypeSchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model("resourceType", resourceTypeSchema);
