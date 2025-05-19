import { User } from '../../users/models/user.model';

export interface BankAccount {
  id: number;
  // Add more fields as needed based on your backend
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdDate: Date;
  createdBy: string;
  lastModifiedDate: Date;
  lastModifiedBy: string;
  owner?: User;
  bankAccounts?: BankAccount[];
}

export interface CreateCustomerDto {
  name: string;
  email: string;
  phone: string;
  address: string;
  userId?: number; // Optional owner user ID
}

export interface UpdateCustomerDto extends Partial<CreateCustomerDto> {}
