import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import {
  User,
  UserStatus,
  RegisterRequest,
} from '../../auth/models/auth.model';
import { environment } from '../../../environments/environment';

export interface CustomerSearchParams {
  search?: string;
  status?: UserStatus;
  page?: number;
  size?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CustomerResponse {
  content: User[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  size: number;
}

export interface CustomerStats {
  totalCustomers: number;
  activeCustomers: number;
  inactiveCustomers: number;
  suspendedCustomers: number;
  newCustomersThisMonth: number;
  totalBalance: number;
}

@Injectable({
  providedIn: 'root',
})
export class AdminCustomerService {
  private readonly API_URL = `${environment.apiUrl}${environment.endpoints.admin.customers}`;

  private customersSubject = new BehaviorSubject<User[]>([]);
  public customers$ = this.customersSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Get all customers with optional filtering and pagination
   */
  getCustomers(params?: CustomerSearchParams): Observable<CustomerResponse> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.search) httpParams = httpParams.set('search', params.search);
      if (params.status) httpParams = httpParams.set('status', params.status);
      if (params.page !== undefined)
        httpParams = httpParams.set('page', params.page.toString());
      if (params.size !== undefined)
        httpParams = httpParams.set('size', params.size.toString());
      if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
      if (params.sortOrder)
        httpParams = httpParams.set('sortOrder', params.sortOrder);
    }

    return this.http
      .get<CustomerResponse>(this.API_URL, { params: httpParams })
      .pipe(
        tap((response) => {
          this.customersSubject.next(response.content);
        })
      );
  }

  /**
   * Get customer by ID
   */
  getCustomerById(id: number): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/${id}`);
  }

  /**
   * Create new customer
   */
  createCustomer(customerData: RegisterRequest): Observable<User> {
    return this.http.post<User>(this.API_URL, customerData).pipe(
      tap((newCustomer) => {
        const currentCustomers = this.customersSubject.value;
        this.customersSubject.next([...currentCustomers, newCustomer]);
      })
    );
  }

  /**
   * Update customer information
   */
  updateCustomer(id: number, customerData: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.API_URL}/${id}`, customerData).pipe(
      tap((updatedCustomer) => {
        const currentCustomers = this.customersSubject.value;
        const index = currentCustomers.findIndex((c) => c.id === id);
        if (index !== -1) {
          currentCustomers[index] = updatedCustomer;
          this.customersSubject.next([...currentCustomers]);
        }
      })
    );
  }

  /**
   * Update customer status
   */
  updateCustomerStatus(id: number, enabled: boolean): Observable<User> {
    return this.http
      .patch<User>(`${this.API_URL}/${id}/status`, { enabled })
      .pipe(
        tap((updatedCustomer) => {
          const currentCustomers = this.customersSubject.value;
          const index = currentCustomers.findIndex((c) => c.id === id);
          if (index !== -1) {
            currentCustomers[index] = updatedCustomer;
            this.customersSubject.next([...currentCustomers]);
          }
        })
      );
  }

  /**
   * Delete customer
   */
  deleteCustomer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(
      tap(() => {
        const currentCustomers = this.customersSubject.value;
        const filteredCustomers = currentCustomers.filter((c) => c.id !== id);
        this.customersSubject.next(filteredCustomers);
      })
    );
  }

  /**
   * Bulk update customer status
   */
  bulkUpdateStatus(
    customerIds: number[],
    enabled: boolean
  ): Observable<User[]> {
    return this.http
      .patch<User[]>(`${this.API_URL}/bulk/status`, {
        customerIds,
        enabled,
      })
      .pipe(
        tap((updatedCustomers) => {
          const currentCustomers = this.customersSubject.value;
          const updatedCustomersMap = new Map(
            updatedCustomers.map((c) => [c.id, c])
          );

          const newCustomers = currentCustomers.map(
            (customer) => updatedCustomersMap.get(customer.id) || customer
          );

          this.customersSubject.next(newCustomers);
        })
      );
  }

  /**
   * Bulk delete customers
   */
  bulkDeleteCustomers(customerIds: number[]): Observable<void> {
    return this.http
      .delete<void>(`${this.API_URL}/bulk`, {
        body: { customerIds },
      })
      .pipe(
        tap(() => {
          const currentCustomers = this.customersSubject.value;
          const filteredCustomers = currentCustomers.filter(
            (c) => !customerIds.includes(c.id)
          );
          this.customersSubject.next(filteredCustomers);
        })
      );
  }

  /**
   * Get customer statistics
   */
  getCustomerStats(): Observable<CustomerStats> {
    return this.http.get<CustomerStats>(`${this.API_URL}/stats`);
  }

  /**
   * Get customer accounts
   */
  getCustomerAccounts(customerId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/${customerId}/accounts`);
  }

  /**
   * Get customer transactions
   */
  getCustomerTransactions(customerId: number, params?: any): Observable<any> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.page !== undefined)
        httpParams = httpParams.set('page', params.page.toString());
      if (params.size !== undefined)
        httpParams = httpParams.set('size', params.size.toString());
      if (params.startDate)
        httpParams = httpParams.set('startDate', params.startDate);
      if (params.endDate)
        httpParams = httpParams.set('endDate', params.endDate);
      if (params.type) httpParams = httpParams.set('type', params.type);
    }

    return this.http.get<any>(`${this.API_URL}/${customerId}/transactions`, {
      params: httpParams,
    });
  }

  /**
   * Export customers to CSV
   */
  exportCustomers(params?: CustomerSearchParams): Observable<Blob> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.search) httpParams = httpParams.set('search', params.search);
      if (params.status) httpParams = httpParams.set('status', params.status);
      if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
      if (params.sortOrder)
        httpParams = httpParams.set('sortOrder', params.sortOrder);
    }

    return this.http.get(`${this.API_URL}/export`, {
      params: httpParams,
      responseType: 'blob',
      observe: 'body',
    });
  }

  /**
   * Search customers by term
   */
  searchCustomers(term: string): Observable<User[]> {
    const params = new HttpParams().set('search', term).set('size', '10');
    return this.http
      .get<CustomerResponse>(this.API_URL, { params })
      .pipe(map((response) => response.content));
  }

  /**
   * Get recent customers
   */
  getRecentCustomers(limit: number = 5): Observable<User[]> {
    const params = new HttpParams()
      .set('size', limit.toString())
      .set('sortBy', 'createdAt')
      .set('sortOrder', 'desc');

    return this.http
      .get<CustomerResponse>(this.API_URL, { params })
      .pipe(map((response) => response.content));
  }

  /**
   * Validate customer data
   */
  validateCustomerData(data: Partial<User>): { [key: string]: string } {
    const errors: { [key: string]: string } = {};

    if (!data.firstName || data.firstName.trim().length < 2) {
      errors['firstName'] = 'First name must be at least 2 characters long';
    }

    if (!data.lastName || data.lastName.trim().length < 2) {
      errors['lastName'] = 'Last name must be at least 2 characters long';
    }

    if (!data.email || !this.isValidEmail(data.email)) {
      errors['email'] = 'Please enter a valid email address';
    }

    if (!data.username || data.username.trim().length < 3) {
      errors['username'] = 'Username must be at least 3 characters long';
    }

    return errors;
  }

  /**
   * Check if email is valid
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Get current customers from subject
   */
  getCurrentCustomers(): User[] {
    return this.customersSubject.value;
  }

  /**
   * Clear customers cache
   */
  clearCache(): void {
    this.customersSubject.next([]);
  }
}
