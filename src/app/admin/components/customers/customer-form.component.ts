import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AdminCustomerService } from '../../services/customer.service';
import {
  RegisterRequest,
  UserRole,
  CustomerUpdateRequest,
} from '../../../auth/models/auth.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-customer-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="container-fluid mt-4">
      <div class="row justify-content-center">
        <div class="col-md-8">
          <div class="card shadow-sm">
            <div class="card-header bg-light">
              <div class="d-flex justify-content-between align-items-center">
                <h5 class="mb-0">
                  {{ isEditMode ? 'Edit Customer' : 'Add New Customer' }}
                </h5>
                <a
                  routerLink="/admin/customers"
                  class="btn btn-outline-secondary"
                >
                  <i class="bi bi-arrow-left me-1"></i> Back to Customers
                </a>
              </div>
            </div>
            <div class="card-body">
              <!-- Error Alert -->
              @if (error) {
              <div
                class="alert alert-danger alert-dismissible fade show"
                role="alert"
              >
                <pre
                  class="mb-0"
                  style="white-space: pre-wrap; font-family: inherit;"
                  >{{ error }}</pre
                >
                <button
                  type="button"
                  class="btn-close"
                  (click)="error = null"
                ></button>
              </div>
              }

              <!-- Success Alert -->
              @if (success) {
              <div
                class="alert alert-success alert-dismissible fade show"
                role="alert"
              >
                {{ success }}
                <button
                  type="button"
                  class="btn-close"
                  (click)="success = null"
                ></button>
              </div>
              }

              <!-- Loading Spinner -->
              @if (loading) {
              <div class="text-center py-4">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              </div>
              }

              <!-- Customer Form -->
              @if (!loading) {
              <form [formGroup]="customerForm" (ngSubmit)="onSubmit()">
                <div class="row">
                  <!-- Username Field -->
                  <div class="col-md-6 mb-3">
                    <label for="username" class="form-label">Username *</label>
                    <input
                      type="text"
                      id="username"
                      formControlName="username"
                      class="form-control"
                      [class.is-invalid]="
                        customerForm.get('username')?.invalid &&
                        customerForm.get('username')?.touched
                      "
                      placeholder="Enter username"
                      [readonly]="isEditMode"
                    />
                    @if (customerForm.get('username')?.invalid &&
                    customerForm.get('username')?.touched) {
                    <div class="invalid-feedback">
                      @if (customerForm.get('username')?.errors?.['required']) {
                      <div>Username is required</div>
                      } @if
                      (customerForm.get('username')?.errors?.['minlength']) {
                      <div>Username must be at least 3 characters</div>
                      }
                    </div>
                    }
                  </div>

                  <!-- Email Field -->
                  <div class="col-md-6 mb-3">
                    <label for="email" class="form-label">Email *</label>
                    <input
                      type="email"
                      id="email"
                      formControlName="email"
                      class="form-control"
                      [class.is-invalid]="
                        customerForm.get('email')?.invalid &&
                        customerForm.get('email')?.touched
                      "
                      placeholder="Enter email address"
                    />
                    @if (customerForm.get('email')?.invalid &&
                    customerForm.get('email')?.touched) {
                    <div class="invalid-feedback">
                      @if (customerForm.get('email')?.errors?.['required']) {
                      <div>Email is required</div>
                      } @if (customerForm.get('email')?.errors?.['email']) {
                      <div>Please enter a valid email address</div>
                      }
                    </div>
                    }
                  </div>
                </div>

                <div class="row">
                  <!-- First Name Field -->
                  <div class="col-md-6 mb-3">
                    <label for="firstName" class="form-label">First Name</label>
                    <input
                      type="text"
                      id="firstName"
                      formControlName="firstName"
                      class="form-control"
                      placeholder="Enter first name"
                    />
                  </div>

                  <!-- Last Name Field -->
                  <div class="col-md-6 mb-3">
                    <label for="lastName" class="form-label">Last Name</label>
                    <input
                      type="text"
                      id="lastName"
                      formControlName="lastName"
                      class="form-control"
                      placeholder="Enter last name"
                    />
                  </div>
                </div>

                <div class="row">
                  <!-- Name Field -->
                  <div class="col-md-6 mb-3">
                    <label for="name" class="form-label">Display Name</label>
                    <input
                      type="text"
                      id="name"
                      formControlName="name"
                      class="form-control"
                      placeholder="Enter customer's display name"
                    />
                  </div>

                  <!-- Phone Field -->
                  <div class="col-md-6 mb-3">
                    <label for="phone" class="form-label">Phone Number</label>
                    <input
                      type="tel"
                      id="phone"
                      formControlName="phone"
                      class="form-control"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>

                <!-- Password Fields (only for new customers) -->
                @if (!isEditMode) {
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="password" class="form-label">Password *</label>
                    <input
                      type="password"
                      id="password"
                      formControlName="password"
                      class="form-control"
                      [class.is-invalid]="
                        customerForm.get('password')?.invalid &&
                        customerForm.get('password')?.touched
                      "
                      placeholder="Enter password"
                    />
                    @if (customerForm.get('password')?.invalid &&
                    customerForm.get('password')?.touched) {
                    <div class="invalid-feedback">
                      @if (customerForm.get('password')?.errors?.['required']) {
                      <div>Password is required</div>
                      } @if
                      (customerForm.get('password')?.errors?.['minlength']) {
                      <div>Password must be at least 6 characters</div>
                      }
                    </div>
                    }
                  </div>
                </div>
                }

                <!-- Address Field -->
                <div class="mb-3">
                  <label for="address" class="form-label">Address</label>
                  <textarea
                    id="address"
                    formControlName="address"
                    class="form-control"
                    rows="3"
                    placeholder="Enter customer's address"
                  ></textarea>
                </div>

                <!-- Form Actions -->
                <div class="d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    class="btn btn-outline-secondary"
                    routerLink="/admin/customers"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    class="btn btn-primary"
                    [disabled]="customerForm.invalid || submitting"
                  >
                    @if (submitting) {
                    <span
                      class="spinner-border spinner-border-sm me-2"
                      role="status"
                    ></span>
                    }
                    {{ isEditMode ? 'Update Customer' : 'Create Customer' }}
                  </button>
                </div>
              </form>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .card {
        border: none;
        box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
      }

      .form-label {
        font-weight: 500;
        color: #495057;
      }

      .btn {
        border-radius: 0.375rem;
      }

      .alert {
        border-radius: 0.5rem;
      }
    `,
  ],
})
export class AdminCustomerFormComponent implements OnInit {
  customerForm!: FormGroup;
  isEditMode = false;
  customerId: number | null = null;
  loading = false;
  submitting = false;
  error: string | null = null;
  success: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private customerService: AdminCustomerService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.checkEditMode();
  }

  private initForm(): void {
    this.customerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      firstName: [''],
      lastName: [''],
      name: [''],
      phone: [''],
      address: [''],
    });
  }

  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.customerId = parseInt(id, 10);
      this.customerForm.get('password')?.clearValidators();
      this.customerForm.get('password')?.updateValueAndValidity();
      this.loadCustomer();
    }
  }

  private loadCustomer(): void {
    if (!this.customerId) return;

    this.loading = true;
    this.error = null;

    console.log('Loading customer with ID:', this.customerId);

    // Debug: Test raw HTTP request
    this.debugRawRequest(this.customerId);

    this.customerService.getCustomerById(this.customerId).subscribe({
      next: (customer) => {
        console.log('Customer loaded successfully:', customer);
        this.customerForm.patchValue({
          username: customer.username,
          email: customer.email,
          firstName: customer.firstName,
          lastName: customer.lastName,
          name: (customer.firstName || '') + ' ' + (customer.lastName || ''),
          phone: '', // Add phone field to User model if needed
          address: '', // Add address field to User model if needed
        });
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading customer:', err);
        console.error('Error details:', {
          status: err.status,
          statusText: err.statusText,
          url: err.url,
          message: err.message,
        });

        // Try to extract useful error information
        let errorMessage = 'Failed to load customer details';

        if (err.status === 0) {
          errorMessage =
            'Unable to connect to server. Please check your connection.';
        } else if (err.status === 404) {
          errorMessage = 'Customer not found.';
        } else if (err.status === 403) {
          errorMessage = 'You do not have permission to view this customer.';
        } else if (err.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (err.message && err.message.includes('parsing')) {
          errorMessage =
            'Server returned invalid data. Please contact support.';
        }

        this.error = errorMessage;
        this.loading = false;
      },
    });
  }

  onSubmit(): void {
    if (this.customerForm.invalid) {
      this.customerForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.error = null;

    const formData = this.customerForm.value;

    if (this.isEditMode) {
      // Use CustomerUpdateRequest for updates (password optional)
      const customerData: CustomerUpdateRequest = {
        username: formData.username,
        email: formData.email,
        role: UserRole.CUSTOMER,
        firstName: formData.firstName,
        lastName: formData.lastName,
        name: formData.name,
        phone: formData.phone,
      };

      this.updateCustomer(customerData);
    } else {
      // Use RegisterRequest for creation (password required)
      const customerData: RegisterRequest = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: UserRole.CUSTOMER,
        firstName: formData.firstName,
        lastName: formData.lastName,
        name: formData.name,
        phone: formData.phone,
      };

      this.createCustomer(customerData);
    }
  }

  private updateCustomer(customerData: CustomerUpdateRequest): void {
    if (!this.customerId) return;

    this.customerService
      .updateCustomer(this.customerId, customerData)
      .subscribe({
        next: () => {
          this.success = 'Customer updated successfully!';
          this.submitting = false;
          setTimeout(() => {
            this.router.navigate(['/admin/customers']);
          }, 1500);
        },
        error: (err) => {
          console.error('Error updating customer:', err);
          this.error = this.formatErrorMessage(err, 'update');
          this.submitting = false;
        },
      });
  }

  private createCustomer(customerData: RegisterRequest): void {
    this.customerService.createCustomer(customerData).subscribe({
      next: () => {
        this.success = 'Customer created successfully!';
        this.submitting = false;
        setTimeout(() => {
          this.router.navigate(['/admin/customers']);
        }, 1500);
      },
      error: (err) => {
        console.error('Error creating customer:', err);
        this.error = this.formatErrorMessage(err, 'create');
        this.submitting = false;
      },
    });
  }

  private formatErrorMessage(err: any, operation: 'create' | 'update'): string {
    console.log('Formatting error message for:', operation, err);

    // Handle validation errors
    if (err.status === 400 && err.error && err.error.errors) {
      const validationErrors = err.error.errors;
      let errorMessages: string[] = [];

      // Extract field-specific errors
      Object.keys(validationErrors).forEach((field) => {
        const fieldErrors = validationErrors[field];
        if (Array.isArray(fieldErrors)) {
          fieldErrors.forEach((error) => {
            errorMessages.push(`• ${this.formatFieldName(field)}: ${error}`);
          });
        } else {
          errorMessages.push(
            `• ${this.formatFieldName(field)}: ${fieldErrors}`
          );
        }
      });

      if (errorMessages.length > 0) {
        return `Validation errors:\n${errorMessages.join('\n')}`;
      }
    }

    // Handle other error types
    if (err.status === 400) {
      return (
        err.error?.message || `Invalid data provided. Please check your input.`
      );
    } else if (err.status === 409) {
      return 'A customer with this username or email already exists.';
    } else if (err.status === 403) {
      return 'You do not have permission to perform this action.';
    } else if (err.status === 404) {
      return 'Customer not found.';
    } else if (err.status === 500) {
      return 'Server error. Please try again later.';
    } else {
      return `Failed to ${operation} customer. Please try again.`;
    }
  }

  private formatFieldName(field: string): string {
    // Convert camelCase to readable format
    return field
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  }

  private debugRawRequest(customerId: number): void {
    const url = `${environment.apiUrl}${environment.endpoints.admin.customers}/${customerId}`;
    console.log('Debug: Making raw HTTP request to:', url);

    this.http.get(url, { responseType: 'text' }).subscribe({
      next: (response) => {
        console.log('Debug: Raw response received:', response);
        console.log('Debug: Response length:', response.length);
        console.log('Debug: Response type:', typeof response);

        // Show first and last 100 characters
        if (response.length > 200) {
          console.log('Debug: First 100 chars:', response.substring(0, 100));
          console.log(
            'Debug: Last 100 chars:',
            response.substring(response.length - 100)
          );
        }
      },
      error: (error) => {
        console.error('Debug: Raw request failed:', error);
      },
    });
  }
}
