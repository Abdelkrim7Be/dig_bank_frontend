import { Component, OnInit } from '@angular/core';
import { CustomerService } from './services/customer.service';
import { Customer } from './models/customer.model';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss'],
})
export class CustomersComponent implements OnInit {
  customers: Customer[] = [];
  loading = false;
  error: string | null = null;

  constructor(private customerService: CustomerService) {}

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.loading = true;
    this.error = null;

    this.customerService.getCustomers().subscribe({
      next: (data) => {
        this.customers = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load customers. Please try again later.';
        console.error('Error loading customers:', err);
        this.loading = false;
      },
    });
  }

  deleteCustomer(id: number): void {
    if (confirm('Are you sure you want to delete this customer?')) {
      this.customerService.deleteCustomer(id).subscribe({
        next: () => {
          this.customers = this.customers.filter(
            (customer) => customer.id !== id
          );
        },
        error: (err) => {
          console.error('Error deleting customer:', err);
          alert('Failed to delete customer. Please try again.');
        },
      });
    }
  }

  getBankAccountCount(customer: Customer): number {
    return customer.bankAccounts?.length || 0;
  }
}
