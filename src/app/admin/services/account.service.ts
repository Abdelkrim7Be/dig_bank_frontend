import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, tap, catchError, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface BankAccount {
  id: string;
  balance: number;
  status: string;
  type: string;
  createDate: string;
  customerDTO?: {
    id: number;
    name: string;
    email: string;
  };
  // For CurrentAccount
  overDraft?: number;
  // For SavingAccount
  interestRate?: number;
}

export interface AccountSearchParams {
  search?: string;
  status?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AccountResponse {
  content: BankAccount[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  size: number;
}

export interface CreateAccountRequest {
  customerId: number;
  accountType: 'CURRENT' | 'SAVING';
  initialBalance: number;
  overdraft?: number;
  interestRate?: number;
  description?: string;
}

export interface AccountStats {
  totalAccounts: number;
  currentAccounts: number;
  savingAccounts: number;
  totalBalance: number;
}

@Injectable({
  providedIn: 'root',
})
export class AdminAccountService {
  private readonly API_URL = `${environment.apiUrl}${environment.endpoints.admin.accounts}`;

  private accountsSubject = new BehaviorSubject<BankAccount[]>([]);
  public accounts$ = this.accountsSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Get all accounts with optional filtering and pagination
   */
  getAccounts(params?: AccountSearchParams): Observable<AccountResponse> {
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
      .get<AccountResponse>(this.API_URL, { params: httpParams })
      .pipe(
        tap((response) => {
          this.accountsSubject.next(response.content);
        })
      );
  }

  /**
   * Get account by ID
   */
  getAccountById(id: string): Observable<BankAccount> {
    return this.http.get<BankAccount>(`${this.API_URL}/${id}`);
  }

  /**
   * Create new account
   */
  createAccount(accountData: CreateAccountRequest): Observable<BankAccount> {
    console.log('AdminAccountService.createAccount() - URL:', this.API_URL);
    console.log('AdminAccountService.createAccount() - Data:', accountData);
    console.log(
      'AdminAccountService.createAccount() - Token available:',
      !!localStorage.getItem('digital-banking-token')
    );

    // Try the main endpoint first
    return this.http.post<BankAccount>(this.API_URL, accountData).pipe(
      tap((newAccount) => {
        console.log(
          'AdminAccountService.createAccount() - Success:',
          newAccount
        );
        const currentAccounts = this.accountsSubject.value;
        this.accountsSubject.next([...currentAccounts, newAccount]);
      }),
      catchError((error) => {
        console.error('AdminAccountService.createAccount() - Error:', error);
        console.error(
          'AdminAccountService.createAccount() - Error status:',
          error.status
        );
        console.error(
          'AdminAccountService.createAccount() - Error message:',
          error.message
        );
        console.error(
          'AdminAccountService.createAccount() - Error URL:',
          error.url
        );

        // If main endpoint fails with 404, try the specific endpoints
        if (error.status === 404) {
          console.log(
            'AdminAccountService.createAccount() - Trying alternative endpoints...'
          );

          if (accountData.accountType === 'CURRENT') {
            return this.createCurrentAccount(
              accountData.initialBalance,
              accountData.overdraft || 0,
              accountData.customerId
            );
          } else if (accountData.accountType === 'SAVING') {
            return this.createSavingAccount(
              accountData.initialBalance,
              accountData.interestRate || 0,
              accountData.customerId
            );
          }
        }

        return throwError(() => error);
      })
    );
  }

  /**
   * Create current account (legacy endpoint)
   */
  createCurrentAccount(
    initialBalance: number,
    overDraft: number,
    customerId: number
  ): Observable<BankAccount> {
    console.log('AdminAccountService.createCurrentAccount() - Params:', {
      initialBalance,
      overDraft,
      customerId,
    });

    const params = new HttpParams()
      .set('initialBalance', initialBalance.toString())
      .set('overDraft', overDraft.toString())
      .set('customerId', customerId.toString());

    return this.http
      .post<BankAccount>(`${this.API_URL}/current`, null, { params })
      .pipe(
        tap((newAccount) => {
          const currentAccounts = this.accountsSubject.value;
          this.accountsSubject.next([...currentAccounts, newAccount]);
        })
      );
  }

  /**
   * Create saving account (legacy endpoint)
   */
  createSavingAccount(
    initialBalance: number,
    interestRate: number,
    customerId: number
  ): Observable<BankAccount> {
    console.log('AdminAccountService.createSavingAccount() - Params:', {
      initialBalance,
      interestRate,
      customerId,
    });

    const params = new HttpParams()
      .set('initialBalance', initialBalance.toString())
      .set('interestRate', interestRate.toString())
      .set('customerId', customerId.toString());

    return this.http
      .post<BankAccount>(`${this.API_URL}/saving`, null, { params })
      .pipe(
        tap((newAccount) => {
          const currentAccounts = this.accountsSubject.value;
          this.accountsSubject.next([...currentAccounts, newAccount]);
        })
      );
  }

  /**
   * Update account status
   */
  updateAccountStatus(id: string, status: string): Observable<BankAccount> {
    console.log(
      'AdminAccountService.updateAccountStatus() - ID:',
      id,
      'Status:',
      status
    );

    return this.http
      .patch<BankAccount>(`${this.API_URL}/${id}/status`, { status })
      .pipe(
        tap((updatedAccount) => {
          console.log(
            'AdminAccountService.updateAccountStatus() - Success:',
            updatedAccount
          );
          const currentAccounts = this.accountsSubject.value;
          const index = currentAccounts.findIndex((a) => a.id === id);
          if (index !== -1) {
            currentAccounts[index] = updatedAccount;
            this.accountsSubject.next([...currentAccounts]);
          }
        }),
        catchError((error) => {
          console.error(
            'AdminAccountService.updateAccountStatus() - Status endpoint failed:',
            error
          );

          // If CORS or other error, try using fallback methods
          if (
            error.status === 0 ||
            error.status === 405 ||
            error.status === 404
          ) {
            console.log(
              'AdminAccountService.updateAccountStatus() - Trying fallback update...'
            );
            return this.updateAccountStatusFallback(id, status);
          }

          return throwError(() => error);
        })
      );
  }

  /**
   * Update account status using fallback methods
   */
  private updateAccountStatusFallback(
    id: string,
    status: string
  ): Observable<BankAccount> {
    console.log(
      'AdminAccountService.updateAccountStatusFallback() - ID:',
      id,
      'Status:',
      status
    );

    // Try direct PATCH to the account endpoint
    const statusUpdate = { status };

    return this.http
      .patch<BankAccount>(`${this.API_URL}/${id}`, statusUpdate)
      .pipe(
        tap((updatedAccount) => {
          console.log(
            'AdminAccountService.updateAccountStatusFallback() - PATCH Success:',
            updatedAccount
          );
          // Update local cache
          const currentAccounts = this.accountsSubject.value;
          const index = currentAccounts.findIndex((a) => a.id === id);
          if (index !== -1) {
            currentAccounts[index] = updatedAccount;
            this.accountsSubject.next([...currentAccounts]);
          }
        }),
        catchError((patchError) => {
          console.error(
            'AdminAccountService.updateAccountStatusFallback() - PATCH failed:',
            patchError
          );
          console.error('PATCH Error details:', {
            status: patchError.status,
            statusText: patchError.statusText,
            url: patchError.url,
            error: patchError.error,
          });

          // Log validation errors specifically
          if (patchError.error && patchError.error.errors) {
            console.error('PATCH Validation errors:', patchError.error.errors);
          }

          // If PATCH also fails, try a local simulation as last resort
          console.log(
            'AdminAccountService.updateAccountStatusFallback() - Trying local simulation...'
          );

          // Simulate the status update locally for UI purposes
          return this.getAccountById(id).pipe(
            map((account) => {
              // Create a simulated updated account
              const simulatedAccount = { ...account, status: status };

              console.log(
                'AdminAccountService.updateAccountStatusFallback() - Local simulation:',
                simulatedAccount
              );

              // Update local cache with simulated data
              const currentAccounts = this.accountsSubject.value;
              const index = currentAccounts.findIndex((a) => a.id === id);
              if (index !== -1) {
                currentAccounts[index] = simulatedAccount;
                this.accountsSubject.next([...currentAccounts]);
              }

              // Show warning to user
              setTimeout(() => {
                alert(`⚠️ Status updated locally only!

The account status has been changed to "${status}" in the interface, but this change may not be saved on the server.

This is because the backend doesn't currently support account status updates.

Please contact your system administrator to implement the backend functionality.`);
              }, 100);

              return simulatedAccount;
            }),
            catchError(() => {
              // If even simulation fails, return user-friendly error
              const enhancedError = {
                ...patchError,
                message: 'Account status update not supported by backend.',
                userMessage: `Unable to update account status. This may be due to:
• Backend doesn't support account status updates
• Account is in a state that prevents status changes
• Missing required permissions

Please contact your system administrator.`,
              };

              return throwError(() => enhancedError);
            })
          );
        })
      );
  }

  /**
   * Delete account
   */
  deleteAccount(id: string): Observable<void> {
    console.log('AdminAccountService.deleteAccount() - ID:', id);
    console.log(
      'AdminAccountService.deleteAccount() - URL:',
      `${this.API_URL}/${id}`
    );

    return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(
      tap(() => {
        console.log('AdminAccountService.deleteAccount() - Success');
        // Remove account from local cache
        const currentAccounts = this.accountsSubject.value;
        const filteredAccounts = currentAccounts.filter((a) => a.id !== id);
        this.accountsSubject.next(filteredAccounts);
      }),
      catchError((error) => {
        console.error('AdminAccountService.deleteAccount() - Error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get account statistics
   */
  getAccountStats(): Observable<AccountStats> {
    return this.http.get<AccountStats>(`${this.API_URL}/stats`);
  }

  /**
   * Export accounts to CSV
   */
  exportAccounts(params?: AccountSearchParams): Observable<Blob> {
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
    });
  }

  /**
   * Search accounts by term
   */
  searchAccounts(term: string): Observable<BankAccount[]> {
    const params = new HttpParams().set('search', term).set('size', '10');
    return this.http
      .get<AccountResponse>(this.API_URL, { params })
      .pipe(map((response) => response.content));
  }

  /**
   * Get current accounts from subject
   */
  getCurrentAccounts(): BankAccount[] {
    return this.accountsSubject.value;
  }

  /**
   * Clear accounts cache
   */
  clearCache(): void {
    this.accountsSubject.next([]);
  }
}
