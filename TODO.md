# ✅ TODO List – Angular Frontend Chunks (for Copilot)

Use this checklist to implement your Angular frontend step-by-step.
Each chunk includes a clear prompt you can paste into your files for Copilot to complete.

---

## 🔹 Chunk 1: Setup Project + Bootstrap

```ts
// Angular project setup with Bootstrap
// - Install Bootstrap via npm
// - Import Bootstrap CSS in angular.json or styles.scss
// - Create main layout structure: header, footer, router-outlet
// - Setup SCSS file for global styles and font-family
```

---

## 🔹 Chunk 2: Auth Module – Login Component

```ts
// Create LoginComponent using Reactive Forms
// - Fields: email, password
// - On submit, call AuthService.login(email, password)
// - Store JWT from response in localStorage
// - Navigate to /dashboard if login succeeds
// - Show Bootstrap alert if login fails
// - Use Bootstrap card and form styling
```

---

## 🔹 Chunk 3: Auth Module – Register Component

```ts
// Create RegisterComponent using Reactive Forms
// - Fields: name, email, password, confirmPassword
// - Validate: password match, min 6 characters
// - Submit to AuthService.register()
// - Show success message and redirect to login
// - Use Bootstrap form layout and card
```

---

## 🔹 Chunk 4: AuthService + Token Storage

```ts
// Create AuthService
// - login(email, password): POST /api/auth/login
// - register(user): POST /api/auth/register
// - logout(): remove token
// - getToken(): return token from localStorage
// - isAuthenticated(): true if token exists
```

---

## 🔹 Chunk 5: AuthGuard (JWT Route Protection)

```ts
// Create AuthGuard to protect routes
// - If token exists, allow route
// - Else redirect to /login
// - Use canActivate in app-routing.module.ts
```

---

## 🔹 Chunk 6: App Routing Module

```ts
// Setup AppRoutingModule with basic routes
// - /login, /register (AuthModule)
// - /dashboard (DashboardModule, protected by AuthGuard)
// - Use lazy loading
```

---

## 🔹 Chunk 7: Layout Module (Sidebar + Topbar)

```ts
// Create LayoutModule
// - Topbar with logout button
// - Sidebar with navigation links (dashboard, users, products)
// - Main layout: sidebar + <router-outlet>
// - Use Bootstrap grid or Flexbox
```

---

## 🔹 Chunk 8: Dashboard Page

```ts
// Create DashboardComponent
// - Display welcome message and user info
// - Use AuthService to get current user from token
// - Use Bootstrap cards or grid for widgets
```

---

## 🔹 Chunk 9: User Management Page

```ts
// Create UsersComponent
// - Fetch list of users from /api/users
// - Display in Bootstrap table
// - Add button to view, edit, delete users
// - Use UserService to fetch and manipulate users
```

---

## 🔹 Chunk 10: Product Management Page

```ts
// Create ProductsComponent
// - List products in table (name, price, quantity)
// - Add/Edit/Delete product with modals
// - Connect to ProductService
// - Use Bootstrap forms and modals
```

---

## 🔹 Chunk 11: Role-Based Sidebar

```ts
// Modify SidebarComponent
// - Read user role from token (admin, seller)
// - Show sidebar items conditionally based on role
// - Hide admin-only links for seller
```

---

## 🔹 Chunk 12: Alerts, Loaders, and Error Handling

```ts
// Add AlertService for success/error messages
// Add LoaderComponent (spinner) to show during API calls
// Handle errors in AuthService, ProductService, etc.
// Use Bootstrap alert and spinner components
```

---

## 🔹 Chunk 13: NotFound Page + Token Expiration

```ts
// Create NotFoundComponent for 404
// Redirect invalid routes to this page
// In AuthGuard or Interceptor, check if token expired
// If expired, logout and redirect to login
```
