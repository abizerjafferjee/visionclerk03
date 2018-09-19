import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-data',
  templateUrl: './data.component.html',
  styleUrls: ['./data.component.css']
})


export class DataComponent implements OnInit {

  url = 'http://localhost:3000';

  constructor(private http: HttpClient) { }

  ngOnInit() {

    this.http.get(this.url + '/data/files', {headers: new HttpHeaders({ 'Authorization': localStorage.getItem('jwtToken')})})
      .subscribe(resp => {
        this.files = resp;
        this.fileCount = this.files.length;
      }, err => {

      });

  }



}
