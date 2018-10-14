import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import {LoginComponent} from './login/login.component';
import {SignupComponent} from './signup/signup.component';
import {DataComponent} from './data/data.component';
import { AuthGuardService } from './auth-guard.service';
import { AppsComponent } from './apps/apps.component';
import { ChecksComponent } from './apps/checks/checks.component';
import {ViewComponent} from './view/view.component';

const ROUTES = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent,
    data: { title: 'Login' }
  },
  {
    path: 'signup',
    component: SignupComponent,
    data: { title: 'Sign Up' }
  },
  {
    path: 'data',
    component: DataComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'apps/:id',
    component: AppsComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'view/:id',
    component: ViewComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'apps/checks/:id',
    component: ChecksComponent,
    canActivate: [AuthGuardService]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(ROUTES)],
  exports: [ RouterModule ]
})

export class AppRoutingModule {}
