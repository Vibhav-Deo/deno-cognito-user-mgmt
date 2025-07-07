import {
  AuthenticationResultType,
  GlobalSignOutCommand,
} from "npm:@aws-sdk/client-cognito-identity-provider";
import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  AdminInitiateAuthCommand,
  ConfirmSignUpCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
  RespondToAuthChallengeCommand,
  UserNotFoundException,
  NotAuthorizedException,
  CodeMismatchException,
  ExpiredCodeException,
  LimitExceededException,
  TooManyRequestsException,
  UsernameExistsException,
  InvalidPasswordException,
  InvalidParameterException,
} from "../deps.ts";
import { ApiResponse, createApiResponse } from "../utils/apiResponse.ts";

const client = new CognitoIdentityProviderClient({
  region: "ap-southeast-2",
  credentials: {
    accessKeyId: Deno.env.get("AWS_ACCESS_KEY_ID") || "",
    secretAccessKey: Deno.env.get("AWS_SECRET_ACCESS_KEY") || "",
  },
});

const userPoolClientId = Deno.env.get("AWS_USER_POOL_CLIENT_ID");
const userPoolId = Deno.env.get("AWS_USER_POOL_ID");

// Validate required environment variables
if (!userPoolClientId || !userPoolId) {
  throw new Error("Missing required Cognito environment variables");
}

export async function signUp(
  email: string,
  password: string
): Promise<ApiResponse<{ userId: string }>> {
  try {
    const command = new SignUpCommand({
      ClientId: userPoolClientId,
      Username: email,
      Password: password,
    });

    const result = await client.send(command);
    return createApiResponse({ userId: result.UserSub });
  } catch (error) {
    if (error instanceof Error) {
      switch (error.name) {
        case UsernameExistsException.name:
          return createApiResponse<{ userId: string }>(undefined, {
            code: "USER_EXISTS",
            message: "User with this email already exists",
          });

        case InvalidPasswordException.name:
          return createApiResponse<{ userId: string }>(undefined, {
            code: "INVALID_PASSWORD",
            message: "Password does not meet requirements",
          });

        case InvalidParameterException.name:
          return createApiResponse<{ userId: string }>(undefined, {
            code: "INVALID_REQUEST",
            message: "Invalid email format",
          });

        case TooManyRequestsException.name:
          return createApiResponse<{ userId: string }>(undefined, {
            code: "TOO_MANY_REQUESTS",
            message: "Too many signup attempts. Please try again later",
          });
      }
    }

    console.error("SignUp error:", error);
    return createApiResponse<{ userId: string }>(undefined, {
      code: "INTERNAL_ERROR",
      message: "Failed to create account",
    });
  }
}

export async function signIn(
  email: string,
  password: string
): Promise<ApiResponse<AuthenticationResultType>> {
  try {
    const command = new AdminInitiateAuthCommand({
      AuthFlow: "ADMIN_NO_SRP_AUTH",
      ClientId: userPoolClientId,
      UserPoolId: userPoolId,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    });

    const result = await client.send(command);

    // Handle MFA challenge if required
    if (
      result.ChallengeName === "MFA_SETUP" ||
      result.ChallengeName === "SOFTWARE_TOKEN_MFA"
    ) {
      return createApiResponse<AuthenticationResultType>(undefined, {
        code: "MFA_REQUIRED",
        message: "MFA authentication required",
        challenge: result.ChallengeName,
        session: result.Session,
      });
    }

    return createApiResponse(result.AuthenticationResult);
  } catch (error) {
    if (error instanceof Error) {
      switch (error.name) {
        case UserNotFoundException.name:
          return createApiResponse<AuthenticationResultType>(undefined, {
            code: "USER_NOT_FOUND",
            message: `User with email ${email} not found`,
          });

        case NotAuthorizedException.name:
          return createApiResponse<AuthenticationResultType>(undefined, {
            code: "UNAUTHORIZED",
            message: "Incorrect email or password",
          });

        case "UserNotConfirmedException":
          return createApiResponse<AuthenticationResultType>(undefined, {
            code: "USER_NOT_CONFIRMED",
            message: "Account not verified. Please confirm your email",
          });

        case "PasswordResetRequiredException":
          return createApiResponse<AuthenticationResultType>(undefined, {
            code: "PASSWORD_RESET_REQUIRED",
            message: "Password reset required. Please check your email",
          });

        case TooManyRequestsException.name:
          return createApiResponse<AuthenticationResultType>(undefined, {
            code: "TOO_MANY_REQUESTS",
            message: "Too many attempts. Please try again later",
          });
      }
    }

    console.error("SignIn error:", error);
    return createApiResponse<AuthenticationResultType>(undefined, {
      code: "INTERNAL_ERROR",
      message: "Authentication service unavailable",
    });
  }
}

export async function confirmAccount(
  email: string,
  code: string
): Promise<ApiResponse<boolean>> {
  try {
    const command = new ConfirmSignUpCommand({
      ClientId: userPoolClientId,
      Username: email,
      ConfirmationCode: code,
    });

    await client.send(command);
    return createApiResponse(true);
  } catch (error) {
    if (error instanceof Error) {
      switch (error.name) {
        case UserNotFoundException.name:
          return createApiResponse<boolean>(undefined, {
            code: "USER_NOT_FOUND",
            message: `User with email ${email} not found`,
          });

        case CodeMismatchException.name:
          return createApiResponse<boolean>(undefined, {
            code: "INVALID_CODE",
            message: "Invalid verification code",
          });

        case ExpiredCodeException.name:
          return createApiResponse<boolean>(undefined, {
            code: "EXPIRED_CODE",
            message: "Verification code has expired",
          });

        case TooManyRequestsException.name:
          return createApiResponse<boolean>(undefined, {
            code: "TOO_MANY_REQUESTS",
            message: "Too many attempts. Please try again later",
          });
      }
    }

    console.error("ConfirmAccount error:", error);
    return createApiResponse<boolean>(undefined, {
      code: "INTERNAL_ERROR",
      message: "Failed to confirm account",
    });
  }
}

export async function forgotPassword(
  email: string
): Promise<ApiResponse<boolean>> {
  try {
    const command = new ForgotPasswordCommand({
      ClientId: userPoolClientId,
      Username: email,
    });

    await client.send(command);
    return createApiResponse(true);
  } catch (error) {
    if (error instanceof Error) {
      switch (error.name) {
        case UserNotFoundException.name:
          return createApiResponse<boolean>(undefined, {
            code: "USER_NOT_FOUND",
            message: `User with email ${email} not found`,
          });

        case LimitExceededException.name:
          return createApiResponse<boolean>(undefined, {
            code: "LIMIT_EXCEEDED",
            message: "Too many password reset attempts. Please try again later",
          });
      }
    }

    console.error("ForgotPassword error:", error);
    return createApiResponse<boolean>(undefined, {
      code: "INTERNAL_ERROR",
      message: "Failed to initiate password reset",
    });
  }
}

export async function confirmForgotPassword(
  email: string,
  code: string,
  newPassword: string
): Promise<ApiResponse<boolean>> {
  try {
    const command = new ConfirmForgotPasswordCommand({
      ClientId: userPoolClientId,
      Username: email,
      ConfirmationCode: code,
      Password: newPassword,
    });

    await client.send(command);
    return createApiResponse(true);
  } catch (error) {
    if (error instanceof Error) {
      switch (error.name) {
        case UserNotFoundException.name:
          return createApiResponse<boolean>(undefined, {
            code: "USER_NOT_FOUND",
            message: `User with email ${email} not found`,
          });

        case CodeMismatchException.name:
          return createApiResponse<boolean>(undefined, {
            code: "INVALID_CODE",
            message: "Invalid verification code",
          });

        case ExpiredCodeException.name:
          return createApiResponse<boolean>(undefined, {
            code: "EXPIRED_CODE",
            message: "Verification code has expired",
          });

        case "InvalidPasswordException":
          return createApiResponse<boolean>(undefined, {
            code: "INVALID_PASSWORD",
            message: "Password does not meet requirements",
          });
      }
    }

    console.error("ConfirmForgotPassword error:", error);
    return createApiResponse<boolean>(undefined, {
      code: "INTERNAL_ERROR",
      message: "Failed to reset password",
    });
  }
}

export async function verifyEmailMfa(
  email: string,
  code: string,
  session: string
): Promise<ApiResponse<AuthenticationResultType>> {
  try {
    if (!session) {
      return createApiResponse<AuthenticationResultType>(undefined, {
        code: "INVALID_SESSION",
        message: "Session token is required for MFA verification",
      });
    }

    const command = new RespondToAuthChallengeCommand({
      ClientId: userPoolClientId,
      ChallengeName: "CUSTOM_CHALLENGE",
      ChallengeResponses: {
        USERNAME: email,
        ANSWER: code,
      },
      Session: session,
    });

    const result = await client.send(command);

    if (!result.AuthenticationResult) {
      return createApiResponse<AuthenticationResultType>(undefined, {
        code: "MFA_FAILED",
        message: "MFA verification failed",
      });
    }

    return createApiResponse(result.AuthenticationResult);
  } catch (error) {
    if (error instanceof Error) {
      switch (error.name) {
        case "CodeMismatchException":
          return createApiResponse<AuthenticationResultType>(undefined, {
            code: "INVALID_CODE",
            message: "Invalid MFA code",
          });

        case "ExpiredCodeException":
          return createApiResponse<AuthenticationResultType>(undefined, {
            code: "EXPIRED_CODE",
            message: "MFA code has expired",
          });

        case "NotAuthorizedException":
          return createApiResponse<AuthenticationResultType>(undefined, {
            code: "UNAUTHORIZED",
            message: "MFA verification failed",
          });

        case "InvalidSessionException":
          return createApiResponse<AuthenticationResultType>(undefined, {
            code: "INVALID_SESSION",
            message: "Session expired. Please sign in again",
          });
      }
    }

    console.error("VerifyEmailMfa error:", error);
    return createApiResponse<AuthenticationResultType>(undefined, {
      code: "INTERNAL_ERROR",
      message: "MFA verification service unavailable",
    });
  }
}

// Placeholder implementation
// In cognito service file
export async function signOut(
  accesstoken: string
): Promise<ApiResponse<boolean>> {
  try {
    const command = new GlobalSignOutCommand({
      AccessToken: accesstoken,
    });
    const result = client.send(command);
    return createApiResponse(true);
  } catch (error) {
    console.error("SignOut error:", error);
    return createApiResponse<boolean>(undefined, {
      code: "INTERNAL_ERROR",
      message: "Failed to sign out",
    });
  }
}
