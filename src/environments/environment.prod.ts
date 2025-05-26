export const environment = {
  production: true,
  apiUrl: 'http://localhost:8085/api', // Update this for production deployment
  useMockApi: false,
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
};
