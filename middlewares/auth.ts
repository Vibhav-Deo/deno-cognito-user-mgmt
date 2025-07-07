export async function verifyTokenMiddleware(req: Request, next: (req: Request) => Promise<Response>) {
  const token = req.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) return new Response("Unauthorized", { status: 401 });

  const segments = token.split(".");
  if (segments.length !== 3) return new Response("Invalid token", { status: 403 });

  try {
    const payload = JSON.parse(atob(segments[1]));
    // Optionally verify `exp`, `aud`, etc.
    return await next(req);
  } catch (_) {
    return new Response("Invalid token", { status: 403 });
  }
}
