// types.ts
export interface ApiResponse<T> {
  data?: T;
  isSuccess: boolean;
  error?: {
    code: AppErrorCode;
    message: string;
  };
}

export type AppErrorCode =
  | "USER_NOT_FOUND"
  | "UNAUTHORIZED"
  | "USER_NOT_CONFIRMED"
  | "PASSWORD_RESET_REQUIRED"
  | "TOO_MANY_REQUESTS"
  | "INVALID_REQUEST"
  | "INTERNAL_ERROR"
  | "USER_EXISTS"
  | "INVALID_PASSWORD"
  | "INVALID_CODE"
  | "EXPIRED_CODE"
  | "LIMIT_EXCEEDED"
  | "MFA_FAILED"
  | "MFA_REQUIRED"
  | "INVALID_SESSION"
  | "DYNAMODB_ERROR";

export function createApiResponse<T>(
  data?: T,
  error?: { code: AppErrorCode; message: string }
): ApiResponse<T> {
  return {
    data,
    isSuccess: !error,
    error,
  };
}
