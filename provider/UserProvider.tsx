"use client";
import { useUserStore } from "@/stores/user";
import { User } from "@/types/user/user";
import { useEffect } from "react";

interface UserProviderProps {
  children: React.ReactNode;
  user: User | null;
}
const UserProvider = ({ children, user }: UserProviderProps) => {
  const setUser = useUserStore((s) => s.setUser);

  // hydrate Zustand từ user (server-side)
  useEffect(() => {
    setUser(user);
  }, [user, setUser]);
  return <>{children}</>;
};

export default UserProvider;
