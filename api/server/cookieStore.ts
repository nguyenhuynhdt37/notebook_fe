// utils/cookieStore.ts
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";

export function getServerCookie(store: ReadonlyRequestCookies, name: string) {
  return store.get(name)?.value;
}
