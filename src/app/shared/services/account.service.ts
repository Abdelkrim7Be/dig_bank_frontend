import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  Account,
  BankAccount,
  CreateAccountDto,
  UpdateAccountDto,
  AccountSummary,
  Transaction,
  CreateTransactionDto,
  TransferRequest,
  DepositRequest,
  WithdrawalRequest,
  TransactionFilter,
  PagedResponse,
} from '../models/account.model';
import { AuthService } from '../../auth/services/auth.service';
import { UserRole } from '../../auth/models/auth.model';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private authService: AuthService) {}

  // Account Management
  getAccounts(): Observable<Account[]> {
    return this.http.get<Account[]>(
      `${this.apiUrl}${environment.endpoints.accounts}`
    );
  }

  getAccountById(id: string | number): Observable<Account> {
    return this.http.get<Account>(
      `${this.apiUrl}${environment.endpoints.accounts}/${id}`
    );
  }

  getAccountsByCustomerId(customerId: number): Observable<Account[]> {
    return this.http.get<Account[]>(
      `${this.apiUrl}${environment.endpoints.accounts}/customer/${customerId}`
    );
  }

  createAccount(account: CreateAccountDto): Observable<Account> {
    return this.http.post<Account>(
      `${this.apiUrl}${environment.endpoints.accounts}`,
      account
    );
  }

  updateAccount(id: number, account: UpdateAccountDto): Observable<Account> {
    return this.http.put<Account>(
      `${this.apiUrl}${environment.endpoints.accounts}/${id}`,
      account
    );
  }

  deleteAccount(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}${environment.endpoints.accounts}/${id}`
    );
  }

  getAccountSummary(): Observable<AccountSummary> {
    return this.http.get<AccountSummary>(
      `${this.apiUrl}${environment.endpoints.accounts}/summary`
    );
  }

  // Customer account summary
  getCustomerAccountSummary(): Observable<AccountSummary> {
    return this.http.get<AccountSummary>(
      `${this.apiUrl}${environment.endpoints.customer.accounts}/summary`
    );
  }

  // Transaction Management
  getTransactions(
    filter?: TransactionFilter
  ): Observable<PagedResponse<Transaction>> {
    let params = new HttpParams();

    if (filter) {
      if (filter.accountId !== undefined && filter.accountId !== null) {
        // Handle both string and number accountIds
        const accountIdStr =
          typeof filter.accountId === 'string'
            ? filter.accountId.trim()
            : filter.accountId.toString();

        // Only add parameter if the trimmed string is not empty
        if (accountIdStr.trim() !== '') {
          params = params.set('accountId', accountIdStr);
        }
      }
      if (filter.type) {
        const typeStr =
          typeof filter.type === 'string'
            ? filter.type.trim()
            : String(filter.type);
        if (typeStr !== '') {
          params = params.set('type', typeStr);
        }
      }
      if (filter.status) {
        const statusStr =
          typeof filter.status === 'string'
            ? filter.status.trim()
            : String(filter.status);
        if (statusStr !== '') {
          params = params.set('status', statusStr);
        }
      }
      if (filter.startDate && filter.startDate.trim() !== '') {
        params = params.set('startDate', filter.startDate.trim());
      }
      if (filter.endDate && filter.endDate.trim() !== '') {
        params = params.set('endDate', filter.endDate.trim());
      }
      if (filter.minAmount !== undefined && filter.minAmount !== null) {
        params = params.set('minAmount', filter.minAmount.toString());
      }
      if (filter.maxAmount !== undefined && filter.maxAmount !== null) {
        params = params.set('maxAmount', filter.maxAmount.toString());
      }
      if (filter.page !== undefined && filter.page !== null) {
        params = params.set('page', filter.page.toString());
      }
      if (filter.size !== undefined && filter.size !== null) {
        params = params.set('size', filter.size.toString());
      }
      if (filter.sortBy && filter.sortBy.trim() !== '') {
        params = params.set('sortBy', filter.sortBy.trim());
      }
      if (filter.sortDirection) {
        params = params.set('sortDirection', filter.sortDirection);
      }
    }

    // Determine the correct endpoint based on user role
    const currentUser = this.authService.getCurrentUser();
    let endpoint: string;

    if (currentUser?.role === UserRole.ADMIN) {
      endpoint = `${this.apiUrl}/admin/transactions`;
    } else if (currentUser?.role === UserRole.CUSTOMER) {
      endpoint = `${this.apiUrl}/customer/transactions`;
    } else {
      // Fallback - shouldn't happen if user is authenticated
      endpoint = `${this.apiUrl}/admin/transactions`;
    }

    console.log('getTransactions - User role:', currentUser?.role);
    console.log('getTransactions - Using endpoint:', endpoint);
    console.log('getTransactions - Parameters:', params.toString());
    console.log(
      'getTransactions - Full URL:',
      `${endpoint}?${params.toString()}`
    );

    return this.http.get<PagedResponse<Transaction>>(endpoint, { params }).pipe(
      tap((response) => {
        console.log('getTransactions - Success response:', response);
      }),
      catchError((error) => {
        console.error('getTransactions - Error details:', {
          status: error.status,
          statusText: error.statusText,
          url: error.url,
          error: error.error,
          message: error.message,
        });

        // Log backend error details if available
        if (error.error) {
          console.error('getTransactions - Backend error:', error.error);
          if (error.error.message) {
            console.error(
              'getTransactions - Backend message:',
              error.error.message
            );
          }
          if (error.error.details) {
            console.error(
              'getTransactions - Backend details:',
              error.error.details
            );
          }
          if (error.error.trace) {
            console.error(
              'getTransactions - Backend stack trace:',
              error.error.trace
            );
          }
        }

        // If customer endpoint returns 403, try fallback to general transactions endpoint
        if (error.status === 403 && currentUser?.role === UserRole.CUSTOMER) {
          console.log(
            'getTransactions - Customer endpoint returned 403, trying fallback...'
          );
          const fallbackEndpoint = `${this.apiUrl}/transactions`;
          console.log(
            'getTransactions - Using fallback endpoint:',
            fallbackEndpoint
          );

          return this.http
            .get<PagedResponse<Transaction>>(fallbackEndpoint, { params })
            .pipe(
              tap((response) => {
                console.log('getTransactions - Fallback success:', response);
              }),
              catchError((fallbackError) => {
                console.error(
                  'getTransactions - Fallback also failed:',
                  fallbackError
                );
                return throwError(() => error); // Return original error
              })
            );
        }

        // Re-throw the error for component handling
        return throwError(() => error);
      })
    );
  }

  getTransactionById(id: number): Observable<Transaction> {
    // Determine the correct endpoint based on user role
    const currentUser = this.authService.getCurrentUser();
    let endpoint: string;

    if (currentUser?.role === UserRole.ADMIN) {
      endpoint = `${this.apiUrl}/admin/transactions/${id}`;
    } else if (currentUser?.role === UserRole.CUSTOMER) {
      endpoint = `${this.apiUrl}/customer/transactions/${id}`;
    } else {
      // Fallback - shouldn't happen if user is authenticated
      endpoint = `${this.apiUrl}/admin/transactions/${id}`;
    }

    return this.http.get<Transaction>(endpoint);
  }

  getAccountTransactions(
    accountId: number,
    filter?: TransactionFilter
  ): Observable<PagedResponse<Transaction>> {
    let params = new HttpParams();

    if (filter) {
      if (filter.type) params = params.set('type', filter.type);
      if (filter.status) params = params.set('status', filter.status);
      if (filter.startDate) params = params.set('startDate', filter.startDate);
      if (filter.endDate) params = params.set('endDate', filter.endDate);
      if (filter.minAmount)
        params = params.set('minAmount', filter.minAmount.toString());
      if (filter.maxAmount)
        params = params.set('maxAmount', filter.maxAmount.toString());
      if (filter.page) params = params.set('page', filter.page.toString());
      if (filter.size) params = params.set('size', filter.size.toString());
      if (filter.sortBy) params = params.set('sortBy', filter.sortBy);
      if (filter.sortDirection)
        params = params.set('sortDirection', filter.sortDirection);
    }

    return this.http.get<PagedResponse<Transaction>>(
      `${this.apiUrl}/accounts/${accountId}/transactions`,
      { params }
    );
  }

  // Banking Operations
  deposit(request: DepositRequest): Observable<Transaction> {
    return this.http.post<Transaction>(
      `${this.apiUrl}${environment.endpoints.transactions}/deposit`,
      request
    );
  }

  withdraw(request: WithdrawalRequest): Observable<Transaction> {
    return this.http.post<Transaction>(
      `${this.apiUrl}${environment.endpoints.transactions}/withdraw`,
      request
    );
  }

  transfer(request: TransferRequest): Observable<Transaction> {
    return this.http.post<Transaction>(
      `${this.apiUrl}${environment.endpoints.transactions}/transfer`,
      request
    );
  }

  createTransaction(
    transaction: CreateTransactionDto
  ): Observable<Transaction> {
    return this.http.post<Transaction>(
      `${this.apiUrl}${environment.endpoints.transactions}`,
      transaction
    );
  }

  // Customer-specific transaction operations
  customerDeposit(request: DepositRequest): Observable<Transaction> {
    return this.http.post<Transaction>(
      `${this.apiUrl}${environment.endpoints.customer.transactions}/deposit`,
      request
    );
  }

  customerWithdraw(request: WithdrawalRequest): Observable<Transaction> {
    return this.http.post<Transaction>(
      `${this.apiUrl}${environment.endpoints.customer.transactions}/withdraw`,
      request
    );
  }

  customerTransfer(request: TransferRequest): Observable<Transaction> {
    return this.http.post<Transaction>(
      `${this.apiUrl}${environment.endpoints.customer.transactions}/transfer`,
      request
    );
  }

  // Account Balance
  getAccountBalance(
    accountId: number
  ): Observable<{ balance: number; currency: string }> {
    return this.http.get<{ balance: number; currency: string }>(
      `${this.apiUrl}/accounts/${accountId}/balance`
    );
  }

  // Account Statement
  getAccountStatement(
    accountId: number,
    startDate: string,
    endDate: string
  ): Observable<Blob> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);

    return this.http.get(`${this.apiUrl}/accounts/${accountId}/statement`, {
      params,
      responseType: 'blob',
    });
  }

  // Customer-specific account methods
  getCustomerAccounts(): Observable<BankAccount[]> {
    const endpoint = `${this.apiUrl}/customer/accounts`;
    console.log('=== getCustomerAccounts DEBUG START ===');
    console.log('Endpoint:', endpoint);
    console.log(
      'Current token:',
      this.authService.getToken()?.substring(0, 30) + '...'
    );
    console.log('Token exists:', !!this.authService.getToken());
    console.log('User authenticated:', this.authService.isAuthenticated());
    console.log('Current user:', this.authService.getCurrentUser());
    console.log(
      'LocalStorage token:',
      localStorage.getItem('digital-banking-token')?.substring(0, 30) + '...'
    );

    return this.http.get<BankAccount[]>(endpoint).pipe(
      tap((accounts) => {
        console.log('✅ getCustomerAccounts - SUCCESS:', accounts);
        console.log('Number of accounts:', accounts.length);
        console.log('=== getCustomerAccounts DEBUG SUCCESS END ===');
      }),
      catchError((error) => {
        console.error('❌ getCustomerAccounts - ERROR:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        console.error('Error URL:', error.url);
        console.error('Error headers:', error.headers);
        console.log('=== getCustomerAccounts DEBUG ERROR END ===');
        return throwError(() => error);
      })
    );
  }

  getCustomerAccountById(accountId: string): Observable<BankAccount> {
    const endpoint = `${this.apiUrl}/customer/accounts/${accountId}`;
    console.log('getCustomerAccountById - Using endpoint:', endpoint);

    return this.http.get<BankAccount>(endpoint).pipe(
      tap((account) => {
        console.log('getCustomerAccountById - Success:', account);
      }),
      catchError((error) => {
        console.error('getCustomerAccountById - Error:', error);
        return throwError(() => error);
      })
    );
  }

  // Alternative method for customer transactions with multiple fallbacks
  getCustomerTransactions(
    filter?: TransactionFilter
  ): Observable<PagedResponse<Transaction>> {
    let params = new HttpParams();

    if (filter) {
      if (filter.accountId !== undefined && filter.accountId !== null) {
        const accountIdStr =
          typeof filter.accountId === 'string'
            ? filter.accountId.trim()
            : filter.accountId.toString();
        if (accountIdStr.trim() !== '') {
          params = params.set('accountId', accountIdStr);
        }
      }
      if (filter.type) {
        const typeStr =
          typeof filter.type === 'string'
            ? filter.type.trim()
            : String(filter.type);
        if (typeStr !== '') {
          params = params.set('type', typeStr);
        }
      }
      if (filter.status) {
        const statusStr =
          typeof filter.status === 'string'
            ? filter.status.trim()
            : String(filter.status);
        if (statusStr !== '') {
          params = params.set('status', statusStr);
        }
      }
      if (filter.startDate && filter.startDate.trim() !== '') {
        params = params.set('startDate', filter.startDate.trim());
      }
      if (filter.endDate && filter.endDate.trim() !== '') {
        params = params.set('endDate', filter.endDate.trim());
      }
      if (filter.minAmount !== undefined && filter.minAmount !== null) {
        params = params.set('minAmount', filter.minAmount.toString());
      }
      if (filter.maxAmount !== undefined && filter.maxAmount !== null) {
        params = params.set('maxAmount', filter.maxAmount.toString());
      }
      if (filter.page !== undefined && filter.page !== null) {
        params = params.set('page', filter.page.toString());
      }
      if (filter.size !== undefined && filter.size !== null) {
        params = params.set('size', filter.size.toString());
      }
      if (filter.sortBy && filter.sortBy.trim() !== '') {
        params = params.set('sortBy', filter.sortBy.trim());
      }
      if (filter.sortDirection) {
        params = params.set('sortDirection', filter.sortDirection);
      }
    }

    // Try customer-specific endpoint first
    const customerEndpoint = `${this.apiUrl}/customer/transactions`;
    console.log(
      'getCustomerTransactions - Trying customer endpoint:',
      customerEndpoint
    );

    return this.http.get<any>(customerEndpoint, { params }).pipe(
      map((backendResponse) => {
        console.log(
          'getCustomerTransactions - Raw backend response:',
          backendResponse
        );

        // Map backend response structure to frontend expected structure
        const mappedResponse: PagedResponse<Transaction> = {
          content: backendResponse.transactions || [], // Backend uses "transactions" field
          totalElements: backendResponse.totalElements || 0,
          totalPages: backendResponse.totalPages || 0,
          size: backendResponse.size || 10,
          number: backendResponse.currentPage || 0, // Backend uses "currentPage"
          first: (backendResponse.currentPage || 0) === 0,
          last:
            (backendResponse.currentPage || 0) >=
            (backendResponse.totalPages || 1) - 1,
        };

        console.log(
          'getCustomerTransactions - Mapped response:',
          mappedResponse
        );
        return mappedResponse;
      }),
      tap((response) => {
        console.log(
          'getCustomerTransactions - Customer endpoint success:',
          response
        );
      }),
      catchError((error) => {
        console.log(
          'getCustomerTransactions - Customer endpoint failed, trying general endpoint...'
        );

        // Fallback to general transactions endpoint
        const generalEndpoint = `${this.apiUrl}/transactions`;
        console.log(
          'getCustomerTransactions - Trying general endpoint:',
          generalEndpoint
        );

        return this.http
          .get<PagedResponse<Transaction>>(generalEndpoint, { params })
          .pipe(
            tap((response) => {
              console.log(
                'getCustomerTransactions - General endpoint success:',
                response
              );
            }),
            catchError((generalError) => {
              console.error(
                'getCustomerTransactions - All endpoints failed:',
                generalError
              );
              return throwError(() => error); // Return original error
            })
          );
      })
    );
  }
}
