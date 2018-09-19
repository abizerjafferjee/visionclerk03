var fs = require('fs');
var jwt = require('jsonwebtoken');
var config = require('../config/database');
var File = require('../models/file');
const IncomingForm = require('formidable').IncomingForm;

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
    // console.log(field);
    // console.log(file);

    // var fileName = Date.now() + '_' + file.name;
    if (!file.name.match(/\.(csv)$/)) {
      res.json({success: false, msg: "File type must be csv"});
    } else {

      // write file to directory
      var dataBuffer = fs.readFileSync(file.path);
      var relPath = './test_data/' + file.name;
      fs.writeFile(relPath, dataBuffer, function(err) {
        if(err) {
          return console.log(err);
        }
        console.log("The file was saved!");
      });

      // write file details to mongo
      var newFile = new File({
        fileName: file.name,
        filePath: relPath,
        date: Date.now(),
        user: user._id
      });

      newFile.save(function(err, file) {
        if (err) {
          console.log(err);
        } else {
          console.log(file);
        }
      });

      res.json({success: true, msg: "Upload Successful"});

    }
      // Do something with the file
      // e.g. save it to the database
      // you can access it using file.path
  });

  // form.on('end', () => {
  //     res.json({success: true, msg: "Upload Successful"});
  // });

  form.parse(req);

};
