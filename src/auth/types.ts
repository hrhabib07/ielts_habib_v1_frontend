export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: {
      id: string;
      email: string | null;
      role: "STUDENT" | "INSTRUCTOR" | "ADMIN";
      isVIP: boolean;
    };
  };
}

/** Step 1: send email only → backend sends OTP */
export interface RegisterRequest {
  email: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data: { email: string };
}

/** Step 2: verify OTP + set password → backend creates account and returns token */
export interface VerifyOtpRequest {
  email: string;
  otp: string;
  password: string;
  demoSessionId?: string | null;
}

export interface VerifyOtpResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    continuePath?: string | null;
    user: {
      id: string;
      email: string | null;
      role: "STUDENT" | "INSTRUCTOR" | "ADMIN";
    };
  };
}

export interface RequestPhoneOtpResponse {
  success: boolean;
  message: string;
  data: {
    phone: string;
    phoneDisplay: string;
    phoneMasked: string;
    expiresInSeconds: number;
    resendAfterSeconds: number;
  };
}

export interface VerifyPhoneOtpRequest {
  phone: string;
  otp: string;
  demoSessionId?: string | null;
}

export interface VerifyPhoneOtpResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    continuePath?: string | null;
    isNewUser?: boolean;
    hasPassword?: boolean;
    user: {
      id: string;
      email: string | null;
      phone: string | null;
      displayName?: string | null;
      role: "STUDENT" | "INSTRUCTOR" | "ADMIN";
    };
  };
}
