import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from "@angular/router";
import { tap, catchError } from 'rxjs/operators';
import { of, Observable } from 'rxjs';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  signupData = { email:'', password:'' };
  message = '';
  url = 'http://localhost:3000';

  constructor(private http: HttpClient, private router: Router) { }

  ngOnInit() {
  }

  signup() {
    console.log(this.signupData)
    this.http.post(this.url + '/auth/signup',this.signupData).subscribe(resp => {
      console.log(resp);
      // this.message = resp.msg;
      // this.router.navigate(['login']);
    }, err => {
      this.message = err.error.msg;
      // this.message = err.msg;
    });
  }

}
