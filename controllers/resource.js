var resourceModel = require("../models/resource");
var userController = require("./user")
var resourceTypeModel = require("../models/resourceTypes");
var mongoose = require('mongoose');
const resourceTypes = require("../models/resourceTypes");

module.exports.list = async (viewerUser, sortObj = null, filterObj = null) => {
  if (!sortObj) {
    sortObj = { "registrationDate": 1 }
  }
  if (!filterObj) {
    filterObj = {
      publisher: "",
      minDate: new Date(-8640000000000000),
      maxDate: new Date(8640000000000000),
      title: "",
      minRating: 0,
      maxRating: 5,
      tags: []
    }
  }

  var resources = await resourceModel.aggregate([
    {
      $addFields: {
        "posterOID": { "$toObjectId": "$posterID" },
      }
    },
    {
      $lookup: {
        localField: "type",
        foreignField: "_id",
        from: "resourcetypes",
        as: "type"
      }
    },
    { $unwind: "$type" },
    { $set: { type: "$type.name" } },
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
    {
      $lookup: {
        from: "users",
        localField: "posterOID",
        foreignField: "_id",
        as: "publisher",
      },
    },
    { $unwind: "$publisher" },
    { $sort: sortObj }
  ]);

  resources = await Promise.all(resources.map(async (r) => {
    r.comments = await Promise.all(r.comments.map(async (comment) => {
      var user = await userController.get(comment.posterID)
      return {
        ...comment,
        poster: user
      }
    }))
    return r
  }))

  resources = resources.filter((r) => {
    vis_filter = r.isPublic ||
      (viewerUser &&
        (viewerUser.level == "admin" || viewerUser._id == r.posterID))

    rating_filter = r.rating >= filterObj.minRating && r.rating <= filterObj.maxRating
    tag_filter = filterObj.tags.every(tag => { return r.hashTags.includes(tag) })
    date_filter = r.registrationDate >= filterObj.minDate && r.registrationDate <= filterObj.maxDate
    pub_filter = r.publisher.name.includes(filterObj.publisher)
    title_filter = r.title.includes(filterObj.title)
    return vis_filter && rating_filter && tag_filter && date_filter && pub_filter && title_filter
  })

  return resources
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
    { _id: resourceID },
    { $push: { comments: comment } }
  )
}

module.exports.get = async (resourceID) => {
  let resource = await resourceModel.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(resourceID) } },
    {
      $lookup: {
        localField: "type",
        foreignField: "_id",
        from: "resourcetypes",
        as: "type"
      }
    },
    { $unwind: "$type" },
    { $addFields: { typeID: "$type._id" } },
    { $set: { type: "$type.name" } },
    {
      $addFields: {
        "posterOID": { "$toObjectId": "$posterID" },
      }
    },
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
    {
      $lookup: {
        from: "users",
        localField: "posterOID",
        foreignField: "_id",
        as: "publisher",
      },
    },
    { $unwind: "$publisher" },
  ])


  if (resource.length == 0) {
    throw new Error("Resource not found")
  }

  resource[0].comments = await Promise.all(resource[0].comments.map(async (comment) => {
    var user = await userController.get(comment.posterID)
    return {
      ...comment,
      poster: user
    }
  }))

  return resource[0]
}

module.exports.remove = async (resourceID) => {
  const status = await resourceModel.deleteOne({ _id: resourceID })
  return status
}

module.exports.removeComment = async (resourceID, posterID) => {
  const status = await resourceModel.updateMany(
    {
      $pull: {
        "comments": { "posterID": posterID }
      }
    }
  )

  return status
}

module.exports.toggleVisibility = async (resourceID) => {
  const resource = await resourceModel.findById(resourceID)
  resource.isPublic = !resource.isPublic
  return await resource.save()
}

module.exports.update = async (resource) => {
  return await resourceModel.findOneAndUpdate(
    { _id: resource._id },
    { $set: resource },
    { new: true })
}

module.exports.listTypes = async () => {
  return await resourceTypes.find({});
}

module.exports.addType = async (typeName) => {
  return await resourceTypes.create({ name: typeName })
}

module.exports.renameType = async (typeId, name) => {
  return await resourceTypes.findOneAndUpdate({ _id: typeId }, { $set: { name } })
}