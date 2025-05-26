import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Custom validators for banking application that match Spring Boot backend constraints
 */
export class BankingValidators {
  
  /**
   * Account number validator - matches Spring Boot pattern
   * Format: ACCT-XXXXXXXX (where X is alphanumeric)
   */
  static accountNumber(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null; // Don't validate empty values, use required validator for that
      }
      
      const accountNumberPattern = /^ACCT-[A-Z0-9]{8}$/;
      if (!accountNumberPattern.test(control.value)) {
        return { 
          accountNumber: { 
            message: 'Account number must be in format ACCT-XXXXXXXX' 
          } 
        };
      }
      
      return null;
    };
  }

  /**
   * Amount validator for banking transactions
   * Must be positive and have at most 2 decimal places
   */
  static amount(min: number = 0.01, max: number = 1000000): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const amount = parseFloat(control.value);
      
      if (isNaN(amount)) {
        return { amount: { message: 'Amount must be a valid number' } };
      }

      if (amount < min) {
        return { amount: { message: `Amount must be at least $${min}` } };
      }

      if (amount > max) {
        return { amount: { message: `Amount cannot exceed $${max.toLocaleString()}` } };
      }

      // Check for at most 2 decimal places
      if (!/^\d+(\.\d{1,2})?$/.test(control.value.toString())) {
        return { amount: { message: 'Amount can have at most 2 decimal places' } };
      }

      return null;
    };
  }

  /**
   * Phone number validator - matches international format
   */
  static phoneNumber(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      // Supports formats: +1234567890, (123) 456-7890, 123-456-7890, 123.456.7890
      const phonePattern = /^(\+\d{1,3}[- ]?)?\(?\d{3}\)?[- ]?\d{3}[- ]?\d{4}$/;
      
      if (!phonePattern.test(control.value)) {
        return { 
          phoneNumber: { 
            message: 'Please enter a valid phone number' 
          } 
        };
      }

      return null;
    };
  }

  /**
   * Strong password validator - matches Spring Boot security requirements
   */
  static strongPassword(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const password = control.value;
      const errors: any = {};

      // Minimum 8 characters
      if (password.length < 8) {
        errors.minLength = 'Password must be at least 8 characters long';
      }

      // At least one lowercase letter
      if (!/[a-z]/.test(password)) {
        errors.lowercase = 'Password must contain at least one lowercase letter';
      }

      // At least one uppercase letter
      if (!/[A-Z]/.test(password)) {
        errors.uppercase = 'Password must contain at least one uppercase letter';
      }

      // At least one digit
      if (!/\d/.test(password)) {
        errors.digit = 'Password must contain at least one number';
      }

      // At least one special character
      if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        errors.special = 'Password must contain at least one special character';
      }

      return Object.keys(errors).length > 0 ? { strongPassword: errors } : null;
    };
  }

  /**
   * Username validator - matches Spring Boot constraints
   */
  static username(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const username = control.value;

      // Length between 3 and 20 characters
      if (username.length < 3 || username.length > 20) {
        return { 
          username: { 
            message: 'Username must be between 3 and 20 characters' 
          } 
        };
      }

      // Only alphanumeric characters and underscores
      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return { 
          username: { 
            message: 'Username can only contain letters, numbers, and underscores' 
          } 
        };
      }

      // Cannot start with a number
      if (/^\d/.test(username)) {
        return { 
          username: { 
            message: 'Username cannot start with a number' 
          } 
        };
      }

      return null;
    };
  }

  /**
   * National ID validator (SSN format for US)
   */
  static nationalId(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      // SSN format: XXX-XX-XXXX
      const ssnPattern = /^\d{3}-\d{2}-\d{4}$/;
      
      if (!ssnPattern.test(control.value)) {
        return { 
          nationalId: { 
            message: 'National ID must be in format XXX-XX-XXXX' 
          } 
        };
      }

      return null;
    };
  }

  /**
   * Date of birth validator
   */
  static dateOfBirth(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const birthDate = new Date(control.value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        // age--;
      }

      // Must be at least 18 years old
      if (age < 18) {
        return { 
          dateOfBirth: { 
            message: 'You must be at least 18 years old' 
          } 
        };
      }

      // Cannot be more than 120 years old
      if (age > 120) {
        return { 
          dateOfBirth: { 
            message: 'Please enter a valid date of birth' 
          } 
        };
      }

      return null;
    };
  }

  /**
   * Password confirmation validator
   */
  static passwordMatch(passwordField: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const password = control.parent?.get(passwordField)?.value;
      const confirmPassword = control.value;

      if (password !== confirmPassword) {
        return { 
          passwordMatch: { 
            message: 'Passwords do not match' 
          } 
        };
      }

      return null;
    };
  }

  /**
   * Transaction description validator
   */
  static transactionDescription(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const description = control.value.trim();

      // Minimum 3 characters, maximum 255
      if (description.length < 3) {
        return { 
          transactionDescription: { 
            message: 'Description must be at least 3 characters long' 
          } 
        };
      }

      if (description.length > 255) {
        return { 
          transactionDescription: { 
            message: 'Description cannot exceed 255 characters' 
          } 
        };
      }

      // No special characters that could cause issues
      if (/[<>\"'&]/.test(description)) {
        return { 
          transactionDescription: { 
            message: 'Description contains invalid characters' 
          } 
        };
      }

      return null;
    };
  }
}
