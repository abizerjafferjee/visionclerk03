import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from "@angular/router";
import { HttpClient } from '@angular/common/http';
import { MatTableDataSource } from '@angular/material';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.css']
})


export class ViewComponent implements OnInit {

  tableId;
  dataSetCols;
  dataSet;
  dataSource;
  showTable = false;
  url = "http://localhost:3000"

  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute) { }

  ngOnInit() {
    this.tableId = this.route.snapshot.paramMap.get('id');
    this.getDataSet();
  }

  getDataSet() {
    this.http.post(this.url + '/data/datatable', {"id":this.tableId})
      .subscribe(resp => {
        if (resp["success"]) {
          var parsedDF = this.parseDataFrame(JSON.parse(resp["data"]));
          this.dataSetCols = parsedDF[0];
          this.dataSet = parsedDF[1];
          console.log(this.dataSet);
          this.dataSource = new MatTableDataSource(this.dataSet);
          this.showTable = true;
        }
      }, err => {

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
    console.log(this.dataSource);
    console.log(this.dataSet);

    this.http.post(this.url + '/data/save', {"id":this.tableId, "data": this.dataSet})
      .subscribe(resp => {
        if (resp["success"]) {
        }
      }, err => {

      });

  }

}
