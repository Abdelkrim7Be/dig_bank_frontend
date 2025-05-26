import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Account,
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

  getAccountById(id: number): Observable<Account> {
    return this.http.get<Account>(
      `${this.apiUrl}${environment.endpoints.accounts}/${id}`
    );
  }

  getAccountsByCustomerId(customerId: number): Observable<Account[]> {
    return this.http.get<Account[]>(
      `${this.apiUrl}${environment.endpoints.accounts}/customer/${customerId}`
    );
  }

  // Customer-specific account endpoints
  getCustomerAccounts(): Observable<Account[]> {
    return this.http.get<Account[]>(
      `${this.apiUrl}${environment.endpoints.customer.accounts}`
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
      if (filter.accountId)
        params = params.set('accountId', filter.accountId.toString());
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

    return this.http.get<PagedResponse<Transaction>>(endpoint, { params });
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
}
