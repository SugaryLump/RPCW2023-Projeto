var resourceModel = require("../models/resource");

module.exports.list = () => {
  return resourceModel.find();
};
