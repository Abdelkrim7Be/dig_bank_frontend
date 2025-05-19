import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import {
  Customer,
  CreateCustomerDto,
  UpdateCustomerDto,
} from '../models/customer.model';
import { delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  private apiUrl = 'api/customers'; // Replace with actual API URL when backend is ready

  // Temporary customers data for development
  private mockCustomers: Customer[] = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '555-123-4567',
      address: '123 Main St, Anytown, USA',
      createdDate: new Date('2023-01-15'),
      createdBy: 'admin',
      lastModifiedDate: new Date('2023-05-20'),
      lastModifiedBy: 'admin',
      bankAccounts: [],
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '555-987-6543',
      address: '456 Oak Ave, Somewhere, USA',
      createdDate: new Date('2023-02-10'),
      createdBy: 'admin',
      lastModifiedDate: new Date('2023-06-01'),
      lastModifiedBy: 'admin',
      bankAccounts: [],
    },
    {
      id: 3,
      name: 'Bob Johnson',
      email: 'bob.johnson@example.com',
      phone: '555-555-5555',
      address: '789 Pine Rd, Nowhere, USA',
      createdDate: new Date('2023-03-05'),
      createdBy: 'admin',
      lastModifiedDate: new Date('2023-04-18'),
      lastModifiedBy: 'admin',
      bankAccounts: [],
    },
  ];

  constructor(private http: HttpClient) {}

  getCustomers(): Observable<Customer[]> {
    // Return mock data with artificial delay for development
    return of(this.mockCustomers).pipe(delay(500));

    // When backend is ready, use this:
    // return this.http.get<Customer[]>(this.apiUrl);
  }

  getCustomer(id: number): Observable<Customer> {
    // Return mock data with artificial delay for development
    const customer = this.mockCustomers.find((c) => c.id === id);
    if (!customer) {
      throw new Error('Customer not found');
    }
    return of(customer).pipe(delay(300));

    // When backend is ready, use this:
    // return this.http.get<Customer>(`${this.apiUrl}/${id}`);
  }

  createCustomer(customerData: CreateCustomerDto): Observable<Customer> {
    // Simulate API call for development
    const newCustomer: Customer = {
      id: this.mockCustomers.length + 1,
      ...customerData,
      createdDate: new Date(),
      createdBy: 'current-user', // This would be the actual logged-in user
      lastModifiedDate: new Date(),
      lastModifiedBy: 'current-user', // This would be the actual logged-in user
      bankAccounts: [],
    };
    this.mockCustomers.push(newCustomer);
    return of(newCustomer).pipe(delay(500));

    // When backend is ready, use this:
    // return this.http.post<Customer>(this.apiUrl, customerData);
  }

  updateCustomer(
    id: number,
    customerData: UpdateCustomerDto
  ): Observable<Customer> {
    // Simulate API call for development
    const index = this.mockCustomers.findIndex((c) => c.id === id);
    if (index === -1) {
      throw new Error('Customer not found');
    }

    const updatedCustomer: Customer = {
      ...this.mockCustomers[index],
      ...customerData,
      lastModifiedDate: new Date(),
      lastModifiedBy: 'current-user', // This would be the actual logged-in user
    };

    this.mockCustomers[index] = updatedCustomer;
    return of(updatedCustomer).pipe(delay(500));

    // When backend is ready, use this:
    // return this.http.put<Customer>(`${this.apiUrl}/${id}`, customerData);
  }

  deleteCustomer(id: number): Observable<void> {
    // Simulate API call for development
    const index = this.mockCustomers.findIndex((c) => c.id === id);
    if (index !== -1) {
      this.mockCustomers.splice(index, 1);
    }
    return of(void 0).pipe(delay(300));

    // When backend is ready, use this:
    // return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
