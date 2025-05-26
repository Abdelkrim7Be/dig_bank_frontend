import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../auth/services/auth.service';
import { User, PasswordChangeRequest, ProfileUpdateRequest } from '../../../auth/models/auth.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="profile-page">
      <div class="container">
        <div class="row">
          <!-- Profile Header -->
          <div class="col-12 mb-4">
            <div class="profile-header">
              <div class="d-flex align-items-center">
                <div class="profile-avatar me-4">
                  <i class="bi bi-person-circle"></i>
                </div>
                <div>
                  <h1 class="h3 mb-1">{{ currentUser?.firstName }} {{ currentUser?.lastName }}</h1>
                  <p class="text-muted mb-0">{{ currentUser?.email }}</p>
                  <span class="badge bg-primary">{{ currentUser?.role }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Profile Information -->
          <div class="col-lg-8">
            <div class="card border-0 shadow-sm mb-4">
              <div class="card-header bg-white">
                <h5 class="card-title mb-0">
                  <i class="bi bi-person-gear me-2"></i>Profile Information
                </h5>
              </div>
              <div class="card-body">
                <!-- Success/Error Messages -->
                <div *ngIf="profileMessage" class="alert" [class]="profileMessageType === 'success' ? 'alert-success' : 'alert-danger'">
                  <i class="bi me-2" [class]="profileMessageType === 'success' ? 'bi-check-circle' : 'bi-exclamation-triangle'"></i>
                  {{ profileMessage }}
                </div>

                <form [formGroup]="profileForm" (ngSubmit)="updateProfile()">
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label for="firstName" class="form-label">First Name</label>
                      <input
                        type="text"
                        id="firstName"
                        class="form-control"
                        formControlName="firstName"
                        [class.is-invalid]="firstName?.invalid && (firstName?.dirty || firstName?.touched)"
                      />
                      <div class="invalid-feedback" *ngIf="firstName?.invalid && (firstName?.dirty || firstName?.touched)">
                        <div *ngIf="firstName?.errors?.['required']">First name is required</div>
                        <div *ngIf="firstName?.errors?.['minlength']">Must be at least 2 characters</div>
                      </div>
                    </div>

                    <div class="col-md-6 mb-3">
                      <label for="lastName" class="form-label">Last Name</label>
                      <input
                        type="text"
                        id="lastName"
                        class="form-control"
                        formControlName="lastName"
                        [class.is-invalid]="lastName?.invalid && (lastName?.dirty || lastName?.touched)"
                      />
                      <div class="invalid-feedback" *ngIf="lastName?.invalid && (lastName?.dirty || lastName?.touched)">
                        <div *ngIf="lastName?.errors?.['required']">Last name is required</div>
                        <div *ngIf="lastName?.errors?.['minlength']">Must be at least 2 characters</div>
                      </div>
                    </div>
                  </div>

                  <div class="mb-3">
                    <label for="email" class="form-label">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      class="form-control"
                      formControlName="email"
                      [class.is-invalid]="email?.invalid && (email?.dirty || email?.touched)"
                    />
                    <div class="invalid-feedback" *ngIf="email?.invalid && (email?.dirty || email?.touched)">
                      <div *ngIf="email?.errors?.['required']">Email is required</div>
                      <div *ngIf="email?.errors?.['email']">Please enter a valid email address</div>
                    </div>
                  </div>

                  <div class="mb-3">
                    <label for="username" class="form-label">Username</label>
                    <input
                      type="text"
                      id="username"
                      class="form-control"
                      [value]="currentUser?.username"
                      readonly
                      disabled
                    />
                    <small class="form-text text-muted">Username cannot be changed</small>
                  </div>

                  <div class="d-flex justify-content-end">
                    <button
                      type="button"
                      class="btn btn-outline-secondary me-2"
                      (click)="resetProfileForm()"
                    >
                      Reset
                    </button>
                    <button
                      type="submit"
                      class="btn btn-primary"
                      [disabled]="profileForm.invalid || profileLoading"
                    >
                      <span *ngIf="profileLoading" class="spinner-border spinner-border-sm me-2"></span>
                      <i *ngIf="!profileLoading" class="bi bi-check me-2"></i>
                      {{ profileLoading ? 'Updating...' : 'Update Profile' }}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <!-- Change Password -->
            <div class="card border-0 shadow-sm">
              <div class="card-header bg-white">
                <h5 class="card-title mb-0">
                  <i class="bi bi-shield-lock me-2"></i>Change Password
                </h5>
              </div>
              <div class="card-body">
                <!-- Success/Error Messages -->
                <div *ngIf="passwordMessage" class="alert" [class]="passwordMessageType === 'success' ? 'alert-success' : 'alert-danger'">
                  <i class="bi me-2" [class]="passwordMessageType === 'success' ? 'bi-check-circle' : 'bi-exclamation-triangle'"></i>
                  {{ passwordMessage }}
                </div>

                <form [formGroup]="passwordForm" (ngSubmit)="changePassword()">
                  <div class="mb-3">
                    <label for="currentPassword" class="form-label">Current Password</label>
                    <div class="input-group">
                      <input
                        [type]="showCurrentPassword ? 'text' : 'password'"
                        id="currentPassword"
                        class="form-control"
                        formControlName="currentPassword"
                        [class.is-invalid]="currentPassword?.invalid && (currentPassword?.dirty || currentPassword?.touched)"
                      />
                      <button
                        type="button"
                        class="btn btn-outline-secondary"
                        (click)="toggleCurrentPasswordVisibility()"
                      >
                        <i class="bi" [class.bi-eye]="!showCurrentPassword" [class.bi-eye-slash]="showCurrentPassword"></i>
                      </button>
                    </div>
                    <div class="invalid-feedback" *ngIf="currentPassword?.invalid && (currentPassword?.dirty || currentPassword?.touched)">
                      <div *ngIf="currentPassword?.errors?.['required']">Current password is required</div>
                    </div>
                  </div>

                  <div class="mb-3">
                    <label for="newPassword" class="form-label">New Password</label>
                    <div class="input-group">
                      <input
                        [type]="showNewPassword ? 'text' : 'password'"
                        id="newPassword"
                        class="form-control"
                        formControlName="newPassword"
                        [class.is-invalid]="newPassword?.invalid && (newPassword?.dirty || newPassword?.touched)"
                      />
                      <button
                        type="button"
                        class="btn btn-outline-secondary"
                        (click)="toggleNewPasswordVisibility()"
                      >
                        <i class="bi" [class.bi-eye]="!showNewPassword" [class.bi-eye-slash]="showNewPassword"></i>
                      </button>
                    </div>
                    <div class="invalid-feedback" *ngIf="newPassword?.invalid && (newPassword?.dirty || newPassword?.touched)">
                      <div *ngIf="newPassword?.errors?.['required']">New password is required</div>
                      <div *ngIf="newPassword?.errors?.['minlength']">Password must be at least 8 characters</div>
                      <div *ngIf="newPassword?.errors?.['pattern']">Password must contain uppercase, lowercase, and number</div>
                    </div>
                  </div>

                  <div class="mb-3">
                    <label for="confirmPassword" class="form-label">Confirm New Password</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      class="form-control"
                      formControlName="confirmPassword"
                      [class.is-invalid]="confirmPassword?.invalid && (confirmPassword?.dirty || confirmPassword?.touched)"
                    />
                    <div class="invalid-feedback" *ngIf="confirmPassword?.invalid && (confirmPassword?.dirty || confirmPassword?.touched)">
                      <div *ngIf="confirmPassword?.errors?.['required']">Please confirm your new password</div>
                      <div *ngIf="confirmPassword?.errors?.['passwordMismatch']">Passwords do not match</div>
                    </div>
                  </div>

                  <div class="d-flex justify-content-end">
                    <button
                      type="button"
                      class="btn btn-outline-secondary me-2"
                      (click)="resetPasswordForm()"
                    >
                      Reset
                    </button>
                    <button
                      type="submit"
                      class="btn btn-warning"
                      [disabled]="passwordForm.invalid || passwordLoading"
                    >
                      <span *ngIf="passwordLoading" class="spinner-border spinner-border-sm me-2"></span>
                      <i *ngIf="!passwordLoading" class="bi bi-shield-check me-2"></i>
                      {{ passwordLoading ? 'Changing...' : 'Change Password' }}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <!-- Account Information -->
          <div class="col-lg-4">
            <div class="card border-0 shadow-sm">
              <div class="card-header bg-white">
                <h5 class="card-title mb-0">
                  <i class="bi bi-info-circle me-2"></i>Account Information
                </h5>
              </div>
              <div class="card-body">
                <div class="info-item mb-3">
                  <label class="text-muted">User ID</label>
                  <div class="fw-semibold">{{ currentUser?.id }}</div>
                </div>

                <div class="info-item mb-3">
                  <label class="text-muted">Role</label>
                  <div>
                    <span class="badge bg-primary">{{ currentUser?.role }}</span>
                  </div>
                </div>

                <div class="info-item mb-3">
                  <label class="text-muted">Status</label>
                  <div>
                    <span class="badge" [class]="getStatusBadge(currentUser?.status)">
                      {{ currentUser?.status }}
                    </span>
                  </div>
                </div>

                <div class="info-item mb-3">
                  <label class="text-muted">Member Since</label>
                  <div class="fw-semibold">{{ currentUser?.createdAt | date:'mediumDate' }}</div>
                </div>

                <div class="info-item">
                  <label class="text-muted">Last Updated</label>
                  <div class="fw-semibold">{{ currentUser?.updatedAt | date:'short' }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-page {
      padding: 2rem 0;
      min-height: 100vh;
      background-color: var(--light-gray);
    }

    .profile-header {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .profile-avatar {
      font-size: 4rem;
      color: var(--primary-red);
    }

    .card {
      border-radius: 12px;
    }

    .card-header {
      border-bottom: 1px solid var(--border-color);
      font-weight: 600;
    }

    .info-item {
      padding-bottom: 0.5rem;
      border-bottom: 1px solid #f0f0f0;
    }

    .info-item:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }

    .info-item label {
      font-size: 0.875rem;
      display: block;
      margin-bottom: 0.25rem;
    }

    @media (max-width: 768px) {
      .profile-page {
        padding: 1rem;
      }

      .profile-header {
        padding: 1.5rem;
        text-align: center;
      }

      .profile-avatar {
        font-size: 3rem;
      }
    }
  `]
})
export class ProfileComponent implements OnInit {
  currentUser: User | null = null;
  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  
  profileLoading = false;
  passwordLoading = false;
  
  profileMessage = '';
  profileMessageType: 'success' | 'error' = 'success';
  
  passwordMessage = '';
  passwordMessageType: 'success' | 'error' = 'success';
  
  showCurrentPassword = false;
  showNewPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.initializeForms();
  }

  initializeForms(): void {
    // Profile form
    this.profileForm = this.fb.group({
      firstName: [this.currentUser?.firstName || '', [Validators.required, Validators.minLength(2)]],
      lastName: [this.currentUser?.lastName || '', [Validators.required, Validators.minLength(2)]],
      email: [this.currentUser?.email || '', [Validators.required, Validators.email]]
    });

    // Password form
    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      ]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');
    
    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  updateProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.profileLoading = true;
    this.profileMessage = '';

    const profileData: ProfileUpdateRequest = {
      firstName: this.profileForm.value.firstName,
      lastName: this.profileForm.value.lastName,
      email: this.profileForm.value.email
    };

    this.authService.updateProfile(profileData).subscribe({
      next: (updatedUser) => {
        this.profileLoading = false;
        this.currentUser = updatedUser;
        this.profileMessage = 'Profile updated successfully!';
        this.profileMessageType = 'success';
        
        setTimeout(() => {
          this.profileMessage = '';
        }, 5000);
      },
      error: (error) => {
        this.profileLoading = false;
        this.profileMessage = error.error?.message || 'Failed to update profile. Please try again.';
        this.profileMessageType = 'error';
      }
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.passwordLoading = true;
    this.passwordMessage = '';

    const passwordData: PasswordChangeRequest = {
      currentPassword: this.passwordForm.value.currentPassword,
      newPassword: this.passwordForm.value.newPassword,
      confirmPassword: this.passwordForm.value.confirmPassword
    };

    this.authService.changePassword(passwordData).subscribe({
      next: () => {
        this.passwordLoading = false;
        this.passwordMessage = 'Password changed successfully!';
        this.passwordMessageType = 'success';
        this.resetPasswordForm();
        
        setTimeout(() => {
          this.passwordMessage = '';
        }, 5000);
      },
      error: (error) => {
        this.passwordLoading = false;
        this.passwordMessage = error.error?.message || 'Failed to change password. Please try again.';
        this.passwordMessageType = 'error';
      }
    });
  }

  resetProfileForm(): void {
    this.profileForm.patchValue({
      firstName: this.currentUser?.firstName || '',
      lastName: this.currentUser?.lastName || '',
      email: this.currentUser?.email || ''
    });
    this.profileForm.markAsUntouched();
    this.profileMessage = '';
  }

  resetPasswordForm(): void {
    this.passwordForm.reset();
    this.passwordForm.markAsUntouched();
    this.passwordMessage = '';
  }

  toggleCurrentPasswordVisibility(): void {
    this.showCurrentPassword = !this.showCurrentPassword;
  }

  toggleNewPasswordVisibility(): void {
    this.showNewPassword = !this.showNewPassword;
  }

  getStatusBadge(status: string | undefined): string {
    const badges = {
      'ACTIVE': 'bg-success',
      'INACTIVE': 'bg-warning',
      'SUSPENDED': 'bg-danger'
    };
    return badges[status as keyof typeof badges] || 'bg-secondary';
  }

  // Getter methods for form controls
  get firstName() { return this.profileForm.get('firstName'); }
  get lastName() { return this.profileForm.get('lastName'); }
  get email() { return this.profileForm.get('email'); }
  get currentPassword() { return this.passwordForm.get('currentPassword'); }
  get newPassword() { return this.passwordForm.get('newPassword'); }
  get confirmPassword() { return this.passwordForm.get('confirmPassword'); }
}
