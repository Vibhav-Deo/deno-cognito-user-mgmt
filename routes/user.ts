import {
  signUp,
  signIn,
  signOut,
  confirmAccount,
  forgotPassword,
  confirmForgotPassword,
  verifyEmailMfa,
} from "../services/cognito.ts";
import {
  createApiResponse,
  AppErrorCode,
  ApiResponse,
} from "../utils/apiResponse.ts";

// Helper function to map error codes to HTTP status
function getStatusCodeFromErrorCode(code?: AppErrorCode): number {
  switch (code) {
    case "USER_NOT_FOUND":
      return 404;
    case "UNAUTHORIZED":
    case "MFA_FAILED":
    case "INVALID_SESSION":
      return 401;
    case "INVALID_REQUEST":
    case "INVALID_PASSWORD":
    case "INVALID_CODE":
    case "EXPIRED_CODE":
    case "USER_EXISTS":
      return 400;
    case "TOO_MANY_REQUESTS":
      return 429;
    case "USER_NOT_CONFIRMED":
    case "PASSWORD_RESET_REQUIRED":
      return 403;
    default:
      return 500;
  }
}

// Helper to create response with proper status code
function createResponse<T>(apiResponse: ApiResponse<T>): Response {
  const status = apiResponse.isSuccess
    ? 200
    : getStatusCodeFromErrorCode(apiResponse.error?.code) || 500;

  return Response.json(apiResponse, { status });
}

export async function handleSignOut(req: Request): Promise<Response> {
  try {
    const accesstoken = req.headers.get("Authorization")?.split(" ")[1] || "";
    const result = await signOut(accesstoken);
    return createResponse(result);
  } catch (error) {
    console.error("SignOut error:", error);
    return createResponse(
      createApiResponse(undefined, {
        code: "INTERNAL_ERROR",
        message: "Failed to sign out",
      })
    );
  }
}

export async function handleVerifyAccount(req: Request): Promise<Response> {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return createResponse(
        createApiResponse(undefined, {
          code: "INVALID_REQUEST",
          message: "Email and verification code are required",
        })
      );
    }

    const result = await confirmAccount(email, code);
    return createResponse(result);
  } catch (error) {
    console.error("VerifyAccount error:", error);
    return createResponse(
      createApiResponse(undefined, {
        code: "INTERNAL_ERROR",
        message: "Account verification failed",
      })
    );
  }
}

export async function handleVerifyEmailMfa(req: Request): Promise<Response> {
  try {
    const { email, code, session } = await req.json();

    if (!email || !code || !session) {
      return createResponse(
        createApiResponse(undefined, {
          code: "INVALID_REQUEST",
          message: "Email, code, and session are required",
        })
      );
    }

    const result = await verifyEmailMfa(email, code, session);
    return createResponse(result);
  } catch (error) {
    console.error("VerifyEmailMfa error:", error);
    return createResponse(
      createApiResponse(undefined, {
        code: "INTERNAL_ERROR",
        message: "MFA verification failed",
      })
    );
  }
}

export async function handleForgotPassword(req: Request): Promise<Response> {
  try {
    const { email } = await req.json();

    if (!email) {
      return createResponse(
        createApiResponse(undefined, {
          code: "INVALID_REQUEST",
          message: "Email is required",
        })
      );
    }

    const result = await forgotPassword(email);
    return createResponse(result);
  } catch (error) {
    console.error("ForgotPassword error:", error);
    return createResponse(
      createApiResponse(undefined, {
        code: "INTERNAL_ERROR",
        message: "Password reset initiation failed",
      })
    );
  }
}

export async function handleConfirmForgotPassword(
  req: Request
): Promise<Response> {
  try {
    const { email, code, newPassword } = await req.json();

    if (!email || !code || !newPassword) {
      return createResponse(
        createApiResponse(undefined, {
          code: "INVALID_REQUEST",
          message: "Email, code, and new password are required",
        })
      );
    }

    const result = await confirmForgotPassword(email, code, newPassword);
    return createResponse(result);
  } catch (error) {
    console.error("ConfirmForgotPassword error:", error);
    return createResponse(
      createApiResponse(undefined, {
        code: "INTERNAL_ERROR",
        message: "Password reset failed",
      })
    );
  }
}

export async function healthCheck(_: Request): Promise<Response> {
  return createResponse(createApiResponse("OK"));
}

// Add missing handlers for completeness
export async function handleSignIn(req: Request): Promise<Response> {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return createResponse(
        createApiResponse(undefined, {
          code: "INVALID_REQUEST",
          message: "Email and password are required",
        })
      );
    }

    const result = await signIn(email, password);
    return createResponse(result);
  } catch (error) {
    console.error("SignIn error:", error);
    return createResponse(
      createApiResponse(undefined, {
        code: "INTERNAL_ERROR",
        message: "Authentication failed",
      })
    );
  }
}

export async function handleSignUp(req: Request): Promise<Response> {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return createResponse(
        createApiResponse(undefined, {
          code: "INVALID_REQUEST",
          message: "Email and password are required",
        })
      );
    }

    const result = await signUp(email, password);
    return createResponse(result);
  } catch (error) {
    console.error("SignUp error:", error);
    return createResponse(
      createApiResponse(undefined, {
        code: "INTERNAL_ERROR",
        message: "Account creation failed",
      })
    );
  }
}
