// Use env variables
require('dotenv').config();

// Require needed modules
var passport = require('passport');
var passportFacebookStrategy = require('passport-facebook').Strategy;
var passportLocalStrategy = require('passport-local').Strategy;

// Declare variables
var db = require('../models');

// Provide serialize/deserialize functions so we can use session
passport.serializeUser(function(user, callback){
  callback(null, user.id);
});

passport.deserializeUser(function(id, callback){
  db.user.findById(id).then(function(user){
    callback(null, user);
  }).catch(function(err){
    callback(err, null);
  });
});

// Do the actual logging in part!
passport.use(new passportLocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, function(email, password, callback){
  db.user.findOne({
    where: { email: email }
  }).then(function(foundUser){
    if(!foundUser || !foundUser.isValidPassword(password)){
      callback(null, null);
    }
    else {
      callback(null, foundUser);
    }
  }).catch(function(err){
    callback(err, null);
  });
}));

passport.use(new passportFacebookStrategy({
  clientID: process.env.FB_APP_ID,
  clientSecret: process.env.FB_APP_SECRET,
  callbackURL: process.env.BASE_URL + '/auth/callback/facebook',
  profileFields: ['id', 'email', 'displayName'],
  enableProof: true
}, function(accessToken, refreshToken, profile, done){
  // See if we have an email address we can use for identifying the user
  var facebookEmail = profile.emails ? profile.emails[0].value : null;

  // See if the email exists in the users table
  db.user.findOne({
    where: { email: facebookEmail }
  }).then(function(existingUser){
    if(existingUser && facebookEmail){
      // This user is a returning user - update facebookId and token
      existingUser.updateAttributes({
        facebookId: profile.id,
        facebookToken: accessToken
      }).then(function(updatedUser){
        done(null, updatedUser);
      }).catch(done);
    }
    else {
      // The person is a new user, so create an entry for them
      // Parse the user's name
      var usernameArr = profile.displayName.split(' ');

      db.user.findOrCreate({
        where: { facebookId: profile.id },
        defaults: {
          facebookToken: accessToken,
          email: facebookEmail,
          firstname: usernameArr[0],
          lastname: usernameArr[usernameArr.length - 1],
          admin: false,
          image: 'https://png.icons8.com/ios/1600/person-female-filled.png',
          dob: profile.birthday
        }
      }).spread(function(user, wasCreated){
        if(wasCreated){
          // This was expected, yay
          done(null, user);
        }
        else {
          // This user was not new after all. This could happen if the user changed their
          // email on Facebook since they last logged in with you
          user.facebookToken = accessToken;
          user.email = facebookEmail;
          user.save().then(function(updatedUser){
            done(null, updatedUser)
          }).catch(done);
        }
      });
    }
  })

}));

module.exports = passport;

















