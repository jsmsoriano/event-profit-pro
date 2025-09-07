// Test account configuration - keep separate from main component
export const TEST_ACCOUNTS = {
  customer: {
    email: 'testcustomer@gmail.com',
    password: 'TestPassword123!',
    firstName: 'Test',
    lastName: 'Customer'
  },
  admin: {
    email: 'testadmin@gmail.com', 
    password: 'TestPassword123!',
    firstName: 'Test',
    lastName: 'Admin'
  }
} as const;

export type TestAccountRole = keyof typeof TEST_ACCOUNTS;
