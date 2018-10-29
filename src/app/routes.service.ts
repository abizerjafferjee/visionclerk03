import { Injectable } from '@angular/core';
import { HttpModule } from '@angular/http';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RoutesService {

  url = 'http://18.234.225.173:3000'
  // url = 'http://localhost:3000/'

  constructor(private http: HttpClient) { }

  getMain() {
    return this.http.get(this.url);
  }
}
