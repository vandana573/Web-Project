const passport = require("passport");
const localStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
// var Superadmin = mongoose.model('superAdmin');
const UserModel = mongoose.model("User");

passport.use(
  new localStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true,
    },
    (req, username, password, done) => {
      UserModel.findOne(
        {
          email: username,
          status: 1,
        },
        (err, user) => {
          if (user) {
            if (user.status == 0) {
              return done(null, false, {
                message: "Your account not activate yet.",
                status: false,
              });
            } else if (!user) {
              return done(null, false, {
                message: "Email address not registered.",
                status: false,
              });
            } else if (!user.verifyPassword(password)) {
              return done(null, false, {
                message: "Wrong password.",
                status: false,
              });
            } else {
              return done(null, user);
            }
          } else {
            return done(null, false, {
              message: "Email address not registered.",
              status: false,
            });
          }
        }
      );
    }
  )
);
