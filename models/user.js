var mongoose = require("mongoose"),
  Schema = mongoose.Schema,
  passportLocalMongoose = require("passport-local-mongoose");

var User = new Schema({
  email: {
    unique: true,
    type: String,
    match:
      /(?:[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*|\"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*\")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/,
  },
  name: {
    type: String,
    match: /[^\d\W]{1,30}/,
  },
  affiliation: {
    type: String,
  },
  lastActiveAt: {
    type: Date,
  },
  registerDate: {
    type: Date,
    default: Date.now,
  },
  level: {
    type: String,
    default: "user",
  },
  active: {
    type: Boolean,
    default: true,
  },
});

User.plugin(passportLocalMongoose, { usernameField: "email" });

module.exports = mongoose.model("user", User);
