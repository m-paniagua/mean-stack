var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var User = mongoose.model('User');

passport.use(new LocalStrategy({
    usernameField: 'email'
  },
  function(username, password, done) {
    //   search mongoDB for user with supplied email
    User.findOne({ email: username }, function (err, user) {
      if (err) { return done(err); }
    //   if user is found
      if (!user) {
        return done(null, false, {
          message: 'Incorrect username.'
        });
      }
      // if password is inccorect
      if (!user.validPassword(password)) {
        return done(null, false, {
          message: 'Incorrect password.'
        });
      }
    //   return user info
      return done(null, user);
    });
  }
));