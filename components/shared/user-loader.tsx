import { getServerCookie } from "@/api/server/cookieStore";
import { fetcher } from "@/api/server/fetcher";
import UserProvider from "@/provider/UserProvider";
import { cookies } from "next/headers";
import { Suspense } from "react";

async function UserDataLoader({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = getServerCookie(cookieStore, "AUTH-TOKEN");
  console.log("token layout", token);
  let user = null;
  if (token) {
    const res_getUser = await fetcher("/auth/me", cookieStore);
    console.log("res_getUser.ok", res_getUser.ok);
    if (!res_getUser.ok) {
      await fetcher("/auth/logout", cookieStore, {
        method: "POST",
        body: JSON.stringify({}),
      });
    } else {
      user = await res_getUser.json();
      // console.log("user layout", user);
    }
  }

  return <UserProvider user={user}>{children}</UserProvider>;
}

export default function UserLoader({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<UserProvider user={null}>{children}</UserProvider>}>
      <UserDataLoader>{children}</UserDataLoader>
    </Suspense>
  );
}
