// deps.ts
// Cognito
export {
  CognitoIdentityProviderClient,
  SignUpCommand,
  GlobalSignOutCommand,
  AdminInitiateAuthCommand,
  AdminUserGlobalSignOutCommand,
  ConfirmForgotPasswordCommand,
  ForgotPasswordCommand,
  AdminRespondToAuthChallengeCommand,
  AdminConfirmSignUpCommand,
  RespondToAuthChallengeCommand,
  ConfirmSignUpCommand,
  UserNotFoundException,
  NotAuthorizedException,
  CodeMismatchException,
  ExpiredCodeException,
  LimitExceededException,
  TooManyRequestsException,
  UsernameExistsException,
  InvalidPasswordException,
  InvalidParameterException,
} from "npm:@aws-sdk/client-cognito-identity-provider";

// DynamoDB
export {
  DynamoDBClient,
  PutItemCommand,
  GetItemCommand,
} from "npm:@aws-sdk/client-dynamodb";

// Other utils
export * as AWS from "npm:@aws-sdk/util-dynamodb";
export * as uuid from "https://deno.land/std/uuid/mod.ts";
export { fromEnv } from "npm:@aws-sdk/credential-provider-env";
