var userModel = require('../models/user')

module.exports.isAdmin = async (userID) => {
    let {level} = await userModel.findOne(
        {_id:userID},
        {_id:0, level:1})
    return level
}

module.exports.get = async (userID) => {
    let user = await userModel.findOne({_id:userID})
    return user
}

module.exports.updateLastActiveAt  =  async (user) => {
    await userModel.findOneAndUpdate({_id: user._id}, {$set: { lastActiveAt: Date.now()} }) ;
}