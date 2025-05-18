import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-md-8 text-center">
          <div class="error-container">
            <h1 class="display-1">404</h1>
            <h2 class="mb-4">Page Not Found</h2>
            <p class="lead mb-4">
              The page you're looking for doesn't exist or has been moved.
            </p>
            <img
              src="assets/images/not-found.svg"
              alt="Page not found"
              class="img-fluid mb-4"
              style="max-height: 300px;"
            />
            <div class="mt-4">
              <a routerLink="/" class="btn btn-primary me-3">
                <i class="bi bi-house-door me-2"></i>Go to Home
              </a>
              <a routerLink="/dashboard" class="btn btn-outline-primary">
                <i class="bi bi-speedometer2 me-2"></i>Go to Dashboard
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .error-container {
        padding: 3rem 1rem;
      }

      h1 {
        font-size: 8rem;
        font-weight: 700;
        color: var(--bs-primary);
        text-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);
      }

      h2 {
        font-weight: 600;
      }
    `,
  ],
})
export class NotFoundComponent {}
