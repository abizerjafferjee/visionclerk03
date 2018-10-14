var fs = require('fs');
var csv = require('fast-csv');
var request = require('request');

var client = require('./connect');

var dataModel = [{name: "invoice_number", required: true, type: "string"},
{name: "invoice_net_amount", required: true, type: "number"},
{name: "invoice_gross_amount", required: false, type: "number"},
{name: "invoice_shipping_cost", required: false, type: "number"},
{name: "invoice_insurance_charge", required: false, type: "number"},
{name: "invoice_discounts", required: false, type: "number"},
{name: "invoice_tax", required: false, type: "number"},
{name: "invoice_other_charge", required: false, type: "number"},
{name: "vendor_number", required: false, type: "string"},
{name: "vendor_invoice_number", required: false, type: "string"},
{name: "po_flag", required: true, type: "string"},
{name: "po_number", required: true, type: "string"},
{name: "match_type", required: true, type: "string"},
{name: "invoice_date", required: false, type: "date"},
{name: "invoice_due_date", required: false, type: "date"},
{name: "invoice_paid_date", required: false, type: "date"},
{name: "vendor_payment_terms", required: false, type: "string"},
{name: "invoice_status", required: false, type: "string"},
{name: "invoice_type", required: false, type: "string"},
{name: "gl_account", required: false, type: "string"},
{name: "company", required: true, type: "string"},
{name: "business_unit", required: false, type: "string"},
{name: "currency_code", required: true, type: "string"},
{name: "source", required: true, type: "string"}
];

var url = "http://localhost:5000/upload"

module.exports = function upload(file, callback) {

  var options = {
    uri: url,
    method: 'POST',
    json: file
  };
  request(options, function (error, response, body) {

    if (error) {
      var response = {success: false, msg: "File could not be uploaded due to server error. Please try again."};
      return callback(response);
    } else {
      var response = body;
      return callback(response);
    }
  });


  // query = "create table " + table_ref +
  // " (id serial primary key, invoice_number varchar(50), invoice_net_amount real, invoice_gross_amount real, invoice_shipping_cost real, invoice_insurance_charge real, invoice_discounts real, invoice_tax real, invoice_other_charge real, vendor_number varchar(50), vendor_invoice_number varchar(50), po_flag varchar(50), po_number varchar(50), match_type varchar(50), invoice_date date, invoice_due_date date, invoice_paid_date date, vendor_payment_terms varchar(500), invoice_status varchar(50), invoice_type varchar(50), gl_account varchar(50), company varchar(50), business_unit varchar(50), currency_code varchar(50), source varchar(50));"
  //
  // client.query(query, function(error, results, fields) {
  //   if (error){
  //     console.log(error);
  //     //how to fix this error?
  //   } else {
  //
  //     console.log("table created");
  //
  //     var rowCount = 0;
  //
  //     var stream = fs.createReadStream(filePath);
  //     var csvStream = csv.fromStream(stream, {headers: true, ignoreEmpty: true})
  //
  //     .on("data", function(data) {
  //       csvStream.pause();
  //
  //       var colNames = Object.keys(data);
  //       var query_cols = " (";
  //       var query_vals = " VALUES (";
  //       var column_number = 1;
  //       var values = [];
  //
  //       for (var i=0; i < dataModel.length; i++) {
  //         var column = dataModel[i].name;
  //         var required = dataModel[i].required;
  //         var type = dataModel[i].type;
  //         var column_found = false;
  //
  //         for (var j=0; j < colNames.length; j++) {
  //           if (colNames[j] == column) {
  //             column_found = true;
  //             value = data[column];
  //
  //             // handle undefined field
  //             if ((value == undefined || value == null) && required == true) {
  //               column_found = false;
  //             } else if ((value == undefined || value == null) && required == false) {
  //               value = null;
  //             }
  //
  //             // handle data type conversion
  //             if (column_found == true && value != null) {
  //               if (type == "string") {
  //                 try {
  //                   value = String(value);
  //                   if (value == "" && required == true) {
  //                     var response = {success: false, error: {type: "data-type", row: rowCount, msg: column + " is required but has no value"}};
  //                     return callback(response);
  //                   } else if (value == "" && required == false) {
  //                     value = null;
  //                   }
  //                 } catch (err) {
  //                   var response = {success: false, error: {type: "data-type", row: rowCount, msg: column + " does not have a string data type"}};
  //                   return callback(response);
  //                 }
  //               } else if (type == "number") {
  //                 try {
  //                   value = parseFloat(value);
  //                   if (typeof(value) != "number" && required == true) {
  //                     var response = {success: false, error: {type: "data-type", row: rowCount, msg: column + " is a required column and could not be converted to a real number"}};
  //                     return callback(response);
  //                   } else if (value == NaN && required == false) {
  //                     value = null;
  //                   }
  //                 } catch (err) {
  //                   var response = {success: false, error: {type: "data-type", row: rowCount, msg: column + " has an error on row " + rowCount}};
  //                   return callback(response);
  //                 }
  //               } else if (type = "date") {
  //                 try {
  //                   check_date = new Date(value);
  //                 } catch (err) {
  //                   var response = {success: false, error: {type: "data-type", row: rowCount, msg: column + " does not have a date data type"}};
  //                   return callback(response);
  //                 }
  //               }
  //             }
  //           }
  //         }
  //
  //         // send error if column not found
  //         if (column_found == false && required == true) {
  //           var response = {success: false, error: {type: "missing-required", row: rowCount, msg: "Could not find a required column. Please check the schema."}};
  //           return callback(response);
  //         }
  //
  //         if (column_number == dataModel.length) {
  //           query_cols += column;
  //           query_vals += "$" + String(column_number);
  //         } else {
  //           query_cols += column + ", ";
  //           query_vals += "$" + String(column_number) + ", ";
  //         }
  //
  //         values.push(value);
  //         column_number += 1;
  //
  //       }
  //
  //       var query = "INSERT INTO " + table_ref + query_cols + ")" + query_vals + ");";
  //       client.query(query, values, function(error, results, fields) {
  //         if (error){
  //           var response = {success: false, error: {type: "database", row: rowCount, msg: "Could not write row to database. Cancelled write event. Please check specified row."}}
  //           return callback(response);
  //         } else {
  //           csvStream.resume();
  //         }
  //       });
  //
  //       rowCount += 1;
  //
  //     })
  //     .on("end", function(data) {
  //       var response = {success: true, rows: rowCount, msg: "File successfully Uploaded. Note: values in unrequired columns which did not match required data type were set to NULL."};
  //       return callback(response);
  //     });
  //   }
  // });

}
