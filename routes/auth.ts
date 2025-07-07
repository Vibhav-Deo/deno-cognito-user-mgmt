import { signUp, signIn } from "../services/cognito.ts";
import { createApiResponse } from "../utils/apiResponse.ts";
import { decodeBase64 } from "jsr:@std/encoding/base64";

export async function handleSignUp(req: Request): Promise<Response> {
  const { email, password } = await req.json();
  const decodedBase64 = decodeBase64(password); // Ensure password is decoded
  const textDecoder = new TextDecoder();
  const decodedPassword = textDecoder.decode(decodedBase64);
  const result = await signUp(email, decodedPassword);
  const apiResp = createApiResponse(result);
  return Response.json({ success: true, apiResp });
}

export async function handleSignIn(req: Request): Promise<Response> {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return Response.json(
        createApiResponse(undefined, {
          code: "INVALID_REQUEST",
          message: "Email and password are required",
        }),
        { status: 400 }
      );
    }

    const decodedBase64 = decodeBase64(password);
    const textDecoder = new TextDecoder();
    const decodedPassword = textDecoder.decode(decodedBase64);

    const result = await signIn(email, decodedPassword);

    // Determine appropriate status code
    const status = result.isSuccess
      ? 200
      : result.error?.code === "UNAUTHORIZED"
      ? 401
      : result.error?.code === "TOO_MANY_REQUESTS"
      ? 429
      : 400;

    return Response.json(result, { status });
  } catch (error) {
    console.error("HandleSignIn error:", error);
    return Response.json(
      createApiResponse(undefined, {
        code: "INTERNAL_ERROR",
        message: "Internal server error",
      }),
      { status: 500 }
    );
  }
}
