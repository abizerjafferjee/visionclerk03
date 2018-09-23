var fs = require('fs');
var csv = require('fast-csv');

var client = require('./connect');

module.exports = function upload(filePath, callback) {

  rowCount = 0;

  var stream = fs.createReadStream(filePath);
  var csvStream = csv.fromStream(stream, {headers: true, ignoreEmpty: true})
  .on("data", function(data) {
    csvStream.pause();

    // console.log(data);

    var colNames = Object.keys(data);

    var date;
    var vendorName;
    var amount;
    var checkNum;
    var invoiceNum;
    var accountNum;
    var description;

    for (var i=0; i<colNames.length; i++) {

      if (colNames[i] == 'Date') {
        if (data['Date'] != undefined) {
          var date_parts = data['Date'].split('/');
          if (date_parts[1] <= 12) {
            date = date_parts[2] + '/' + date_parts[1] + '/' + date_parts[0];
          } else {
            date = date_parts[2] + '/' + date_parts[0] + '/' + date_parts[1];
          }

          // date = data['Date'].trim();
        }
      } else if (colNames[i] == 'VendorName') {
        if (data['VendorName'] != undefined) {
          vendorName = data['VendorName'].trim();
        }
      } else if (colNames[i] == 'Amount') {
        if (data['Amount'] != undefined) {
          amount = data['Amount'].trim();
        }
      } else if (colNames[i] == 'AccountNumber') {
        if (data['AccountNumber'] != undefined) {
          accountNum = data['AccountNumber'].trim();
        }
      } else if (colNames[i] == 'CheckNum') {
        if (data['CheckNum'] != undefined) {
          checkNum = data['CheckNum'].trim();
        }
      } else if (colNames[i] == 'InvoiceNumber') {
        if (data['InvoiceNumber'] != undefined) {
          invoiceNum = data['InvoiceNumber'].trim();
        }
      } else if (colNames[i] == 'Description') {
        if (data['Description'] != undefined) {
          description = data['Description'].trim();
        }
      }

    }

    // console.log(date, vendorName, amount, checkNum, invoiceNum, accountNum, description);

    var query = "INSERT INTO dv1 (date, vendor_name, amount, check_num, invoice_num, account_num, description) VALUES ($1, $2, $3, $4, $5, $6, $7);";
    client.query(query, [date, vendorName, amount, checkNum, invoiceNum, accountNum, description], function(error, results, fields) {
      if (error){
        console.log(error);
      } else {
        console.log("written to rds");
        rowCount += 1;
        csvStream.resume();
      }
    });


  })
  .on("end", function(data) {
    // console.log("row count: ", rowCount)
    console.log("File Written to SQL");
    callback(rowCount);
  });

}
