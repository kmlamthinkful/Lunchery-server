'use strict';
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const {User} = require('../models')
const {JWT_SECRET} = require('../config');


const localStrategy = new LocalStrategy((username, password, callback) => {
    let user;
    User.findOne({username: username})
      .then(_user => {
        user = _user;
        if (!user) {
        
          return Promise.reject({
            reason: 'LoginError',
            message: 'Incorrect username or password'
          });
        }
        return user.validatePassword(password);
      })
      .then(isValid => {
        if (!isValid){
          return Promise.reject({
            reason: 'LoginError',
            message: 'Incorrect username or password'
          });
        }
        return callback(null, user);
      })
      .catch(err => {
        if (err.reason === 'LoginError') {
          return callback(null, false, err);
        }
        return callback(err, false);
      });
  });
  
  const jwtStrategy = new JwtStrategy(
    {
      secretOrKey: JWT_SECRET,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      algorithms: ['HS256']
    },
    (payload, done) => {
      done(null, payload.user);
    }
  );

  const localAuth = passport.authenticate('local', {session: false});
  const jwtAuth = passport.authenticate('jwt', {session: false});

  module.exports = {localStrategy, jwtStrategy, jwtAuth, localAuth};