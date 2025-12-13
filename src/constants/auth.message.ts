export const AUTH_MESSAGES = {
  // Signup
  ROLE_NOT_FOUND: "Role not found in database",
  EMAIL_ALREADY_REGISTERED: "Email already registered",
  INVALID_TYPE: "Invalid type",
  USER_CREATED_SUCCESS: "user created successfully",
  ORG_CREATED_SUCCESS: "org created successfully",

  // Login
  ACCOUNT_NOT_FOUND: "Account not found",
  ACCOUNT_DELETED: "Your account is deleted. Contact support.",
  ACCOUNT_INACTIVE: "Your account is inactive. Contact admin.",
  ORG_NOT_FOUND: "Organization account not found",
  ORG_DELETED: "Organization account deleted. Contact support.",
  ORG_NOT_VERIFIED: "Your organization is not verified yet. Please contact admin.",
  INVALID_PASSWORD: "Invalid password",
  LOGIN_SUCCESS: "login successfully",

  // Verify Org
  TOKEN_MISSING: "Token missing",
  INVALID_OR_EXPIRED_TOKEN: "Invalid or expired token",
  ORG_NOT_FOUND_BY_TOKEN: "Organization not found",
  ORG_VERIFIED_SUCCESS: "Account verified successfully",

  // Forgot Password
  EMAIL_REQUIRED: "Email is required",
  EMAIL_NOT_FOUND: "Email not found",
  OTP_SENT: "OTP sent to email",
  OTP_RESENT: "OTP resent successfully",

  // OTP
  INVALID_OTP: "Invalid OTP",
  OTP_EXPIRED: "OTP expired",
  OTP_VERIFIED: "OTP verified successfully",

  // Reset Password
  PASSWORD_RESET_SUCCESS: "Password reset successful",
  PASSWORD_REQUIRED:"Password Required",

  // Google Login
  GOOGLE_TOKEN_MISSING: "Google token missing",
  GOOGLE_LOGIN_FAILED: "Google login failed",
  DEFAULT_ROLE_NOT_FOUND: "Default role 'user' not found",

  // General
  INTERNAL_SERVER_ERROR: "Internal server error",
};
