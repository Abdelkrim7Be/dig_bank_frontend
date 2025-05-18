import { Routes } from '@angular/router';
import { NotFoundComponent } from './core/not-found/not-found.component';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./auth/register/register.component').then(
        (m) => m.RegisterComponent
      ),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard/dashboard.component').then(
        (m) => m.DashboardComponent
      ),
  },
  {
    path: 'users',
    loadComponent: () =>
      import('./users/users.component').then((m) => m.UsersComponent),
  },
  {
    path: 'users/new',
    loadComponent: () =>
      import('./users/user-form/user-form.component').then(
        (m) => m.UserFormComponent
      ),
  },
  {
    path: 'users/:id/edit',
    loadComponent: () =>
      import('./users/user-form/user-form.component').then(
        (m) => m.UserFormComponent
      ),
  },
  {
    path: 'users/:id/view',
    loadComponent: () =>
      import('./users/user-detail/user-detail.component').then(
        (m) => m.UserDetailComponent
      ),
  },
  {
    path: 'products',
    loadComponent: () =>
      import('./products/products.component').then((m) => m.ProductsComponent),
  },
  // Wildcard route for 404 - must be the last route
  { path: '**', component: NotFoundComponent },
];
