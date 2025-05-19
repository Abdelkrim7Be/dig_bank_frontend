import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CustomerService } from '../services/customer.service';
import { CommonModule } from '@angular/common';
import { UserService } from '../../users/services/user.service';
import { User } from '../../users/models/user.model';

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './customer-form.component.html',
  styleUrls: ['./customer-form.component.scss'],
})
export class CustomerFormComponent implements OnInit {
  customerForm!: FormGroup;
  isEditMode = false;
  customerId: number | null = null;
  loading = false;
  submitting = false;
  error: string | null = null;
  users: User[] = []; // For user selection dropdown

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private customerService: CustomerService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadUsers();

    // Check if we're in edit mode
    const paramId = this.route.snapshot.paramMap.get('id');
    if (paramId) {
      this.customerId = Number(paramId);
      this.isEditMode = true;
      this.loadCustomerData(this.customerId);
    }
  }

  initForm(): void {
    this.customerForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      address: ['', [Validators.required]],
      userId: [null], // Optional field for linking to a user
    });
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
      },
      error: (err) => {
        console.error('Error loading users:', err);
      },
    });
  }

  loadCustomerData(id: number): void {
    this.loading = true;

    this.customerService.getCustomer(id).subscribe({
      next: (customer) => {
        this.customerForm.patchValue({
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          address: customer.address,
          userId: customer.owner?.id || null,
        });

        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load customer data. Please try again.';
        console.error('Error loading customer:', err);
        this.loading = false;
      },
    });
  }

  onSubmit(): void {
    if (this.customerForm.invalid) {
      this.markFormGroupTouched(this.customerForm);
      return;
    }

    this.submitting = true;
    const customerData = { ...this.customerForm.value };

    if (this.isEditMode && this.customerId) {
      // Update existing customer
      this.customerService
        .updateCustomer(this.customerId, customerData)
        .subscribe({
          next: () => {
            this.router.navigate(['/customers']);
          },
          error: (err) => {
            this.error = 'Failed to update customer. Please try again.';
            console.error('Error updating customer:', err);
            this.submitting = false;
          },
        });
    } else {
      // Create new customer
      this.customerService.createCustomer(customerData).subscribe({
        next: () => {
          this.router.navigate(['/customers']);
        },
        error: (err) => {
          this.error = 'Failed to create customer. Please try again.';
          console.error('Error creating customer:', err);
          this.submitting = false;
        },
      });
    }
  }

  // Helper to mark all form controls as touched to display validation errors
  markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}
