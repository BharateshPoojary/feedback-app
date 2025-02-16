"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ApiResponse } from "@/types/ApiResponse";
import axios, { AxiosError } from "axios";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useState } from "react";

const page = () => {
  const { toast } = useToast();
  const params = useParams<{ username: string }>();
  const [textArea, setTextArea] = useState<string>("");
  const [isSending, setIsSending] = useState<boolean>(false);
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setTextArea(e.target.value);
  };
  const handleClick = async (): Promise<void> => {
    if (textArea.trim() === "") {
      toast({
        title: "Please enter a message",
      });
      return;
    }
    try {
      setIsSending(true);
      const result = await axios.post<ApiResponse>("/api/send-message", {
        username: params.username,
        content: textArea,
      });
      toast({ title: "Success", description: result.data?.message });
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Error",
        description:
          axiosError.response?.data.message || "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };
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
          <Textarea
            placeholder="Type your message here."
            className="h-40"
            value={textArea}
            onChange={handleChange}
          />
          <div className="flex justify-center items-center">
            <Button
              className="my-5 p-5 px-10 hover:bg-gray-500"
              onClick={handleClick}
            >
              {isSending ? (
                <>
                  <Loader2 className="animate-spin" />
                  Sending..
                </>
              ) : (
                "Send"
              )}
            </Button>
          </div>
        </div>
      </div>
      <div className=" max-w-7xl w-full p-6">
        <Separator />
        <p className=" text-xl text-bold text-center my-2">
          Get Your Message Board
        </p>
        <div className="flex  justify-center items-center">
          <Link
            href={"/"}
            className="my-2 p-2 rounded-lg bg-slate-900 text-slate-100 hover:bg-gray-500"
          >
            Create Your Account{" "}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default page;
