import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from "@angular/router";
import { tap, catchError } from 'rxjs/operators';
import { of, Observable } from 'rxjs';
import { AuthenticationService } from '../authentication.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginData = {email: '', password: ''};
  message = '';
  data: any;
  url = 'http://18.234.225.173:3000'
  // url = 'http://localhost:3000'

  constructor(private http: HttpClient, private router: Router, private auth: AuthenticationService) { }

  ngOnInit() {
    if (this.auth.isLoggedIn()) {
      this.router.navigateByUrl('/data');
    }
  }

  login() {
    this.http.post(this.url + '/auth/signin', this.loginData)
      .subscribe(resp => {
        this.data = resp;
        localStorage.setItem('jwtToken', this.data.token);
        this.router.navigate(['data']);
      }, err => {
        this.message = err.error.msg;
      });
  }

}
