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
      <nav className="w-full p-5 shadow-md bg-gray-900 rounded-br-full text-white h-24 flex  items-center">
        <div className="container flex flex-row  justify-between items-center">
          <span className="text-xl min-[357px]:text-2xl sm:text-4xl">
            Bharat Feedback App
          </span>
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
              <span className=" p-3 pr-6 pl-6 rounded-full bg-slate-100 text-black">
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
