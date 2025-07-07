import { serve } from "jsr:@std/http/server";
import { handleSignUp, handleSignIn } from "./routes/auth.ts";
import {
  handleSignOut,
  handleVerifyAccount,
  handleVerifyEmailMfa,
  handleForgotPassword,
  handleConfirmForgotPassword,
  healthCheck,
} from "./routes/user.ts";
import { createOrUpdateProfile, fetchProfile } from "./routes/profile.ts";
import { verifyTokenMiddleware } from "./middlewares/auth.ts";
import { serveSwagger } from "./swagger/swagger.ts";

// Get port from environment or default to 8000
const port = parseInt(Deno.env.get("PORT") || "8000");

// Log server startup information
console.log(`🚀 Server running at http://localhost:${port}`);
console.log(`📚 Swagger UI available at http://localhost:${port}/swagger`);

// Handler for incoming requests
async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const { pathname } = url;

  // Log request details
  console.log(`[${req.method}] ${pathname} - ${new Date().toISOString()}`);

  try {
    switch (pathname) {
      case "/":
      case "/swagger":
        return await serveSwaggerUI();
      case "/openapi.json":
        return await serveSwagger(req);
      case "/signup":
        return await handleSignUp(req);
      case "/signin":
        return await handleSignIn(req);
      case "/signout":
        return await handleSignOut(req);
      case "/verify-account":
        return await handleVerifyAccount(req);
      case "/verify-mfa":
        return await handleVerifyEmailMfa(req);
      case "/forgot-password":
        return await handleForgotPassword(req);
      case "/confirm-forgot-password":
        return await handleConfirmForgotPassword(req);
      case "/healthcheck":
        return await healthCheck(req);
      case "/profile/save":
        return await verifyTokenMiddleware(req, createOrUpdateProfile);
      case "/profile/get":
        return await verifyTokenMiddleware(req, fetchProfile);
      default:
        return new Response("Not Found", { status: 404 });
    }
  } catch (error) {
    // Handle unknown error type safely
    if (error instanceof Error) {
      console.error(`Server error: ${error.message}`, error.stack);
    } else {
      console.error("Unknown server error:", error);
    }
    return new Response("Internal Server Error", { status: 500 });
  }
}

// Serve Swagger UI HTML
async function serveSwaggerUI(): Promise<Response> {
  try {
    const file = await Deno.open("./swagger/swagger-ui.html", { read: true });
    return new Response(file.readable, {
      headers: { "Content-Type": "text/html" },
    });
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      console.error("Swagger UI file not found");
      return new Response("Documentation not available", { status: 404 });
    }
    console.error("Failed to load Swagger UI:", error);
    return new Response("Documentation unavailable", { status: 500 });
  }
}

// Start the server with Deno.serve
Deno.serve({ port }, handler);
