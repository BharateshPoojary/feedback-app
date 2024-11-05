"use client";
import { SessionProvider } from "next-auth/react";
const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  //anything which is wrapped inside AuthProvider component will be passed as prop to this component
  return <SessionProvider>{children}</SessionProvider>;
};
export default AuthProvider;
