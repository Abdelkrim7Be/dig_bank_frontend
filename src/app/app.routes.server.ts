import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Routes with parameters should use Server rendering instead of prerendering
  {
    path: 'users/:id/edit',
    renderMode: RenderMode.Server,
  },
  {
    path: 'users/:id/view',
    renderMode: RenderMode.Server,
  },
  // Customer routes with parameters
  {
    path: 'customers/:id/edit',
    renderMode: RenderMode.Server,
  },
  {
    path: 'customers/:id/view',
    renderMode: RenderMode.Server,
  },

  // Change these problematic routes to Server rendering
  {
    path: 'users',
    renderMode: RenderMode.Server,
  },
  {
    path: 'products',
    renderMode: RenderMode.Server,
  },
  {
    path: 'customers',
    renderMode: RenderMode.Server,
  },

  // Static routes can use prerendering
  {
    path: '',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'login',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'register',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'dashboard',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'users/new',
    renderMode: RenderMode.Server,
  },
  {
    path: 'customers/new',
    renderMode: RenderMode.Server,
  },

  // Default route for any other paths
  {
    path: '**',
    renderMode: RenderMode.Server,
  },
];
