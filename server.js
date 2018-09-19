var express = require('express');
const app = express();
const bodyParser = require('body-parser');
const http = require('http');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
const port = process.env.PORT || '3000';
var mongoose = require('mongoose');
var passport = require('passport');
var localStrategy = require('passport-local' ).Strategy;
var bcrypt = require('bcrypt-nodejs');
var flash = require('express-flash');
const cors = require('cors');
var jwt = require('jsonwebtoken');

// const api = require('./server/routes/api');
var config = require('./server/config/database');
var auth = require('./server/routes/auth')
var upload = require('./server/routes/upload')
var File = require('./server/models/file');

mongoose.Promise = require('bluebird');
mongoose.connect(config.database, { promiseLibrary: require('bluebird') })
  .then(() =>  console.log('mongo connection succesful'))
  .catch((err) => console.error(err));

app.set('port', port);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({'extended':'false'}));
app.use(express.static(path.join(__dirname, 'dist')));
app.use('/', express.static(path.join(__dirname, 'dist')));
// app.use(require('express-session')({
//     secret: 'keyboard cat',
//     resave: false,
//     saveUninitialized: false
// }));
// app.use(flash());

app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.use(passport.initialize());
// app.use(passport.session());

passport.use(new localStrategy(function(username, password, done) {
  User.findOne({username: username}, function(err, user) {
    if (err) return done(err);
    if (!user) return done(null, false, {message: 'Incorrect username.'});
    user.comparePassword(password, function(err, isMatch) {
      if (isMatch) {
        return done(null, user);
      } else {
        return done(null, false, {message: 'Incorrect password.'});
      }
    });
  });
}));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

var corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));


app.use('/auth', auth);
app.use('/upload',  upload);

app.get('/test', function(req, res) {
  res.json({data:"Express is working"});
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


app.post('/upload', passport.authenticate('jwt', { session: false}), upload)

app.get('/data/files', function(req, res) {
  var token = getToken(req.headers);
  var user;
  if (token) {
    var user = jwt.verify(token, config.secret);
  }

  File.find({user:user._id}, function(err, files) {
    console.log(files);
    res.send(files);
  });
});


app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'dist/vc/index.html'));
});

app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname, 'dist/vc/index.html'));
});

app.listen(process.env.PORT || port, process.env.IP, function() {
  console.log(`API running on localhost:${port}`);
});
