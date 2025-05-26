import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserRole } from '../../models/auth.model';
import { RegisterRequest } from '../../../shared/models/banking-dtos.model';
import { BankingValidators } from '../../../shared/validators/banking-validators';

@Component({
  selector: 'app-register',
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
              <i class="bi bi-person-plus display-1 mb-4"></i>
              <h1 class="display-4 fw-bold mb-3">Join Digital Banking</h1>
              <p class="lead">
                Create your account and start banking with us today
              </p>
              <div class="mt-5">
                <div class="row text-center">
                  <div class="col-4">
                    <i class="bi bi-credit-card display-6 mb-2"></i>
                    <p class="small">Easy Setup</p>
                  </div>
                  <div class="col-4">
                    <i class="bi bi-graph-up display-6 mb-2"></i>
                    <p class="small">Smart Banking</p>
                  </div>
                  <div class="col-4">
                    <i class="bi bi-headset display-6 mb-2"></i>
                    <p class="small">24/7 Support</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Side - Register Form -->
          <div
            class="col-lg-6 d-flex align-items-center justify-content-center"
          >
            <div class="auth-form-container w-100" style="max-width: 450px;">
              <div class="text-center mb-4">
                <i class="bi bi-bank text-primary display-4 mb-3"></i>
                <h2 class="fw-bold text-dark">Create Account</h2>
                <p class="text-muted">Join thousands of satisfied customers</p>
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

              <!-- Register Form -->
              <form
                [formGroup]="registerForm"
                (ngSubmit)="onSubmit()"
                class="needs-validation"
                novalidate
              >
                <!-- Name Fields -->
                <div class="row mb-3">
                  <div class="col-md-6">
                    <label for="firstName" class="form-label">First Name</label>
                    <input
                      type="text"
                      id="firstName"
                      class="form-control"
                      formControlName="firstName"
                      [class.is-invalid]="
                        firstName?.invalid &&
                        (firstName?.dirty || firstName?.touched)
                      "
                      placeholder="First name"
                    />
                    <div
                      class="invalid-feedback"
                      *ngIf="
                        firstName?.invalid &&
                        (firstName?.dirty || firstName?.touched)
                      "
                    >
                      <div *ngIf="firstName?.errors?.['required']">
                        First name is required
                      </div>
                      <div *ngIf="firstName?.errors?.['minlength']">
                        Must be at least 2 characters
                      </div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <label for="lastName" class="form-label">Last Name</label>
                    <input
                      type="text"
                      id="lastName"
                      class="form-control"
                      formControlName="lastName"
                      [class.is-invalid]="
                        lastName?.invalid &&
                        (lastName?.dirty || lastName?.touched)
                      "
                      placeholder="Last name"
                    />
                    <div
                      class="invalid-feedback"
                      *ngIf="
                        lastName?.invalid &&
                        (lastName?.dirty || lastName?.touched)
                      "
                    >
                      <div *ngIf="lastName?.errors?.['required']">
                        Last name is required
                      </div>
                      <div *ngIf="lastName?.errors?.['minlength']">
                        Must be at least 2 characters
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Username Field -->
                <div class="mb-3">
                  <label for="username" class="form-label">
                    <i class="bi bi-person me-2"></i>Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    class="form-control"
                    formControlName="username"
                    [class.is-invalid]="
                      username?.invalid &&
                      (username?.dirty || username?.touched)
                    "
                    placeholder="Choose a username"
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
                    <div *ngIf="username?.errors?.['pattern']">
                      Username can only contain letters, numbers, and
                      underscores
                    </div>
                  </div>
                </div>

                <!-- Email Field -->
                <div class="mb-3">
                  <label for="email" class="form-label">
                    <i class="bi bi-envelope me-2"></i>Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    class="form-control"
                    formControlName="email"
                    [class.is-invalid]="
                      email?.invalid && (email?.dirty || email?.touched)
                    "
                    placeholder="Enter your email"
                    autocomplete="email"
                  />
                  <div
                    class="invalid-feedback"
                    *ngIf="email?.invalid && (email?.dirty || email?.touched)"
                  >
                    <div *ngIf="email?.errors?.['required']">
                      Email is required
                    </div>
                    <div *ngIf="email?.errors?.['email']">
                      Please enter a valid email address
                    </div>
                  </div>
                </div>

                <!-- Phone Field (Optional) -->
                <div class="mb-3">
                  <label for="phone" class="form-label">
                    <i class="bi bi-telephone me-2"></i>Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    class="form-control"
                    formControlName="phone"
                    placeholder="Enter your phone number"
                    autocomplete="tel"
                  />
                </div>

                <!-- Role Selection -->
                <div class="mb-3">
                  <label for="role" class="form-label">
                    <i class="bi bi-person-badge me-2"></i>Account Type
                  </label>
                  <select
                    id="role"
                    class="form-select"
                    formControlName="role"
                    [class.is-invalid]="
                      role?.invalid && (role?.dirty || role?.touched)
                    "
                  >
                    <option value="CUSTOMER">Customer Account</option>
                    <option value="ADMIN">Administrator Account</option>
                  </select>
                  <div class="form-text">
                    <small
                      >Choose Customer for personal banking or Administrator for
                      system management</small
                    >
                  </div>
                  <div
                    class="invalid-feedback"
                    *ngIf="role?.invalid && (role?.dirty || role?.touched)"
                  >
                    <div *ngIf="role?.errors?.['required']">
                      Please select an account type
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
                      class="form-control"
                      formControlName="password"
                      [class.is-invalid]="
                        password?.invalid &&
                        (password?.dirty || password?.touched)
                      "
                      placeholder="Create a password"
                      autocomplete="new-password"
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
                      Password must be at least 8 characters
                    </div>
                    <div *ngIf="password?.errors?.['pattern']">
                      Password must contain at least one uppercase letter, one
                      lowercase letter, and one number
                    </div>
                  </div>
                </div>

                <!-- Confirm Password Field -->
                <div class="mb-3">
                  <label for="confirmPassword" class="form-label">
                    <i class="bi bi-lock-fill me-2"></i>Confirm Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    class="form-control"
                    formControlName="confirmPassword"
                    [class.is-invalid]="
                      confirmPassword?.invalid &&
                      (confirmPassword?.dirty || confirmPassword?.touched)
                    "
                    placeholder="Confirm your password"
                    autocomplete="new-password"
                  />
                  <div
                    class="invalid-feedback"
                    *ngIf="
                      confirmPassword?.invalid &&
                      (confirmPassword?.dirty || confirmPassword?.touched)
                    "
                  >
                    <div *ngIf="confirmPassword?.errors?.['required']">
                      Please confirm your password
                    </div>
                    <div *ngIf="confirmPassword?.errors?.['passwordMismatch']">
                      Passwords do not match
                    </div>
                  </div>
                </div>

                <!-- Terms and Conditions -->
                <div class="mb-4">
                  <div class="form-check">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      id="acceptTerms"
                      formControlName="acceptTerms"
                      [class.is-invalid]="
                        acceptTerms?.invalid &&
                        (acceptTerms?.dirty || acceptTerms?.touched)
                      "
                    />
                    <label class="form-check-label" for="acceptTerms">
                      I agree to the
                      <a href="#" class="text-primary">Terms of Service</a> and
                      <a href="#" class="text-primary">Privacy Policy</a>
                    </label>
                    <div
                      class="invalid-feedback"
                      *ngIf="
                        acceptTerms?.invalid &&
                        (acceptTerms?.dirty || acceptTerms?.touched)
                      "
                    >
                      You must accept the terms and conditions
                    </div>
                  </div>
                </div>

                <!-- Submit Button -->
                <button
                  type="submit"
                  class="btn btn-primary btn-lg w-100 mb-3"
                  [disabled]="registerForm.invalid || loading"
                >
                  <span
                    *ngIf="loading"
                    class="spinner-border spinner-border-sm me-2"
                  ></span>
                  <i *ngIf="!loading" class="bi bi-person-plus me-2"></i>
                  {{ loading ? 'Creating Account...' : 'Create Account' }}
                </button>

                <!-- Login Link -->
                <div class="text-center">
                  <p class="mb-0">
                    Already have an account?
                    <a
                      routerLink="/auth/login"
                      class="text-primary text-decoration-none fw-semibold"
                      >Sign in</a
                    >
                  </p>
                </div>
              </form>
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
        max-height: 100vh;
        overflow-y: auto;
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
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();

    // Check if user is already logged in
    if (this.authService.isAuthenticated()) {
      this.redirectUser();
    }
  }

  initializeForm(): void {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      username: ['', [Validators.required, BankingValidators.username()]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, BankingValidators.strongPassword()]],
      confirmPassword: [
        '',
        [Validators.required, BankingValidators.passwordMatch('password')],
      ],
      role: ['CUSTOMER', [Validators.required]], // Added role selection as per TODO.md
      phone: [''], // Optional phone field as per TODO.md
      acceptTerms: [false, [Validators.requiredTrue]],
    });
  }

  passwordMatchValidator(
    control: AbstractControl
  ): { [key: string]: boolean } | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    if (password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    return null;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    // Updated to match TODO.md RegisterRequest DTO
    const registerData: RegisterRequest = {
      username: this.registerForm.value.username,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
      role: this.registerForm.value.role, // Role selection from form
      name: `${this.registerForm.value.firstName} ${this.registerForm.value.lastName}`, // Combined name as per DTO
      phone: this.registerForm.value.phone || undefined, // Optional phone
    };

    this.authService.register(registerData).subscribe({
      next: (response) => {
        this.loading = false;
        this.successMessage = 'Account created successfully! Redirecting...';
        setTimeout(() => {
          this.redirectUser();
        }, 1000);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage =
          error.error?.message || 'Registration failed. Please try again.';
      },
    });
  }

  private redirectUser(): void {
    const user = this.authService.getCurrentUser();
    if (user?.role === UserRole.ADMIN) {
      this.router.navigate(['/admin/dashboard']);
    } else {
      this.router.navigate(['/customer/dashboard']);
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  // Getter methods for form controls
  get firstName() {
    return this.registerForm.get('firstName');
  }
  get lastName() {
    return this.registerForm.get('lastName');
  }
  get username() {
    return this.registerForm.get('username');
  }
  get email() {
    return this.registerForm.get('email');
  }
  get phone() {
    return this.registerForm.get('phone');
  }
  get role() {
    return this.registerForm.get('role');
  }
  get password() {
    return this.registerForm.get('password');
  }
  get confirmPassword() {
    return this.registerForm.get('confirmPassword');
  }
  get acceptTerms() {
    return this.registerForm.get('acceptTerms');
  }
}
