export function getAccessToken(req: Request) {
  const cookieHeader = req.headers.get("cookie") || "";
  return (
    cookieHeader
      .split("; ")
      .find((c) => c.startsWith("accessToken="))
      ?.split("=")[1] || null
  );
}