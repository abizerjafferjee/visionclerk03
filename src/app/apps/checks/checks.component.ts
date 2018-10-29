import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from "@angular/router";
import { HttpClient } from '@angular/common/http';
import { MatTableDataSource } from '@angular/material';

@Component({
  selector: 'app-checks',
  templateUrl: './checks.component.html',
  styleUrls: ['./checks.component.css']
})
export class ChecksComponent implements OnInit {
  tableId;
  report;
  showReport = false;
  reportMessage;
  dataSetCols;
  dataSet;
  dataSource;

  // url = "http://localhost:3000"
  url = 'http://18.234.225.173:3000'

  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute) { }

  ngOnInit() {
    this.tableId = this.route.snapshot.paramMap.get('id');
  }

  runReport() {
    this.http.post(this.url + '/apps/checks', {"id":this.tableId})
      .subscribe(resp => {
        if (resp["success"]) {
          if (resp["report"].length > 0) {
            this.report = JSON.parse(resp["report"]);
            var data = JSON.parse(resp["data"]);
            this.dataSet = data;
            this.dataSetCols = Object.keys(data[0]);
            // var parsedDF = this.parseDataFrame(JSON.parse(resp["data"]));
            // this.dataSetCols = parsedDF[0];
            // this.dataSet = parsedDF[1];
            this.dataSource = new MatTableDataSource(this.dataSet);
            this.reportMessage = "Tests ran successfully. There are " + this.report.length + " failed tests. Please review the report and make necessary ammendments."
            this.showReport = true;
          } else {
            this.showReport = true;
            this.reportMessage = "Tests ran successfully. There are 0 failed tests to report."
          }
        }
      }, err => {
        this.reportMessage = "Tests did not run due to some problem. We are figuring it out."
      });
  }

  parseDataFrame(dataFrame) {
    var colNames = [];
    var dataSet = [];

    for (let col in dataFrame) {
      colNames.push(col);
      for (let val in dataFrame[col]) {
        if (parseInt(val) < dataSet.length) {
          dataSet[parseInt(val)][col] = dataFrame[col][val];
        } else {
          dataSet.push({col:dataFrame[col][val]});
        }
      }
    }

    return [colNames, dataSet];
  }

  saveDataTable() {
    this.http.post(this.url + '/data/save', {"id":this.tableId, "data": this.dataSet})
      .subscribe(resp => {
        if (resp["success"]) {
          console.log("savedatatable success");
        } else {
          console.log("savedatatable success");
        }
      }, err => {
        console.log("savedatatable success");
      });

  }

}
