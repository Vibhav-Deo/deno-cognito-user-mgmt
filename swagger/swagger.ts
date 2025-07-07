export function serveSwagger(_: Request): Response {
  return Response.json({
    openapi: "3.0.0",
    info: {
      title: "User Service API",
      version: "1.0.0",
    },
    paths: {
      "/signup": {
        post: {
          summary: "Register user in Cognito",
          responses: { "200": { description: "Signed up" } }
        }
      },
      "/signin": {
        post: {
          summary: "Authenticate user",
          responses: { "200": { description: "Returns JWT token" } }
        }
      },
      "/signout": {
        post: {
          summary: "Sign out user",
          responses: { "200": { description: "Signed out" } }
        }
      },
      "/verify-account": {
        post: {
          summary: "Verify account with confirmation code",
          responses: { "200": { description: "Verified" } }
        }
      },
      "/verify-mfa": {
        post: {
          summary: "Verify MFA code",
          responses: { "200": { description: "MFA Verified" } }
        }
      },
      "/forgot-password": {
        post: {
          summary: "Initiate forgot password flow",
          responses: { "200": { description: "Email sent" } }
        }
      },
      "/confirm-forgot-password": {
        post: {
          summary: "Confirm new password",
          responses: { "200": { description: "Password reset" } }
        }
      },
      "/healthcheck": {
        get: {
          summary: "Health check",
          responses: { "200": { description: "OK" } }
        }
      },
      "/profile/save": {
        post: {
          summary: "Save or update profile",
          responses: { "200": { description: "Saved" } }
        }
      },
      "/profile/get": {
        get: {
          summary: "Get profile by ID",
          parameters: [{ name: "id", in: "query", required: true, schema: { type: "string" } }],
          responses: { "200": { description: "Profile object" } }
        }
      }
    }
  });
}
