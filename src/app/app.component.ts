import { Component, OnInit } from '@angular/core';
import {RoutesService} from './routes.service';
import { HttpClient } from '@angular/common/http';
import { AuthenticationService } from './authentication.service';
import { Router } from "@angular/router";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  url = 'http://localhost:3000';
  user;
  show = true;

  constructor (private http: HttpClient, private routesService: RoutesService, private auth: AuthenticationService, private router: Router) {
  }

  ngOnInit() {
    this.getUser();
  }

  getUser() {
    if (this.auth.isLoggedIn()) {
      this.user = this.auth.getUserDetails();
      this.show = false;
    } else {
      this.user = {};
      this.show = true;
    }
  }

  logout() {
    this.auth.logout();
  }

}
