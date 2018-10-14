var mongoose = require("mongoose");
var validate = require('mongoose-validator');

var fileSchema = new mongoose.Schema({
  fileName: {type: String, required: true},
  filePath: {type: String, required: true},
  table_ref: {type: String},
  date: {type: Date, required: true},
  rows: {type: String},
  created: {type: Boolean},
  user: {type: mongoose.Schema.Types.ObjectId, ref:"User", required: true}
});

module.exports = mongoose.model("File", fileSchema);
