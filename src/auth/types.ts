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
      email: string;
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
}

export interface VerifyOtpResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: { id: string; email: string; role: "STUDENT" | "INSTRUCTOR" | "ADMIN" };
  };
}
