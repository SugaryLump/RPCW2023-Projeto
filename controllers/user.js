var userModel = require("../models/user");
var mongoose = require("mongoose");

module.exports.isAdmin = async (userID) => {
  let { level } = await userModel.findOne(
    { _id: userID },
    { _id: 0, level: 1 }
  );
  return level == "admin";
};

module.exports.get = async (userID) => {
  let user = await userModel.findOne({ _id: userID });
  return user;
};

module.exports.updateLastActiveAt = async (user) => {
  await userModel.findOneAndUpdate(
    { _id: user._id },
    { $set: { lastActiveAt: Date.now() } }
  );
};
module.exports.updateLastActiveAt = async (user) => {
  return await userModel.findOneAndUpdate(
    { _id: user._id },
    { $set: { lastActiveAt: Date.now() } }
  );
};

module.exports.getUser = async (userID) => {
  return await userModel.findOne({ _id: userID }, { notifications: 0 });
};

module.exports.getAll = async (params) => {
  if (params) {
    let { page, limit } = params;
    return await userModel.find({}, {_id: 1, name: 1, email: 1, affiliation: 1, level: 1}).skip(page * limit).limit(limit);
  } else {
    return await userModel.find({}, {_id: 1, name: 1, email: 1, affiliation: 1, level: 1});
  }
}

module.exports.sendNotification = async (notification, user) => {
  console.log("________ sending notification");
  if (user != null) {
    return await userModel.findOneAndUpdate(user, {
      $push: { notifications: notification },
    });
  } else {
    console.log("Sending notification to all users");
    return await userModel.updateMany({
      $push: { notifications: notification },
    });
  }
};

module.exports.getUnreadNotifications = async (userID) => {
  let notifications = await userModel.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(userID) } },
    { $unwind: "$notifications" },
    { $sort: { "notifications.createdAt": -1 } },
    { $replaceRoot: { newRoot: "$notifications" } },
    { $match: { read: false } },
  ]);

  return notifications;
};

module.exports.clearNotifications = async (userID) => {
  // TODO: Mark read: true instead
  await userModel.findOneAndUpdate(
    { _id: userID },
    { $set: { notifications: [] } }
  );
};
