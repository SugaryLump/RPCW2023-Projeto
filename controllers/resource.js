var resourceModel = require("../models/resource");

module.exports.list = () => {
  return resourceModel.aggregate([{
    $lookup: {
      from: 'users',
      localField: 'posterID',
      foreignField: '_id',
      as: 'user'
    },
    $unwind: '$user'
  }
  ]);
};

module.exports.insert = async (resource) => {
  return await resourceModel.create(resource)
};

module.exports.isPoster = async (resourceID, userID) => {
  let {posterID} = await resourceModel.findOne({_id: resourceID})
  return posterID == userID
}