import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, tap, catchError, switchMap } from 'rxjs/operators';
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
    console.log('AdminCustomerService.getCustomerById() - ID:', id);
    console.log(
      'AdminCustomerService.getCustomerById() - URL:',
      `${this.API_URL}/${id}`
    );

    return this.http.get<User>(`${this.API_URL}/${id}`).pipe(
      tap((customer) => {
        console.log(
          'AdminCustomerService.getCustomerById() - Success:',
          customer
        );
      }),
      catchError((error) => {
        console.error('AdminCustomerService.getCustomerById() - Error:', error);

        // If it's a JSON parsing error, try to get the raw response and fix it
        if (error.message && error.message.includes('parsing')) {
          console.log(
            'AdminCustomerService.getCustomerById() - Trying raw text response...'
          );
          return this.getCustomerByIdRaw(id).pipe(
            catchError((rawError) => {
              console.log(
                'AdminCustomerService.getCustomerById() - Raw response failed, trying list fallback...'
              );
              return this.getCustomerByIdFromList(id);
            })
          );
        }

        // For other errors, try the list fallback
        if (error.status === 500 || error.status === 404) {
          console.log(
            'AdminCustomerService.getCustomerById() - Server error, trying list fallback...'
          );
          return this.getCustomerByIdFromList(id);
        }

        return throwError(() => error);
      })
    );
  }

  /**
   * Get customer by ID with raw text response (fallback for malformed JSON)
   */
  private getCustomerByIdRaw(id: number): Observable<User> {
    return this.http
      .get(`${this.API_URL}/${id}`, { responseType: 'text' })
      .pipe(
        map((response: string) => {
          console.log('Raw response:', response);
          console.log('Raw response length:', response.length);

          // Try to fix malformed JSON
          let cleanedResponse = this.cleanMalformedJSON(response);

          console.log('Cleaned response:', cleanedResponse);

          try {
            return JSON.parse(cleanedResponse) as User;
          } catch (parseError) {
            console.error('Failed to parse cleaned response:', parseError);
            console.error('Cleaned response that failed:', cleanedResponse);
            throw new Error('Unable to parse customer data from server');
          }
        }),
        catchError((error) => {
          console.error('Raw response fallback failed:', error);
          return throwError(() => new Error('Failed to load customer data'));
        })
      );
  }

  /**
   * Get customer by ID from customer list (fallback method)
   */
  private getCustomerByIdFromList(id: number): Observable<User> {
    console.log('AdminCustomerService.getCustomerByIdFromList() - ID:', id);

    // Try to get the customer from the customers list endpoint
    return this.getCustomers({ size: 1000 }).pipe(
      map((response) => {
        const customer = response.content.find((c) => c.id === id);
        if (!customer) {
          throw new Error(`Customer with ID ${id} not found`);
        }
        console.log(
          'AdminCustomerService.getCustomerByIdFromList() - Found:',
          customer
        );
        return customer;
      }),
      catchError((error) => {
        console.error(
          'AdminCustomerService.getCustomerByIdFromList() - Error:',
          error
        );
        return throwError(
          () => new Error(`Failed to find customer with ID ${id}`)
        );
      })
    );
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
    console.log(
      'AdminCustomerService.updateCustomerStatus() - ID:',
      id,
      'Enabled:',
      enabled
    );

    // Try the status endpoint first, fallback to regular update if CORS fails
    return this.http
      .patch<User>(`${this.API_URL}/${id}/status`, { enabled })
      .pipe(
        tap((updatedCustomer) => {
          console.log(
            'AdminCustomerService.updateCustomerStatus() - Success:',
            updatedCustomer
          );
          const currentCustomers = this.customersSubject.value;
          const index = currentCustomers.findIndex((c) => c.id === id);
          if (index !== -1) {
            currentCustomers[index] = updatedCustomer;
            this.customersSubject.next([...currentCustomers]);
          }
        }),
        catchError((error) => {
          console.error(
            'AdminCustomerService.updateCustomerStatus() - Status endpoint failed:',
            error
          );

          // If CORS or other error, try using the regular update endpoint
          if (error.status === 0 || error.status === 405) {
            console.log(
              'AdminCustomerService.updateCustomerStatus() - Trying fallback update...'
            );
            return this.updateCustomerStatusFallback(id, enabled);
          }

          return throwError(() => error);
        })
      );
  }

  /**
   * Update customer status using regular update endpoint (fallback)
   */
  private updateCustomerStatusFallback(
    id: number,
    enabled: boolean
  ): Observable<User> {
    console.log(
      'AdminCustomerService.updateCustomerStatusFallback() - ID:',
      id,
      'Enabled:',
      enabled
    );

    // Try to update with just the enabled field first
    const statusUpdate = { enabled };

    return this.http.patch<User>(`${this.API_URL}/${id}`, statusUpdate).pipe(
      tap((updatedCustomer) => {
        console.log(
          'AdminCustomerService.updateCustomerStatusFallback() - Success:',
          updatedCustomer
        );
        // Update local cache
        const currentCustomers = this.customersSubject.value;
        const index = currentCustomers.findIndex((c) => c.id === id);
        if (index !== -1) {
          currentCustomers[index] = updatedCustomer;
          this.customersSubject.next([...currentCustomers]);
        }
      }),
      catchError((error) => {
        console.error(
          'AdminCustomerService.updateCustomerStatusFallback() - Direct patch failed:',
          error
        );

        // If direct patch fails, try with PUT and complete customer data
        return this.getCustomerById(id).pipe(
          switchMap((customer) => {
            // Create complete update object with all required fields
            const completeUpdate = {
              username: customer.username,
              email: customer.email,
              firstName: customer.firstName || '',
              lastName: customer.lastName || '',
              role: customer.role || 'CUSTOMER',
              enabled: enabled,
            };

            console.log(
              'AdminCustomerService.updateCustomerStatusFallback() - Trying PUT with complete data:',
              completeUpdate
            );
            return this.http.put<User>(`${this.API_URL}/${id}`, completeUpdate);
          }),
          tap((updatedCustomer) => {
            console.log(
              'AdminCustomerService.updateCustomerStatusFallback() - PUT Success:',
              updatedCustomer
            );
            // Update local cache
            const currentCustomers = this.customersSubject.value;
            const index = currentCustomers.findIndex((c) => c.id === id);
            if (index !== -1) {
              currentCustomers[index] = updatedCustomer;
              this.customersSubject.next([...currentCustomers]);
            }
          }),
          catchError((putError) => {
            console.error(
              'AdminCustomerService.updateCustomerStatusFallback() - PUT also failed:',
              putError
            );
            console.error('PUT Error details:', {
              status: putError.status,
              statusText: putError.statusText,
              url: putError.url,
              error: putError.error,
            });

            // Log validation errors specifically
            if (putError.error && putError.error.errors) {
              console.error('PUT Validation errors:', putError.error.errors);
            }

            return throwError(() => putError);
          })
        );
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

  /**
   * Clean malformed JSON response
   */
  private cleanMalformedJSON(jsonString: string): string {
    let cleaned = jsonString.trim();

    console.log('Cleaning JSON, original length:', cleaned.length);

    // Remove any extra closing braces at the end
    // Look for patterns like }}}}}}}}} and replace with single }
    cleaned = cleaned.replace(/}+$/, '}');

    // Try to find the actual end of the JSON object
    // Count opening and closing braces to find where the JSON should end
    let openBraces = 0;
    let closeBraces = 0;
    let validEndIndex = -1;

    for (let i = 0; i < cleaned.length; i++) {
      if (cleaned[i] === '{') {
        openBraces++;
      } else if (cleaned[i] === '}') {
        closeBraces++;

        // If we have equal braces and we're at a valid JSON end
        if (openBraces === closeBraces && openBraces > 0) {
          validEndIndex = i;
          break;
        }
      }
    }

    if (validEndIndex !== -1) {
      cleaned = cleaned.substring(0, validEndIndex + 1);
      console.log('Found valid JSON end at index:', validEndIndex);
    }

    console.log('Cleaned JSON length:', cleaned.length);
    return cleaned;
  }
}
