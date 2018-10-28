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
var request = require("request");

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

app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.use(passport.initialize());

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

  File.find({user:user._id, created: true}, function(err, files) {
    res.send(files);
  });
});

app.post('/data/datatable', function(req, res) {
  File.findById(req.body.id, function(err, file) {
    if (err) {
      return res.json({success: false});
    } else {
      var options = {
        uri: "http://localhost:5000/datatable",
        method: 'POST',
        json: file
      };
      request(options, function (error, response, body) {
        if (error) {
          return res.json({success: false});
        } else {
          var response = body;
          return res.json(response);
        }
      });
    }
  });
});

app.post('/data/save', function(req, res) {
  File.findById(req.body.id, function(err, file) {
    if (err) {
      return res.json({success: false});
    } else {
      var options = {
        uri: "http://localhost:5000/save",
        method: 'POST',
        json: {"file": file, "data": req.body.data}
      };
      request(options, function (error, response, body) {
        if (error) {
          return res.json({success: false});
        } else {
          console.log(body);
          var response = body;
          return res.json(response);
        }
      });
    }
  });
});


app.post('/data/delete', function(req, res) {

  File.findByIdAndRemove(req.body.id, function(err, file) {
    if (err) {
      return res.json({success: false});
    } else {
      var options = {
        uri: "http://localhost:5000/delete",
        method: 'POST',
        json: file
      };
      request(options, function (error, response, body) {
        if (error) {
          return res.json({success: false});
        } else {
          console.log(body);
          var response = body;
          return res.json(response);
        }
      });
    }
  });
});

app.post('/apps/checks', function(req, res) {

  File.findById(req.body.id, function(err, file) {
    if (err) {
      return res.json({success: false});
    } else {
      var options = {
        uri: "http://localhost:5000/check",
        method: 'POST',
        json: file
      };
      request(options, function (error, response, body) {
        if (error) {
          return res.json({success: false});
        } else {
          // console.log(body);
          var response = body;
          return res.json(response);
        }
      });
    }
  });
});

app.post('/apps/dedupe', function(req, res) {

  File.findById(req.body.id, function(err, file) {
    if (err) {
      return res.json({success: false});
    } else {
      var options = {
        uri: "http://localhost:5000/dedupe",
        method: 'POST',
        json: file
      };
      request(options, function (error, response, body) {
        if (error) {
          return res.json({success: false});
        } else {
          // console.log(body);
          var response = body;
          return res.json(response);
        }
      });
    }
  });
});

app.post('/apps/dedupe/mergeCluster', function(req, res) {
  File.findById(req.body.id, function(err, file) {
    if (err) {
      return res.json({success: false});
    } else {
      var options = {
        uri: "http://localhost:5000/dedupe/mergeCluster",
        method: 'POST',
        json: {'file': file, 'group': req.body.group}
      };
      request(options, function (error, response, body) {
        if (error) {
          return res.json({success: false});
        } else {
          // console.log(body);
          var response = body;
          return res.json(response);
        }
      });
    }
  });
});

app.get('/', function(req, res) {
  console.log(path.join(__dirname, 'dist/vc/index.html'));
  res.sendFile(path.join(__dirname, 'dist/vc/index.html'));
});

app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname, 'dist/vc/index.html'));
});

app.listen(process.env.PORT || port, process.env.IP, function() {
  console.log(`API running on localhost:${port}`);
});
