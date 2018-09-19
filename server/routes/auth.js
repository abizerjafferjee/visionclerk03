var express = require('express');
var router = express.Router();
var passport = require('passport');
var async = require('async');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');
// var nodemailer = require('nodemailer');
var config = require('../config/database');
var User = require('../models/user');

// register user
// router.post('/register', function(req, res) {
//   var user = new User({
//     email: req.body.email,
//     username: req.body.username,
//     password: req.body.password,
//     role: 'user'
//   });
//
//   user.save(function(err) {
//     req.logIn(user, function(err) {
//       if(err) {
//         return res.status(500).json({
//           err: err
//         });
//       }
//
//       res.status(200).json({
//         status: 'Registration successful'
//       });
//     });
//   });
// });

router.post('/signup', function(req, res) {
  if (!req.body.email || !req.body.password) {
    res.json({success: false, msg: 'Please pass username and password.'});
  } else {
    var newUser = new User({
      email: req.body.email,
      password: req.body.password
    });
    // save the user
    newUser.save(function(err) {
      if (err) {
        return res.json({success: false, msg: 'Username already exists.'});
      }
      res.json({success: true, msg: 'Successful created new user.'});
    });
  }
});

// login user
// router.post('/login', function(req, res, next) {
//   passport.authenticate('local', function(err, user, info) {
//     if (err) {
//       return next(err);
//     }
//     if (!user) {
//       return res.status(401).json({
//         err: info
//       });
//     }
//     req.logIn(user, function(err) {
//       if (err) {
//         return res.status(500).json({
//           err: 'Could not log in user'
//         });
//       }
//       res.status(200).json({
//         user: user,
//         status: 'Login successful!'
//       });
//     });
//   })(req, res, next);
// });

router.post('/signin', function(req, res) {
  User.findOne({
    email: req.body.email
  }, function(err, user) {
    if (err) throw err;

    if (!user) {
      res.status(401).send({success: false, msg: 'Authentication failed. User not found.'});
    } else {

      // check if password matches
      user.comparePassword(req.body.password, function (err, isMatch) {
        if (isMatch && !err) {
          // if user is found and password is right create a token
          var token = jwt.sign(user.toJSON(), config.secret);
          // return the information including token as JSON
          res.json({success: true, token: 'JWT ' + token});
        } else {
          res.status(401).send({success: false, msg: 'Authentication failed. Wrong password.'});
        }
      });
    }
  });
});

getToken = function (headers) {
  if (headers && headers.authorization) {
    var parted = headers.authorization.split(' ');
    if (parted.length === 2) {
      return parted[1];
    } else {
      return null;
    }
  } else {
    return null;
  }
};

// logout user
// router.get('/logout', function(req, res) {
//   req.logout();
//   res.status(200).json({
//     status: 'Bye!'
//   });
// });
//
// // get user login status
// router.get('/status', function(req, res) {
//   if (req.isAuthenticated()) {
//     return res.status(200).json({
//       status: true
//     });
//   } else {
//     res.status(200).json({
//       status: false
//     });
//   }
// });

// send user password reset link
// router.post('/forgot', function(req ,res, next) {
//   async.waterfall([
//     function(done) {
//       crypto.randomBytes(20, function(err, buf) {
//         var token = buf.toString('hex');
//         done(err, token);
//       });
//     },
//     function(token, done) {
//       User.findOne({email: req.body.email}, function(err, user) {
//         if(!user) {
//           return res.status(500).json({
//             status: false
//           });
//         }
//
//         user.resetPasswordToken = token;
//         user.resetPasswordExpires = Date.now() + 3600000;
//
//         user.save(function(err) {
//           done(err, token, user);
//         });
//       });
//     },
//     function(token, user, done) {
//       var smtpTransport = nodemailer.createTransport({
//         service: 'gmail',
//         secure: false,
//         port: 25,
//         auth: {
//           user: 'legalxstartup@gmail.com',
//           pass: 'legalx1234'
//         }
//       });
//       var mailOptions = {
//         to: user.email,
//         from: 'legalxstartup@gmail.com',
//         subject: 'Node.js Password Reset',
//         text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
//           'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
//           'http://' + req.headers.host + '/#/reset/' + token + '\n\n' +
//           'If you did not request this, please ignore this email and your password will remain unchanged.\n'
//       };
//       smtpTransport.sendMail(mailOptions, function(err) {
//         if (err) {
//           res.status(500).json({
//             status: false
//           });
//         } else {
//           res.status(200).json({
//             status: true
//           });
//         }
//       });
//     }
//   ], function(err) {
//     if(err) {
//       res.status(500).json({
//         status: false
//       });
//       return next(err);
//     }
//   });
// });


// router.get('/reset/:token', function(req, res) {
//   User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()}},
//   function(err, user) {
//     if (!user) {
//       res.status(500).json({
//         status: false
//       });
//     } else {
//       res.status(200).json({
//         status: true
//       });
//     }
//   });
// });
//
// router.post('/reset/:token', function(req, res) {
//   async.waterfall([
//     function(done) {
//       User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()}},
//       function(err, user) {
//         if (!user) {
//           res.status(500).json({
//             status: false
//           });
//         }
//
//         user.password = req.body.password;
//         user.resetPasswordToken = undefined;
//         user.resetPasswordExpires = undefined;
//
//         user.save(function(err) {
//           req.logIn(user, function(err) {
//             done(err, user);
//           });
//         });
//       });
//     }, function(user, done) {
//       var smtpTransport = nodemailer.createTransport({
//         service: 'gmail',
//         secure: false,
//         port: 25,
//         auth: {
//           user: 'legalxstartup@gmail.com',
//           pass: 'legalx1234'
//         }
//       });
//       var mailOptions = {
//         to: user.email,
//         from: 'legalxstartup@gmail.com',
//         subject: 'Node.js Password Reset Confirmation',
//         text: 'Hello,\n\n' +
//           'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
//       };
//       smtpTransport.sendMail(mailOptions, function(err) {
//         if (err) {
//           res.status(500).json({
//             status: false
//           });
//         } else {
//           res.status(200).json({
//             status: true
//           });
//         }
//       });
//     }
//   ], function(err) {
//     if(err) {
//       res.status(500).json({
//         status: false
//       });
//       return next(err);
//     }
//   });
// });


module.exports = router;
