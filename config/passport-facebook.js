const express = require('express');
const passport = require('passport');
const FacebookStrategy  = require('passport-facebook').Strategy;
const session  = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const config = require('./config-facebook');

// Passport session setup.
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

// Sử dụng FacebookStrategy cùng Passport.
passport.use('local.login-facebook', new FacebookStrategy({
    clientID: config.facebook_api_key,
    clientSecret: config.facebook_api_secret,
    callbackURL: config.callback_url
  },
  function(accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
      console.log(accessToken, refreshToken, profile, done);
      return done(null, profile);
    });
  }
));
