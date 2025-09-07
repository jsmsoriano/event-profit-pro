// Authentication error utilities
export const AUTH_ERROR_CODES = {
  EMAIL_NOT_CONFIRMED: 'email_not_confirmed',
  INVALID_CREDENTIALS: 'invalid_credentials',
  USER_NOT_FOUND: 'user_not_found',
  OVER_EMAIL_SEND_RATE_LIMIT: 'over_email_send_rate_limit'
} as const;

export const isAuthError = (error: any, codes: string[]): boolean => {
  if (!error) return false;
  
  // Check error code first
  if (error.code && codes.includes(error.code)) {
    return true;
  }
  
  // Fallback to message checking for backward compatibility
  if (error.message) {
    return codes.some(code => {
      switch (code) {
        case AUTH_ERROR_CODES.EMAIL_NOT_CONFIRMED:
          return error.message.includes('Email not confirmed');
        case AUTH_ERROR_CODES.INVALID_CREDENTIALS:
          return error.message.includes('Invalid login credentials');
        default:
          return false;
      }
    });
  }
  
  return false;
};

export const shouldRetryLogin = (error: any): boolean => {
  return isAuthError(error, [
    AUTH_ERROR_CODES.EMAIL_NOT_CONFIRMED,
    AUTH_ERROR_CODES.INVALID_CREDENTIALS
  ]);
};

// Development logging utility
export const logAuthAttempt = (action: string, email: string, success: boolean) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`Auth ${action}: ${email} - ${success ? 'Success' : 'Failed'}`);
  }
};