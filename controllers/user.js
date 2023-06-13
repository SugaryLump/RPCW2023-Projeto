var userModel = require('../models/user')

module.exports.isAdmin = async (userID) => {
    let {level} = await userModel.findOne(
        {_id:userID},
        {_id:0, level:1})
    return level
}