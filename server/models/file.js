var mongoose = require("mongoose");
var validate = require('mongoose-validator');

var fileSchema = new mongoose.Schema({
  fileName: {type: String, required: true},
  filePath: {type: String, required: true},
  date: {type: Date, required: true},
  user: {type: mongoose.Schema.Types.ObjectId, ref:"User", required: true}
});

module.exports = mongoose.model("File", fileSchema);
