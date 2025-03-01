"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { AppDispatch, RootState } from "@/lib/store";
import { ApiResponse } from "@/types/ApiResponse";
import axios, { AxiosError } from "axios";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setTextArea } from "@/lib/features/textArea/textAreaSlice";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { z } from "zod";
import { sendMessageSchema } from "@/schemas/sendMessageSchema";
import { zodResolver } from "@hookform/resolvers/zod";

const page = () => {
  const dispatch: AppDispatch = useDispatch();
  const { content } = useSelector((state: RootState) => state.textArea);
  const { toast } = useToast();
  const params = useParams<{ username: string }>();
  // const [textArea, setTextArea] = useState<string>("");
  const [isSending, setIsSending] = useState<boolean>(false);
  // const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
  //   setTextArea(e.target.value);
  // };
  // //console.log(textArea, "Text Area");
  const form = useForm<z.infer<typeof sendMessageSchema>>({
    resolver: zodResolver(sendMessageSchema),
    defaultValues: { message: content },
  });
  const { register, setValue } = form;
  const username = params.username;
  const decodedusername = username.replace(/%20/g, " ");
  const handleClick = async (): Promise<void> => {
    // //console.log("Text Area", textArea);
    if (content.trim() === "") {
      toast({
        title: "Please enter a message",
      });
      return;
    }
    try {
      setIsSending(true);
      const result = await axios.post<ApiResponse>("/api/send-message", {
        username: decodedusername,
        content,
      });
      toast({ title: "Success", description: result.data?.message });
      dispatch(setTextArea(""));
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
      <Form {...form}>
        <div className="max-w-7xl w-full my-4 p-6 h-fit">
          <p className="text-4xl font-extrabold text-center">
            Public Profile Link
          </p>
          <div>
            <p className="font-bold p-4">
              Send Anonymous Message to @{decodedusername}
            </p>
            <Textarea
              {...register("message")} //registering it for validation, register binds the state here so if we made  on change with settingvalue to message  there is no requirement of value attribute as it is internally done by react hook form
              placeholder="Type your message here."
              className="h-40"
              onChange={(e) => {
                dispatch(setTextArea(e.target.value));
                setValue("message", e.target.value);
              }}
            />

            {/* File upload element */}
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
      </Form>
      <div className=" max-w-7xl w-full p-6">
        <Separator />
        <p className=" text-xl text-bold text-center my-2">
          Get Your Message Board
        </p>
        <div className="flex  justify-center items-center">
          <Link
            href={"/"}
            className="my-2 p-2 rounded-lg bg-slate-900 text-slate-100 hover:bg-gray-500"
            onClick={() => dispatch(setTextArea(""))}
          >
            Create Your Account{" "}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default page;
