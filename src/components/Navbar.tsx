"use client";
import React from "react";
import { signOut, useSession } from "next-auth/react";
import { User } from "next-auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
// import { useRouter } from "next/navigation";
const Navbar = () => {
  const { data: session } = useSession();
  const user = session?.user as User;
  // const router = useRouter();
  return (
    <div>
      <nav className="w-full p-5 shadow-md bg-gray-900 rounded-br-full text-white h-28 flex  items-center">
        <div className="container flex min-[530px]:flex-row flex-col   min-[530px]:justify-between justify-evenly items-start">
          <span className="text-xl min-[357px]:text-2xl sm:text-4xl">
            Anonytalks
          </span>
          <div className="flex flex-row  ">
            {session ? (
              <>
                <span className="mr-4 mt-2 text-lg">
                  Welcome,{user.username || user.email}
                </span>
                <Button
                  onClick={() => signOut()}
                  className="p-3 pr-6 pl-6 rounded-full bg-slate-100 text-black hover:bg-slate-200"
                >
                  Logout
                </Button>
              </>
            ) : (
              <div className="flex  justify-end items-end my-3 ">
                <Link
                  href="/sign-in"
                  className=" p-3 pr-6 pl-6 rounded-full bg-slate-100 text-black"
                >
                  Login
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
