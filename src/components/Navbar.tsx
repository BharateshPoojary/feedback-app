"use client";
import React from "react";
import { signOut, useSession } from "next-auth/react";
import { User } from "next-auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
const Navbar = () => {
  const { data: session } = useSession();
  const user = session?.user as User;

  return (
    <div>
      <nav className="p-4 md:p-7 shadow-md bg-gray-900 text-white h-24">
        <div className="container flex flex-col md:flex-row  justify-between items-center">
          <span className="text-4xl">Bharat Feedback App</span>
          {session ? (
            <>
              <span className="mr-4">
                Welcome,{user.username || user.email}
              </span>
              <Button
                onClick={() => signOut()}
                className="p-1 bg-slate-100 text-black"
              >
                Logout
              </Button>
            </>
          ) : (
            <Link href={"/sign-in"}>
              <span className=" p-3 pr-6 pl-6 rounded-xl bg-slate-100 text-black">
                Login
              </span>
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
