import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="container">
      <div class="row justify-content-center mt-5">
        <div class="col-md-6">
          <div class="card shadow">
            <div class="card-header bg-primary text-white">
              <h3 class="mb-0">Login to Your Account</h3>
            </div>
            <div class="card-body p-4">
              <!-- Error Alert -->
              <div
                *ngIf="errorMessage"
                class="alert alert-danger alert-dismissible fade show"
                role="alert"
              >
                {{ errorMessage }}
                <button
                  type="button"
                  class="btn-close"
                  (click)="errorMessage = ''"
                  aria-label="Close"
                ></button>
              </div>

              <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
                <!-- Email Field -->
                <div class="mb-3">
                  <label for="email" class="form-label">Email address</label>
                  <input
                    type="email"
                    id="email"
                    formControlName="email"
                    class="form-control"
                    [ngClass]="{
                      'is-invalid':
                        email?.invalid && (email?.dirty || email?.touched)
                    }"
                    placeholder="Enter your email"
                  />
                  <div
                    *ngIf="email?.invalid && (email?.dirty || email?.touched)"
                    class="invalid-feedback"
                  >
                    <div *ngIf="email?.errors?.['required']">
                      Email is required
                    </div>
                    <div *ngIf="email?.errors?.['email']">
                      Please enter a valid email address
                    </div>
                  </div>
                </div>

                <!-- Password Field -->
                <div class="mb-4">
                  <label for="password" class="form-label">Password</label>
                  <input
                    type="password"
                    id="password"
                    formControlName="password"
                    class="form-control"
                    [ngClass]="{
                      'is-invalid':
                        password?.invalid &&
                        (password?.dirty || password?.touched)
                    }"
                    placeholder="Enter your password"
                  />
                  <div
                    *ngIf="
                      password?.invalid &&
                      (password?.dirty || password?.touched)
                    "
                    class="invalid-feedback"
                  >
                    <div *ngIf="password?.errors?.['required']">
                      Password is required
                    </div>
                  </div>
                </div>

                <!-- Remember Me -->
                <div class="mb-3 form-check">
                  <input
                    type="checkbox"
                    class="form-check-input"
                    id="rememberMe"
                    formControlName="rememberMe"
                  />
                  <label class="form-check-label" for="rememberMe"
                    >Remember me</label
                  >
                </div>

                <!-- Submit Button -->
                <div class="d-grid">
                  <button
                    type="submit"
                    class="btn btn-primary btn-lg"
                    [disabled]="loginForm.invalid || isLoading"
                  >
                    {{ isLoading ? 'Logging in...' : 'Login' }}
                  </button>
                </div>
              </form>
            </div>

            <div class="card-footer bg-light p-3 text-center">
              <p class="mb-0">
                Don't have an account?
                <a routerLink="/register" class="text-primary">Register here</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .card {
        border-radius: 10px;
        overflow: hidden;
        border: none;
      }

      .card-header {
        border-bottom: 0;
      }

      .btn-primary {
        transition: all 0.3s ease;
      }

      .btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }
    `,
  ],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  returnUrl: string = '/dashboard';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Check if redirected due to expired session
    this.route.queryParams.subscribe((params) => {
      if (params['expired'] === 'true') {
        this.errorMessage = 'Your session has expired. Please log in again.';
      }
    });

    this.initializeForm();
    // Get return url from route parameters or default to '/dashboard'
    this.returnUrl =
      this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
  }

  private initializeForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      rememberMe: [false],
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { email, password } = this.loginForm.value;

    // Temporary implementation until backend is connected
    setTimeout(() => {
      this.isLoading = false;
      this.router.navigate([this.returnUrl]);

      // Real implementation would be:
      // this.authService.login({ email, password }).subscribe({
      //   next: () => {
      //     this.router.navigate([this.returnUrl]);
      //   },
      //   error: (error) => {
      //     this.errorMessage = error.message || 'Login failed. Please check your credentials.';
      //     this.isLoading = false;
      //   }
      // });
    }, 1500);
  }

  // Getter methods for form controls
  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }
}
