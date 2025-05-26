export interface User {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  status: UserStatus;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
  // Additional properties for admin management
  accountCount?: number;
  totalBalance?: number;
  selected?: boolean;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  // Optional fields for customer creation
  name?: string;
  phone?: string;
  address?: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  user: User;
  expiresIn: number;
}

export interface JwtPayload {
  sub: string;
  username: string;
  role: string;
  iat: number;
  exp: number;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  CUSTOMER = 'CUSTOMER',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ProfileUpdateRequest {
  firstName: string;
  lastName: string;
  email: string;
}
