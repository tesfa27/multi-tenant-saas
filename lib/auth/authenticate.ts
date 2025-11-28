import { verifyAccessToken } from "@/lib/jwt";

export function authenticateUser(accessToken: string) {
  try {
    return verifyAccessToken(accessToken) as any;
  } catch {
    return null;
  }
}