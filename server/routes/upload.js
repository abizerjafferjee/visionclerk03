var fs = require('fs');
var jwt = require('jsonwebtoken');
const IncomingForm = require('formidable').IncomingForm;
var config = require('../config/database');
var File = require('../models/file');
var client = require('../routes/sql/connect');
var writeData  = require('../routes/sql/writedata');

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


module.exports = function upload(req, res) {

  var token = getToken(req.headers);
  var user;
  if (token) {
    var user = jwt.verify(token, config.secret);
  }

  var form = new IncomingForm();

  form.on('file', (field, file) => {
    if (!file.name.match(/\.(csv)$/)) {
      return res.json({success: false, msg: "File type must be csv."});
    } else {

      var relPath = './test_data/' + Date.now() + '_' + user._id + '_' + file.name;

      var filter_name = file.name.replace(/-/g, '').replace(/\./g, '');
      var table_ref = 'd' + Date.now() + user._id + filter_name;
      table_ref = table_ref.substring(0,63);

      var dataBuffer = fs.readFileSync(file.path);
      fs.writeFile(relPath, dataBuffer, function(err) {
        if(err) {
          return res.json({success: false, msg: "File could not be written. Please make sure file does not contain encoded characters."});;
        } else {

          var newFile = new File({
            fileName: file.name,
            filePath: relPath,
            table_ref: table_ref,
            date: Date.now(),
            created: false,
            user: user._id
          });

          newFile.save(function(err, file) {
            if (err) {
              res.json({success: false, msg: "File could not be uploaded due to document database error. Please try again."});
            } else {
              writeData(file, function(response) {
                if (response.success) {
                  File.findById(file._id, function(err, originalFile) {
                    if (err) {
                      res.json({success: false, msg: "File could not be uploaded due to document database error. Please try again."});
                    } else {
                      originalFile.rows = response.rows;
                      originalFile.created = true;
                      originalFile.save();
                      res.json(response);
                    }
                  });
                } else {
                  res.json(response);
                }
              });
            }
          });
        }

      });
    }
  });

  form.parse(req);
};
