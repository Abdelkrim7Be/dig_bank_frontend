import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UsersComponent } from './users/users.component';
import { UserDetailComponent } from './users/user-detail/user-detail.component';
import { UserFormComponent } from './users/user-form/user-form.component';
import { authGuard } from './auth/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    component: HomeComponent,
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/login/login.component').then((c) => c.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./auth/register/register.component').then(
        (c) => c.RegisterComponent
      ),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard/dashboard.component').then(
        (c) => c.DashboardComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'users',
    children: [
      {
        path: '',
        component: UsersComponent,
        canActivate: [authGuard],
      },
      {
        path: 'new',
        component: UserFormComponent,
        canActivate: [authGuard],
      },
      {
        path: ':id/view',
        component: UserDetailComponent,
        canActivate: [authGuard],
      },
      {
        path: ':id/edit',
        component: UserFormComponent,
        canActivate: [authGuard],
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'home', // Later this will point to a NotFoundComponent
  },
];
