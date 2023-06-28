var userModel = require("../models/user");

module.exports.isAdmin = async (userID) => {
  let { level } = await userModel
    .findOne({ _id: userID }, { _id: 0, level: 1 })
    .catch((err) => {
      console.log(err);
      return res.status(500).send();
    });
  return level;
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
  await userModel
    .findOneAndUpdate({ _id: user._id }, { $set: { lastActiveAt: Date.now() } })
    .catch((err) => {
      console.log(err);
      return res.status(500).send();
    });
};

module.exports.getUser = async (userID) => {
  await userModel.findOne({ _id: userID }, function (err, user) {
    if (err) {
      console.log(err);
      return res.status(500).send();
    }
    return user;
  });
};
