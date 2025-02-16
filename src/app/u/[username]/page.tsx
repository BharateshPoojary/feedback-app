"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useParams } from "next/navigation";
import React from "react";

const page = () => {
  const params = useParams<{ username: string }>();
  return (
    <div className="max-w-full w-full h-[100vh]  flex flex-col sm:justify-between justify-evenly items-center">
      <div className="max-w-7xl w-full my-4 p-6 h-fit">
        <p className="text-4xl font-extrabold text-center">
          Public Profile Link
        </p>
        <div>
          <p className="font-bold p-4">
            Send Anonymous Message to @{params.username}
          </p>
          <Textarea placeholder="Type your message here." className="h-40" />
          <div className="flex justify-center items-center">
            <Button className="my-5 p-5 px-10 hover:bg-gray-500">Sendit</Button>
          </div>
        </div>
      </div>
      <div className=" max-w-7xl w-full p-6">
        <Separator />
        <p className=" text-xl text-bold text-center my-2">
          Get Your Message Board
        </p>
        <div className="flex  justify-center items-center">
          <Button className="my-2 p-5 px-10 hover:bg-gray-500">
            Create Your Account{" "}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default page;
