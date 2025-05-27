import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashComponent } from './dashboard/dash/dash.component';
import { AuthenticationComponent } from './auth/authentication/authentication.component';
import { ConfirmAccountComponent } from './auth/confirm-account/confirm-account.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
    {
      path: 'auth',
      component: AuthenticationComponent,
      children: [
        { path: 'confirm-account', component: ConfirmAccountComponent }
      ]
    },
    { path: 'home', component: DashComponent },
    { path: '**', redirectTo: '/home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
