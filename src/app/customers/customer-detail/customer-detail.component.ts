import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CustomerService } from '../services/customer.service';
import { Customer } from '../models/customer.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-customer-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './customer-detail.component.html',
  styleUrls: ['./customer-detail.component.scss'],
})
export class CustomerDetailComponent implements OnInit {
  customer: Customer | null = null;
  loading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private customerService: CustomerService
  ) {}

  ngOnInit(): void {
    const customerId = this.route.snapshot.paramMap.get('id');

    if (customerId) {
      this.customerService.getCustomer(Number(customerId)).subscribe({
        next: (data) => {
          this.customer = data;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load customer details. Please try again.';
          console.error('Error loading customer:', err);
          this.loading = false;
        },
      });
    } else {
      this.error = 'Customer ID not provided';
      this.loading = false;
    }
  }

  deleteCustomer(): void {
    if (!this.customer) return;

    if (confirm(`Are you sure you want to delete ${this.customer.name}?`)) {
      this.customerService.deleteCustomer(this.customer.id).subscribe({
        next: () => {
          alert('Customer deleted successfully');
          this.router.navigate(['/customers']);
        },
        error: (err) => {
          console.error('Error deleting customer:', err);
          alert('Failed to delete customer. Please try again.');
        },
      });
    }
  }

  getBankAccountCount(): number {
    return this.customer?.bankAccounts?.length || 0;
  }
}
