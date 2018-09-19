import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {FormsModule} from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import {RoutesService} from './routes.service';
import {AuthenticationService} from './authentication.service';
import {AuthGuardService} from './auth-guard.service';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './/app-routing.module';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { UploadModule } from './upload/upload.module';
import { DataComponent } from './data/data.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SignupComponent,
    DataComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    UploadModule
  ],
  providers: [RoutesService, AuthenticationService, AuthGuardService],
  bootstrap: [AppComponent]
})
export class AppModule { }