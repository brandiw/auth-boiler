// Require express
var express = require('express');
var passport = require('../config/passportConfig');

// Include the models
var db = require('../models');

// Declare a new router
var router = express.Router();

// Define routes
router.get('/login', function(req, res){
  res.render('auth/login');
});

router.post('/login', passport.authenticate('local', {
  successRedirect: '/profile',
  successFlash: 'Yay, login successful! :D',
  failureRedirect: '/auth/login',
  failureFlash: 'Invalid Credentials'
}));

router.get('/signup', function(req, res){
  res.render('auth/signup');
});

router.post('/signup', function(req, res){
  console.log(req.body);
  req.body.admin = false;
  db.user.findOrCreate({
    where: { email: req.body.email },
    defaults: req.body
  }).spread(function(user, wasCreated){
    if(wasCreated){ // This is expected behavior!
      // Automatically log the user in!
      passport.authenticate('local', {
        successRedirect: '/profile',
        successFlash: 'Successfully logged in!',
        failureRedirect: '/',
        failureFlash: 'Oh Noes?'
      })(req, res);
    }
    else { // User messed up, they already have a login
      req.flash('error', 'Please login');
      res.redirect('/auth/login');
    }
  }).catch(function(err){
    req.flash('error', err.message);
    res.redirect('/auth/signup');
  });
});

router.get('/logout', function(req, res){
  req.logout(); // logs out of session
  req.flash('success', 'Successfully logged out!');
  res.redirect('/');
});

/ * OAUTH ROUTES */
// This calls the passport-facebook strategy (located in passport config)
router.get('/facebook', passport.authenticate('facebook', {
  scope: ['public_profile', 'email']
}));

// Handle the response/callback from facebook
router.get('/callback/facebook', passport.authenticate('facebook', {
  successRedirect: '/profile',
  successFlash: 'facebook login successful',
  failureRedirect: '/auth/login',
  failureFlash: 'Oops, FB fail'
}));

module.exports = router;





