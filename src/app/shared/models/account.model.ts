export interface Account {
  id: number;
  accountNumber: string;
  accountType: AccountType;
  balance: number;
  currency: string;
  status: AccountStatus;
  customerId: number;
  customerName?: string;
  createdDate: string;
  lastModifiedDate: string;
  interestRate?: number;
  overdraftLimit?: number;
  // Additional fields to match Spring Boot entity
  createdBy?: string;
  lastModifiedBy?: string;
  version?: number;
}

export interface CreateAccountDto {
  accountType: AccountType;
  customerId: number;
  initialDeposit: number;
  currency?: string;
}

export interface UpdateAccountDto {
  status?: AccountStatus;
  interestRate?: number;
  overdraftLimit?: number;
}

export enum AccountType {
  SAVINGS = 'SAVINGS',
  CHECKING = 'CHECKING',
  CURRENT = 'CURRENT', // Alternative name for CHECKING used in some backends
  BUSINESS = 'BUSINESS',
  INVESTMENT = 'INVESTMENT',
}

export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  CLOSED = 'CLOSED',
}

export interface AccountSummary {
  totalAccounts: number;
  totalBalance: number;
  accountsByType: { [key: string]: number };
  recentTransactions: Transaction[];
}

export interface Transaction {
  id: number;
  accountId: number;
  accountNumber?: string;
  type: TransactionType;
  amount: number;
  balance: number;
  description: string;
  reference?: string;
  status: TransactionStatus;
  createdDate: string;
  processedDate?: string;
  fromAccountId?: number;
  toAccountId?: number;
  fromAccountNumber?: string;
  toAccountNumber?: string;
}

export interface CreateTransactionDto {
  accountId: number;
  type: TransactionType;
  amount: number;
  description: string;
  reference?: string;
  toAccountId?: number; // For transfers
}

export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
  TRANSFER = 'TRANSFER',
  PAYMENT = 'PAYMENT',
  FEE = 'FEE',
  INTEREST = 'INTEREST',
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export interface TransferRequest {
  fromAccountId: number;
  toAccountId: number;
  amount: number;
  description: string;
  reference?: string;
}

export interface DepositRequest {
  accountId: number;
  amount: number;
  description: string;
  reference?: string;
}

export interface WithdrawalRequest {
  accountId: number;
  amount: number;
  description: string;
  reference?: string;
}

export interface TransactionFilter {
  accountId?: number;
  type?: TransactionType;
  status?: TransactionStatus;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}
