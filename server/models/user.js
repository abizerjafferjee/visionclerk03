var mongoose = require('mongoose');
var validate = require('mongoose-validator');
var bcrypt   = require('bcrypt-nodejs');

var UserSchema = new mongoose.Schema({
  email: {type: String, required: true, unique: true},
  password: {type: String, required: true}
});

// userSchema.pre('save', function(next) {
//   var user = this;
//   var SALT_FACTOR = 5;
//
//   if (!user.isModified('password')) return next();
//
//   bcrypt.genSalt(SALT_FACTOR, function(err, salt) {
//     if(err) return next(err);
//
//     bcrypt.hash(user.password, salt, null, function(err, hash) {
//       if(err) return next(err);
//       user.password = hash;
//       next();
//     });
//   });
// });

UserSchema.pre('save', function (next) {
    var user = this;
    if (this.isModified('password') || this.isNew) {
        bcrypt.genSalt(10, function (err, salt) {
            if (err) {
                return next(err);
            }
            bcrypt.hash(user.password, salt, null, function (err, hash) {
                if (err) {
                    return next(err);
                }
                user.password = hash;
                next();
            });
        });
    } else {
        return next();
    }
});

// userSchema.methods.comparePassword = function(candidatePassword, cb) {
//   bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
//     if (err) return cb(err);
//     cb(null, isMatch);
//   });
// };

UserSchema.methods.comparePassword = function (passw, cb) {
    bcrypt.compare(passw, this.password, function (err, isMatch) {
        if (err) {
            return cb(err);
        }
        cb(null, isMatch);
    });
};

module.exports = mongoose.model('User', UserSchema);
