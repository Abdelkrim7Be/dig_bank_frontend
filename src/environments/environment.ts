export const environment = {
  production: false,
  apiUrl: 'http://localhost:8085/api',
  useMockApi: false, // Set to true to use mock data during development
  appName: 'Digital Banking',
  version: '1.0.0',
  tokenKey: 'digital-banking-token',
  // Backend endpoint configuration matching TODO.md specifications
  endpoints: {
    // Public endpoints
    auth: {
      login: '/auth/login',
      register: '/auth/register',
      refresh: '/auth/refresh',
      changePassword: '/auth/change-password',
      profile: '/auth/profile',
    },
    // Admin only endpoints
    admin: {
      users: '/admin/users',
      customers: '/admin/customers',
      accounts: '/admin/accounts',
      usersByRole: '/admin/users/role',
      userStatus: '/admin/users',
      dashboard: '/admin/dashboard',
    },
    // Customer endpoints
    customer: {
      accounts: '/customer/accounts',
      transactions: '/customer/transactions',
      dashboard: '/customer/dashboard',
    },
    // Admin + Customer endpoints
    customers: '/customers',
    accounts: '/accounts',
    transactions: '/transactions',
    dashboard: '/dashboard',
    // Banking operations
    operations: {
      debit: '/accounts',
      credit: '/accounts',
      transfer: '/accounts',
      history: '/accounts',
    },
  },
  // Test credentials from TODO.md
  testCredentials: {
    admin: { username: 'admin', password: 'admin123' },
    customers: [
      { username: 'abdelkrim', password: 'password123' },
      { username: 'soufiane', password: 'password123' },
      { username: 'mohamed', password: 'password123' },
    ],
  },
};
