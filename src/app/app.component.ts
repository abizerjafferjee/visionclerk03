import { Component, OnInit } from '@angular/core';
import {RoutesService} from './routes.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'vc';
  url = 'http://localhost:3000';
  message = '';

  constructor (private http: HttpClient, private routesService: RoutesService) {}

  ngOnInit() {
    this.http.get(this.url + '/test')
      .subscribe(resp => {
        this.title = resp["data"];
        // localStorage.setItem('jwtToken', this.data.token);
        // this.router.navigate(['books']);
      }, err => {
        this.message = "Something went wrong";
      });
  }

    // this.routesService.getMain().subscribe(title => {
    //   // console.log(title.data["data"]);
    //   console.log(title["data"]);
    //   this.title = title["data"];
    // });
    //
}
