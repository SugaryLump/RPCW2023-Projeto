var createError = require("http-errors");
var express = require("express");

var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

const { v4: uuidv4 } = require("uuid");
var session = require("express-session");
var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;

var mongoose = require("mongoose");
var mongoDB = process.env.MONGODB_URL || "mongodb://localhost:27017/learnvault";
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
var db = mongoose.connection;
mongoose.set("setDefaultsOnInsert", false);
db.on("error", function () {
  console.log("MongoDB connection error");
});
db.on("open", function () {
  console.log("MongoDB connection successfully established");
});

var indexRouter = require("./routes/index");
var loginRouter = require("./routes/login");
var registerRouter = require("./routes/register");
var resourceRouter = require("./routes/resource");
var profileRouter = require("./routes/profile");
var auth = require("./shared/auth")

var app = express();

app.use(
  session({
    genid: (req) => {
      return uuidv4();
    },
    secret: "learnvault2023",
    resave: false,
    saveUninitialized: true,
  })
);

// passport config

var User = require("./models/user");
passport.use(
  new LocalStrategy({ usernameField: "email" }, User.authenticate())
);
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(passport.initialize());
app.use(passport.session());

app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(auth.getUser)
//app.use(auth.getResource)

app.use("/register", registerRouter);
app.use("/login", loginRouter);
app.use("/resources", resourceRouter);
app.use("/profile", profileRouter);
app.use("/", indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
