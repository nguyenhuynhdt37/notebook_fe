import { getServerCookie } from "./cookieStore";

export async function fetcher<T>(
  url: string,
  cookies?: any,
  options?: RequestInit
): Promise<any> {
  const token = getServerCookie(cookies, "AUTH-TOKEN");
  const backendUrl =
    process.env.NEXT_PUBLIC_URL_BACKEND || "http://localhost:8386";
  const res = await fetch(`${backendUrl}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
      ...(token ? { Cookie: `AUTH-TOKEN=${token}` } : {}),
    },
    credentials: "include",
  });
  console.log("res url", `${backendUrl}${url}`);
  return res;
}
