import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from "@angular/router";
import { tap, catchError } from 'rxjs/operators';
import { of, Observable } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginData = {email: '', password: ''};
  message = '';
  data: any;
  url = 'http://localhost:3000'

  constructor(private http: HttpClient, private router: Router) { }

  ngOnInit() {
  }

  login() {
    this.http.post(this.url + '/auth/signin', this.loginData)
      .subscribe(resp => {
        console.log(resp);
        this.data = resp;
        localStorage.setItem('jwtToken', this.data.token);
        // console.log(localStorage.getItem('jwtToken'));
        this.router.navigate(['data']);
      }, err => {
        this.message = err.error.msg;
      });
  }

}
