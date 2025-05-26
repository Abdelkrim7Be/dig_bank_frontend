import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { User } from '../../../auth/models/auth.model';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="error-page">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-lg-6 col-md-8">
            <div class="error-content text-center">
              <!-- Error Icon -->
              <div class="error-icon mb-4">
                <i class="bi bi-shield-exclamation text-danger"></i>
              </div>

              <!-- Error Message -->
              <h1 class="error-title">Access Denied</h1>
              <h2 class="error-subtitle">401 - Unauthorized</h2>

              <p class="error-description">
                You don't have permission to access this page. Please contact
                your administrator if you believe this is an error.
              </p>

              <!-- User Info -->
              <div class="user-info mb-4" *ngIf="currentUser">
                <div class="alert alert-info">
                  <i class="bi bi-info-circle me-2"></i>
                  You are currently logged in as
                  <strong
                    >{{ currentUser.firstName }}
                    {{ currentUser.lastName }}</strong
                  >
                  with <strong>{{ currentUser.role }}</strong> role.
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="error-actions">
                <button
                  class="btn btn-primary me-3"
                  (click)="goToDashboard()"
                  *ngIf="currentUser"
                >
                  <i class="bi bi-house me-2"></i>Go to Dashboard
                </button>

                <button
                  class="btn btn-outline-secondary me-3"
                  (click)="goBack()"
                >
                  <i class="bi bi-arrow-left me-2"></i>Go Back
                </button>

                <button
                  class="btn btn-outline-danger"
                  (click)="logout()"
                  *ngIf="currentUser"
                >
                  <i class="bi bi-box-arrow-right me-2"></i>Logout
                </button>
              </div>

              <!-- Help Section -->
              <div class="help-section mt-5">
                <h5>Need Help?</h5>
                <p class="text-muted">
                  If you believe you should have access to this page, please
                  contact support.
                </p>
                <div class="contact-info">
                  <a
                    href="mailto:support@digitalbanking.com"
                    class="btn btn-link"
                  >
                    <i class="bi bi-envelope me-2"></i>Contact Support
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .error-page {
        min-height: 100vh;
        display: flex;
        align-items: center;
        background: linear-gradient(
          135deg,
          var(--primary-white) 0%,
          #f8f9fa 100%
        );
        padding: 2rem 0;
      }

      .error-content {
        padding: 3rem 2rem;
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      }

      .error-icon {
        font-size: 6rem;
        color: var(--danger-red);
      }

      .error-title {
        font-size: 2.5rem;
        font-weight: 700;
        color: var(--dark-gray);
        margin-bottom: 0.5rem;
      }

      .error-subtitle {
        font-size: 1.5rem;
        color: var(--danger-red);
        margin-bottom: 1.5rem;
      }

      .error-description {
        font-size: 1.1rem;
        color: #6c757d;
        margin-bottom: 2rem;
        line-height: 1.6;
      }

      .error-actions .btn {
        margin-bottom: 0.5rem;
      }

      .help-section {
        border-top: 1px solid var(--border-color);
        padding-top: 2rem;
      }

      .help-section h5 {
        color: var(--dark-gray);
        margin-bottom: 1rem;
      }

      .contact-info .btn-link {
        color: var(--primary-red);
        text-decoration: none;
      }

      .contact-info .btn-link:hover {
        color: #d62d3a;
        text-decoration: underline;
      }

      @media (max-width: 768px) {
        .error-page {
          padding: 1rem;
        }

        .error-content {
          padding: 2rem 1rem;
        }

        .error-title {
          font-size: 2rem;
        }

        .error-subtitle {
          font-size: 1.25rem;
        }

        .error-icon {
          font-size: 4rem;
        }

        .error-actions .btn {
          display: block;
          width: 100%;
          margin-bottom: 0.75rem;
        }
      }
    `,
  ],
})
export class UnauthorizedComponent {
  currentUser: User | null = null;

  constructor(private authService: AuthService) {
    this.currentUser = this.authService.getCurrentUser();
  }

  goToDashboard(): void {
    if (this.currentUser?.role === 'ADMIN') {
      window.location.href = '/admin/dashboard';
    } else {
      window.location.href = '/customer/dashboard';
    }
  }

  goBack(): void {
    window.history.back();
  }

  logout(): void {
    this.authService.logout();
  }
}
