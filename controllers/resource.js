var resourceModel = require("../models/resource");

module.exports.list = () => {
  return resourceModel.find();
};

module.exports.insert = (resource, filename) => {
  resourceModel
    .create({
      title: resource.title,
      // pode nao haver
      subtitle: resource.subtitle,
      type: resource.type,
      description: resource.description,
      creationDate: resource.creationDate,
      registrationDate: Date.now(),
      isPublic: resource.visibility == "public",
      author: resource.author,
      hashtags: resource.hashtags,
      filename: filename,
    })
    .then((data) => {
      console.log("Resource created successfully");
      return data;
    })
    .catch((err) => {
      console.log("Error creating resource");
      return err;
    });
};
