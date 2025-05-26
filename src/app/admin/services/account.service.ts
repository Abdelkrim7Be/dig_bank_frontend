import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
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
    return this.http.post<BankAccount>(this.API_URL, accountData).pipe(
      tap((newAccount) => {
        const currentAccounts = this.accountsSubject.value;
        this.accountsSubject.next([...currentAccounts, newAccount]);
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
    const params = new HttpParams()
      .set('initialBalance', initialBalance.toString())
      .set('overDraft', overDraft.toString())
      .set('customerId', customerId.toString());

    return this.http.post<BankAccount>(`${this.API_URL}/current`, null, { params }).pipe(
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
    const params = new HttpParams()
      .set('initialBalance', initialBalance.toString())
      .set('interestRate', interestRate.toString())
      .set('customerId', customerId.toString());

    return this.http.post<BankAccount>(`${this.API_URL}/saving`, null, { params }).pipe(
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
    return this.http
      .patch<BankAccount>(`${this.API_URL}/${id}/status`, { status })
      .pipe(
        tap((updatedAccount) => {
          const currentAccounts = this.accountsSubject.value;
          const index = currentAccounts.findIndex((a) => a.id === id);
          if (index !== -1) {
            currentAccounts[index] = updatedAccount;
            this.accountsSubject.next([...currentAccounts]);
          }
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
