import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { CustomerNavigationComponent } from './customer-navigation.component';

@Component({
  selector: 'app-customer-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, CustomerNavigationComponent],
  template: `
    <div class="customer-layout">
      <!-- Navigation -->
      <app-customer-navigation></app-customer-navigation>
      
      <!-- Main Content -->
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
      
      <!-- Footer -->
      <footer class="footer bg-light border-top mt-auto">
        <div class="container-fluid">
          <div class="row py-3">
            <div class="col-md-6">
              <p class="mb-0 text-muted">
                <i class="bi bi-bank me-2"></i>
                © 2024 Digital Banking. All rights reserved.
              </p>
            </div>
            <div class="col-md-6 text-md-end">
              <div class="footer-links">
                <a href="#" class="text-muted text-decoration-none me-3">
                  <i class="bi bi-shield-check me-1"></i>
                  Security
                </a>
                <a href="#" class="text-muted text-decoration-none me-3">
                  <i class="bi bi-question-circle me-1"></i>
                  Help
                </a>
                <a href="#" class="text-muted text-decoration-none">
                  <i class="bi bi-telephone me-1"></i>
                  Contact
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .customer-layout {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .main-content {
      flex: 1;
      background-color: #f8f9fa;
    }

    .footer {
      margin-top: auto;
    }

    .footer-links a {
      transition: color 0.2s ease-in-out;
    }

    .footer-links a:hover {
      color: var(--bs-primary) !important;
    }

    @media (max-width: 768px) {
      .footer .col-md-6 {
        text-align: center !important;
        margin-bottom: 0.5rem;
      }
      
      .footer-links {
        text-align: center;
      }
      
      .footer-links a {
        display: inline-block;
        margin: 0.25rem 0.5rem;
      }
    }
  `]
})
export class CustomerLayoutComponent {
  constructor() {}
}
