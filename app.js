// Require modules
require("dotenv").config();
const ejs = require("ejs");
const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const passport = require("passport");
const findOrCreate = require("mongoose-findorcreate");
const GoogleStrategy = require("passport-google-oauth2").Strategy;
const passportLocalMongoose = require("passport-local-mongoose");

// Initialize App
const app = express();
app.set("view engine", "ejs");
app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(session({
  secret: "nopainnogain",
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());


// Connect MongoDB
const db = "fitnessforceDB";
const password = "Test123";
const uri = "mongodb+srv://admin-yash:" + password + "@cluster0.uwmel.mongodb.net";
mongoose.connect(uri + "/" + db);


// Initialize the Document Schema
const usersSchema = mongoose.Schema({
  email: String,
  password: String,
  googleId: String
});

usersSchema.plugin(passportLocalMongoose);
usersSchema.plugin(findOrCreate);

const User = new mongoose.model("User", usersSchema);

passport.use(User.createStrategy());

passport.serializeUser((user, cb) => {
  process.nextTick(() => {
    cb(null, {id: user.id, username: user.username});
  });
});

passport.deserializeUser((user, cb) => {
  process.nextTick(() => {
    return cb(null, user);
  });
});

passport.use(new GoogleStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/google/home",
  passReqToCallback: true
},
(request, accessToken, refreshToken, profile, done) => {
  User.findOrCreate({ googleId: profile.id }, (err, user) => {
    return done(err, user);
  });
}));



////////////////////////////////Routes//////////////////////////////////////


app.get("auth/google",
  passport.authenticate("google", {scope: ["profile"]})
);


app.get("auth/google/home",
  passport.authenticate("google", {
    successRedirect: "/home",
    failureRedirect: "/login"
  })
);


app.route("/")
  .get((req, res) => {
    res.render("home");
  });



// PORT for server to listen to
app.listen(process.env.PORT || 3000, () => {
  console.log("Server running on http://localhost:3000/");
});