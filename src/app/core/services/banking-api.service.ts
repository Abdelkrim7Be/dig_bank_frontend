import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  CustomerDTO,
  BankAccountDTO,
  CurrentBankAccountDTO,
  SavingBankAccountDTO,
  AccountOperationDTO,
  BankingStatsDTO,
  AccountsSummaryDTO,
  CustomersSummaryDTO,
  PageResponse,
  CustomerSearchRequest,
  AccountSearchRequest,
  UserDTO,
  UserStatusUpdateRequest,
  CreateCurrentAccountRequest,
  CreateSavingAccountRequest,
  TransactionHistoryRequest,
  TransactionHistoryResponse,
  HealthCheckResponse,
  DebitRequest,
  CreditRequest,
  TransferRequest,
} from '../../shared/models/banking-dtos.model';

/**
 * Comprehensive Banking API Service
 * Implements all endpoints specified in TODO.md
 */
@Injectable({
  providedIn: 'root',
})
export class BankingApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ==================== AUTHENTICATION ====================

  /**
   * User login with JWT authentication
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.apiUrl}${environment.endpoints.auth.login}`,
      credentials
    );
  }

  /**
   * User registration with role selection
   */
  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.apiUrl}${environment.endpoints.auth.register}`,
      userData
    );
  }

  // ==================== ADMIN ONLY ENDPOINTS ====================

  /**
   * Get all users (Admin only)
   */
  getAllUsers(): Observable<UserDTO[]> {
    return this.http.get<UserDTO[]>(
      `${this.apiUrl}${environment.endpoints.admin.users}`
    );
  }

  /**
   * Get all customers (Admin only)
   */
  getAllCustomersAdmin(): Observable<CustomerDTO[]> {
    return this.http.get<CustomerDTO[]>(
      `${this.apiUrl}${environment.endpoints.admin.customers}`
    );
  }

  /**
   * Get users by role (Admin only)
   */
  getUsersByRole(role: 'ADMIN' | 'CUSTOMER'): Observable<UserDTO[]> {
    return this.http.get<UserDTO[]>(
      `${this.apiUrl}${environment.endpoints.admin.usersByRole}/${role}`
    );
  }

  /**
   * Enable/disable user (Admin only)
   */
  updateUserStatus(
    userId: number,
    statusUpdate: UserStatusUpdateRequest
  ): Observable<UserDTO> {
    return this.http.put<UserDTO>(
      `${this.apiUrl}${environment.endpoints.admin.userStatus}/${userId}/status`,
      statusUpdate
    );
  }

  // ==================== CUSTOMER MANAGEMENT ====================

  /**
   * Get all customers
   */
  getCustomers(): Observable<CustomerDTO[]> {
    return this.http.get<CustomerDTO[]>(
      `${this.apiUrl}${environment.endpoints.customers}`
    );
  }

  /**
   * Create new customer
   */
  createCustomer(customer: CustomerDTO): Observable<CustomerDTO> {
    return this.http.post<CustomerDTO>(
      `${this.apiUrl}${environment.endpoints.customers}`,
      customer
    );
  }

  /**
   * Get customer by ID
   */
  getCustomerById(id: number): Observable<CustomerDTO> {
    return this.http.get<CustomerDTO>(
      `${this.apiUrl}${environment.endpoints.customers}/${id}`
    );
  }

  /**
   * Update customer
   */
  updateCustomer(id: number, customer: CustomerDTO): Observable<CustomerDTO> {
    return this.http.put<CustomerDTO>(
      `${this.apiUrl}${environment.endpoints.customers}/${id}`,
      customer
    );
  }

  /**
   * Delete customer
   */
  deleteCustomer(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}${environment.endpoints.customers}/${id}`
    );
  }

  /**
   * Get paginated customers
   */
  getCustomersPage(
    page: number = 0,
    size: number = 10
  ): Observable<PageResponse<CustomerDTO>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<CustomerDTO>>(
      `${this.apiUrl}${environment.endpoints.customers}/page`,
      { params }
    );
  }

  /**
   * Search customers
   */
  searchCustomers(
    searchRequest: CustomerSearchRequest
  ): Observable<PageResponse<CustomerDTO>> {
    let params = new HttpParams();
    if (searchRequest.name) params = params.set('name', searchRequest.name);
    if (searchRequest.email) params = params.set('email', searchRequest.email);
    if (searchRequest.phone) params = params.set('phone', searchRequest.phone);
    if (searchRequest.page !== undefined)
      params = params.set('page', searchRequest.page.toString());
    if (searchRequest.size !== undefined)
      params = params.set('size', searchRequest.size.toString());

    return this.http.get<PageResponse<CustomerDTO>>(
      `${this.apiUrl}${environment.endpoints.customers}/search`,
      { params }
    );
  }

  // ==================== ACCOUNT MANAGEMENT ====================

  /**
   * Get all accounts
   */
  getAccounts(): Observable<BankAccountDTO[]> {
    return this.http.get<BankAccountDTO[]>(
      `${this.apiUrl}${environment.endpoints.accounts}`
    );
  }

  /**
   * Get account by ID
   */
  getAccountById(id: string): Observable<BankAccountDTO> {
    return this.http.get<BankAccountDTO>(
      `${this.apiUrl}${environment.endpoints.accounts}/${id}`
    );
  }

  /**
   * Get customer accounts
   */
  getCustomerAccounts(customerId: number): Observable<BankAccountDTO[]> {
    return this.http.get<BankAccountDTO[]>(
      `${this.apiUrl}${environment.endpoints.accounts}/customer/${customerId}`
    );
  }

  /**
   * Create current account
   */
  createCurrentAccount(
    initialBalance: number,
    overDraft: number,
    customerId: number
  ): Observable<CurrentBankAccountDTO> {
    const params = new HttpParams()
      .set('initialBalance', initialBalance.toString())
      .set('overDraft', overDraft.toString())
      .set('customerId', customerId.toString());
    return this.http.post<CurrentBankAccountDTO>(
      `${this.apiUrl}${environment.endpoints.accounts}/current`,
      null,
      { params }
    );
  }

  /**
   * Create saving account
   */
  createSavingAccount(
    initialBalance: number,
    interestRate: number,
    customerId: number
  ): Observable<SavingBankAccountDTO> {
    const params = new HttpParams()
      .set('initialBalance', initialBalance.toString())
      .set('interestRate', interestRate.toString())
      .set('customerId', customerId.toString());
    return this.http.post<SavingBankAccountDTO>(
      `${this.apiUrl}${environment.endpoints.accounts}/saving`,
      null,
      { params }
    );
  }

  // ==================== BANKING OPERATIONS ====================

  /**
   * Withdraw money (Debit)
   */
  debit(
    accountId: string,
    amount: number,
    description: string
  ): Observable<void> {
    const params = new HttpParams()
      .set('amount', amount.toString())
      .set('description', description);
    return this.http.post<void>(
      `${this.apiUrl}${environment.endpoints.accounts}/${accountId}/debit`,
      null,
      { params }
    );
  }

  /**
   * Deposit money (Credit)
   */
  credit(
    accountId: string,
    amount: number,
    description: string
  ): Observable<void> {
    const params = new HttpParams()
      .set('amount', amount.toString())
      .set('description', description);
    return this.http.post<void>(
      `${this.apiUrl}${environment.endpoints.accounts}/${accountId}/credit`,
      null,
      { params }
    );
  }

  /**
   * Transfer money (updated to use request body)
   */
  transfer(transferRequest: any): Observable<void> {
    return this.http.post<void>(
      `${this.apiUrl}${environment.endpoints.accounts}/transfer`,
      transferRequest
    );
  }

  /**
   * Get account history
   */
  getAccountHistory(
    accountId: string,
    page: number = 0,
    size: number = 10
  ): Observable<TransactionHistoryResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<TransactionHistoryResponse>(
      `${this.apiUrl}${environment.endpoints.accounts}/${accountId}/history`,
      { params }
    );
  }

  // ==================== ACCOUNT SELECTION ====================

  /**
   * Get all accounts for selection dropdown
   */
  getAccountsForSelection(): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}${environment.endpoints.accounts}/selection`
    );
  }

  /**
   * Get active accounts for selection dropdown
   */
  getActiveAccountsForSelection(): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}${environment.endpoints.accounts}/selection/active`
    );
  }

  // ==================== DASHBOARD ====================

  /**
   * Get banking statistics
   */
  getBankingStats(): Observable<BankingStatsDTO> {
    return this.http.get<BankingStatsDTO>(
      `${this.apiUrl}${environment.endpoints.dashboard}/stats`
    );
  }

  /**
   * Get accounts summary
   */
  getAccountsSummary(): Observable<AccountsSummaryDTO> {
    return this.http.get<AccountsSummaryDTO>(
      `${this.apiUrl}${environment.endpoints.dashboard}/accounts-summary`
    );
  }

  /**
   * Get customers summary
   */
  getCustomersSummary(): Observable<CustomersSummaryDTO> {
    return this.http.get<CustomersSummaryDTO>(
      `${this.apiUrl}${environment.endpoints.dashboard}/customers-summary`
    );
  }

  /**
   * Health check
   */
  getHealthCheck(): Observable<HealthCheckResponse> {
    return this.http.get<HealthCheckResponse>(
      `${this.apiUrl}${environment.endpoints.dashboard}/health`
    );
  }
}
