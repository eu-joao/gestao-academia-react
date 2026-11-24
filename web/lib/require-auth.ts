import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_SESSAO, isSessionValid } from "./session";

export async function requireAuth(): Promise<void> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(COOKIE_SESSAO)?.value;
  const now = Math.floor(Date.now() / 1000);
  if (!isSessionValid(sessionCookie, now)) {
    redirect("/login");
  }
}