import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UserService } from '../services/user.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss'],
})
export class UserFormComponent implements OnInit {
  userForm!: FormGroup;
  isEditMode = false;
  userId: number | null = null;
  loading = false;
  submitting = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.initForm();

    // Check if we're in edit mode
    const paramId = this.route.snapshot.paramMap.get('id');
    if (paramId) {
      this.userId = Number(paramId);
      this.isEditMode = true;
      this.loadUserData(this.userId);
    }
  }

  initForm(): void {
    this.userForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        this.isEditMode ? [] : [Validators.required, Validators.minLength(6)],
      ],
      role: ['USER', [Validators.required]],
    });

    // If in edit mode, password is optional
    if (this.isEditMode) {
      this.userForm.get('password')?.setValidators([]);
    }
  }

  loadUserData(id: number): void {
    this.loading = true;

    this.userService.getUser(id).subscribe({
      next: (user) => {
        // Don't populate password field for security reasons
        this.userForm.patchValue({
          name: user.name,
          email: user.email,
          role: user.role,
        });

        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load user data. Please try again.';
        console.error('Error loading user:', err);
        this.loading = false;
      },
    });
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.markFormGroupTouched(this.userForm);
      return;
    }

    this.submitting = true;

    // If password is empty in edit mode, remove it from the payload
    const userData = { ...this.userForm.value };

    if (this.isEditMode && !userData.password) {
      delete userData.password;
    }

    if (this.isEditMode && this.userId) {
      // Update existing user
      this.userService.updateUser(this.userId, userData).subscribe({
        next: () => {
          this.router.navigate(['/users']);
        },
        error: (err) => {
          this.error = 'Failed to update user. Please try again.';
          console.error('Error updating user:', err);
          this.submitting = false;
        },
      });
    } else {
      // Create new user
      this.userService.createUser(userData).subscribe({
        next: () => {
          this.router.navigate(['/users']);
        },
        error: (err) => {
          this.error = 'Failed to create user. Please try again.';
          console.error('Error creating user:', err);
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
