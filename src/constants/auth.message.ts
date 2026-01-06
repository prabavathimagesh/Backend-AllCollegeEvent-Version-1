export const AUTH_MESSAGES = {
  // Signup
  ROLE_NOT_FOUND: "Role not found in database",
  EMAIL_ALREADY_REGISTERED: "Email already registered",
  INVALID_TYPE: "Invalid type",
  USER_CREATED_SUCCESS: "user created successfully",
  ORG_CREATED_SUCCESS: "org created successfully",
  PUBLIC_EMAIL_MSG:
    "Public email domains are not allowed for organization signup",
  ORG_MAIL_MATCH: "Organization name must match the email domain",
  EMAIL_ALREADY_USER: "This email is already registered as a user",
  EMAIL_ALREADY_ORG: "This email is already registered as an organization",

  ORG_ALREADY_VERIFIED: "Organization already verified",
  USER_ALREADY_VERIFIED: "User already verified",
  USER_VERIFIED_SUCCESS: "User verified successfully",
  ACCOUNT_NOT_FOUND_BY_TOKEN: "Account not found for this verification token",

  // Login
  ACCOUNT_NOT_FOUND: "Account not found",
  ACCOUNT_DELETED: "Your account is deleted. Contact support.",
  ACCOUNT_INACTIVE: "Your account is inactive. Contact admin.",
  ORG_NOT_FOUND: "Organization account not found",
  ORG_DELETED: "Organization account deleted. Contact support.",
  ORG_NOT_VERIFIED:
    "Your organization is not verified yet. Please contact admin.",
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
  PASSWORD_REQUIRED: "Password Required",

  // Google Login
  GOOGLE_TOKEN_MISSING: "Google token missing",
  GOOGLE_LOGIN_FAILED: "Google login failed",
  DEFAULT_ROLE_NOT_FOUND: "Default role 'user' not found",

  // General
  INTERNAL_SERVER_ERROR: "Internal server error",

  // Update Profile
  TYPE_AND_ID_REQUIRED: "type and identity are required",
  IVALID_SOCIAL_LINK_FORMAT: "Invalid socialLinks format",
  INVALID_PROFILE_TYPE: "Invalid profile type",

  SOMETHING_WENT_WRONG: "Something went wrong",
};

export const PUBLIC_EMAIL_DOMAINS = [
  "gmail.com",
  "yahoo.com",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "icloud.com",
];

export const ORG = "org";
export const USER = "user";
