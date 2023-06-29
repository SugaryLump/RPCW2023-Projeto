var resourceModel = require("../models/resource");
var userController = require("./user")
var userModel = require("../models/user")
var mongoose = require('mongoose')

module.exports.list = () => {
  return resourceModel.aggregate([
    { $addFields: {"posterOID": {"$toObjectId": "$posterID"}}},
    {
      $lookup: {
        from: "users",
        localField: "posterOID",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $unwind: "$user",
    },
  ]);
};

module.exports.insert = async (resource) => {
  return await resourceModel.create(resource);
};

module.exports.isPoster = async (resourceID, userID) => {
  let { posterID } = await resourceModel.findOne({ _id: resourceID });
  return posterID == userID;
};

module.exports.addComment = async (resourceID, comment) => {
  return await resourceModel.findOneAndUpdate(
    {_id: resourceID},
    {$push: {comments: comment}}
  )
}

module.exports.get = async (resourceID) => {
  let resource = await resourceModel.aggregate([
    { $match: {_id: new mongoose.Types.ObjectId(resourceID) }},
    { $addFields: {
      "posterOID": {"$toObjectId": "$posterID"},
    }},
    {
      $set: {
        rating: {
          $avg: {
            $map: {
              input: {
                $filter: {
                  input: "$comments",
                  as: "comment",
                  cond: {
                    $and: [
                      { $gt: ["$$comment.rating", 0] },
                      { $gt: ["$$comment.rating", null] } // Exclude null ratings
                    ]
                  }
                }
              },
              as: "comment",
              in: "$$comment.rating"
            }
          }
        }
      }
    },
    { $lookup: {
        from: "users",
        localField: "posterOID",
        foreignField: "_id",
        as: "publisher",
      },
    },
    { $unwind: "$publisher"},
  ])

  resource[0].comments = await Promise.all(resource[0].comments.map(async (comment) => {
    var user = await userController.get(comment.posterID)
    return {
      ...comment,
      poster: user
    }
  }))
  return resource[0]
}