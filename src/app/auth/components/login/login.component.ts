import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoginRequest, UserRole } from '../../models/auth.model';
import { BankingValidators } from '../../../shared/validators/banking-validators';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="auth-container">
      <div class="container-fluid vh-100">
        <div class="row h-100">
          <!-- Left Side - Branding -->
          <div
            class="col-lg-6 d-none d-lg-flex align-items-center justify-content-center bg-primary"
          >
            <div class="text-center text-white">
              <i class="bi bi-bank display-1 mb-4"></i>
              <h1 class="display-4 fw-bold mb-3">Digital Banking</h1>
              <p class="lead">Secure, Fast, and Reliable Banking Solutions</p>
              <div class="mt-5">
                <div class="row text-center">
                  <div class="col-4">
                    <i class="bi bi-shield-check display-6 mb-2"></i>
                    <p class="small">Secure</p>
                  </div>
                  <div class="col-4">
                    <i class="bi bi-lightning-charge display-6 mb-2"></i>
                    <p class="small">Fast</p>
                  </div>
                  <div class="col-4">
                    <i class="bi bi-clock display-6 mb-2"></i>
                    <p class="small">24/7</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Side - Login Form -->
          <div
            class="col-lg-6 d-flex align-items-center justify-content-center"
          >
            <div class="auth-form-container w-100" style="max-width: 400px;">
              <div class="text-center mb-5">
                <i class="bi bi-bank text-primary display-4 mb-3"></i>
                <h2 class="fw-bold text-dark">Welcome Back</h2>
                <p class="text-muted">Sign in to your account</p>
              </div>

              <!-- Alert Messages -->
              <div
                *ngIf="errorMessage"
                class="alert alert-danger alert-dismissible fade show"
                role="alert"
              >
                <i class="bi bi-exclamation-triangle me-2"></i>
                {{ errorMessage }}
                <button
                  type="button"
                  class="btn-close"
                  (click)="errorMessage = ''"
                ></button>
              </div>

              <div
                *ngIf="successMessage"
                class="alert alert-success alert-dismissible fade show"
                role="alert"
              >
                <i class="bi bi-check-circle me-2"></i>
                {{ successMessage }}
                <button
                  type="button"
                  class="btn-close"
                  (click)="successMessage = ''"
                ></button>
              </div>

              <!-- Login Form -->
              <form
                [formGroup]="loginForm"
                (ngSubmit)="onSubmit()"
                class="needs-validation"
                novalidate
              >
                <!-- Username Field -->
                <div class="mb-3">
                  <label for="username" class="form-label">
                    <i class="bi bi-person me-2"></i>Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    class="form-control form-control-lg"
                    formControlName="username"
                    [class.is-invalid]="
                      username?.invalid &&
                      (username?.dirty || username?.touched)
                    "
                    placeholder="Enter your username"
                    autocomplete="username"
                  />
                  <div
                    class="invalid-feedback"
                    *ngIf="
                      username?.invalid &&
                      (username?.dirty || username?.touched)
                    "
                  >
                    <div *ngIf="username?.errors?.['required']">
                      Username is required
                    </div>
                    <div *ngIf="username?.errors?.['minlength']">
                      Username must be at least 3 characters
                    </div>
                  </div>
                </div>

                <!-- Password Field -->
                <div class="mb-3">
                  <label for="password" class="form-label">
                    <i class="bi bi-lock me-2"></i>Password
                  </label>
                  <div class="input-group">
                    <input
                      [type]="showPassword ? 'text' : 'password'"
                      id="password"
                      class="form-control form-control-lg"
                      formControlName="password"
                      [class.is-invalid]="
                        password?.invalid &&
                        (password?.dirty || password?.touched)
                      "
                      placeholder="Enter your password"
                      autocomplete="current-password"
                    />
                    <button
                      type="button"
                      class="btn btn-outline-secondary"
                      (click)="togglePasswordVisibility()"
                    >
                      <i
                        class="bi"
                        [class.bi-eye]="!showPassword"
                        [class.bi-eye-slash]="showPassword"
                      ></i>
                    </button>
                  </div>
                  <div
                    class="invalid-feedback"
                    *ngIf="
                      password?.invalid &&
                      (password?.dirty || password?.touched)
                    "
                  >
                    <div *ngIf="password?.errors?.['required']">
                      Password is required
                    </div>
                    <div *ngIf="password?.errors?.['minlength']">
                      Password must be at least 6 characters
                    </div>
                  </div>
                </div>

                <!-- Remember Me -->
                <div class="mb-4">
                  <div class="form-check">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      id="rememberMe"
                      formControlName="rememberMe"
                    />
                    <label class="form-check-label" for="rememberMe">
                      Remember me
                    </label>
                  </div>
                </div>

                <!-- Submit Button -->
                <button
                  type="submit"
                  class="btn btn-primary btn-lg w-100 mb-3"
                  [disabled]="loginForm.invalid || loading"
                >
                  <span
                    *ngIf="loading"
                    class="spinner-border spinner-border-sm me-2"
                  ></span>
                  <i *ngIf="!loading" class="bi bi-box-arrow-in-right me-2"></i>
                  {{ loading ? 'Signing In...' : 'Sign In' }}
                </button>

                <!-- Forgot Password Link -->
                <div class="text-center mb-3">
                  <a href="#" class="text-decoration-none"
                    >Forgot your password?</a
                  >
                </div>

                <!-- Register Link -->
                <div class="text-center">
                  <p class="mb-0">
                    Don't have an account?
                    <a
                      routerLink="/auth/register"
                      class="text-primary text-decoration-none fw-semibold"
                      >Sign up</a
                    >
                  </p>
                </div>
              </form>

              <!-- Demo Accounts -->
              <div class="mt-4 p-3 bg-light rounded">
                <h6 class="text-muted mb-2">Demo Accounts:</h6>
                <div class="row">
                  <div class="col-6">
                    <button
                      type="button"
                      class="btn btn-outline-primary btn-sm w-100 mb-2"
                      (click)="loginAsAdmin()"
                    >
                      <i class="bi bi-shield-check me-1"></i>Admin
                    </button>
                  </div>
                  <div class="col-6">
                    <button
                      type="button"
                      class="btn btn-outline-success btn-sm w-100 mb-2"
                      (click)="loginAsCustomer()"
                    >
                      <i class="bi bi-person me-1"></i>Customer
                    </button>
                  </div>
                </div>
                <small class="text-muted"
                  >Click to auto-fill demo credentials</small
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .auth-container {
        min-height: 100vh;
      }

      .bg-primary {
        background: linear-gradient(
          135deg,
          var(--primary-red) 0%,
          #d62d3a 100%
        );
      }

      .auth-form-container {
        padding: 2rem;
      }

      .form-control-lg {
        padding: 0.75rem 1rem;
        font-size: 1rem;
      }

      .btn-lg {
        padding: 0.75rem 1.5rem;
        font-size: 1.1rem;
      }

      .form-control:focus {
        border-color: var(--primary-red);
        box-shadow: 0 0 0 0.2rem rgba(230, 57, 70, 0.25);
      }

      .btn-primary {
        background-color: var(--primary-red);
        border-color: var(--primary-red);
      }

      .btn-primary:hover,
      .btn-primary:focus {
        background-color: #d62d3a;
        border-color: #d62d3a;
      }

      .text-primary {
        color: var(--primary-red) !important;
      }

      .alert {
        border-radius: 8px;
      }

      @media (max-width: 991.98px) {
        .auth-form-container {
          padding: 1rem;
        }
      }
    `,
  ],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';
  showPassword = false;
  returnUrl = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '';

    // Check if user is already logged in
    if (this.authService.isAuthenticated()) {
      this.redirectUser();
    }
  }

  initializeForm(): void {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, BankingValidators.username()]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false],
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const loginData: LoginRequest = {
      username: this.loginForm.value.username,
      password: this.loginForm.value.password,
    };

    this.authService.login(loginData).subscribe({
      next: (response) => {
        this.loading = false;
        this.successMessage = 'Login successful! Redirecting...';
        setTimeout(() => {
          this.redirectUser();
        }, 1000);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage =
          error.error?.message ||
          'Login failed. Please check your credentials.';
      },
    });
  }

  private redirectUser(): void {
    const user = this.authService.getCurrentUser();
    if (this.returnUrl) {
      this.router.navigateByUrl(this.returnUrl);
    } else if (user?.role === UserRole.ADMIN) {
      this.router.navigate(['/admin/dashboard']);
    } else {
      this.router.navigate(['/customer/dashboard']);
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  loginAsAdmin(): void {
    this.loginForm.patchValue({
      username: 'admin',
      password: 'admin123',
    });
  }

  loginAsCustomer(): void {
    this.loginForm.patchValue({
      username: 'abdelkrim',
      password: 'password123',
    });
  }

  // Getter methods for form controls
  get username() {
    return this.loginForm.get('username');
  }
  get password() {
    return this.loginForm.get('password');
  }
}
