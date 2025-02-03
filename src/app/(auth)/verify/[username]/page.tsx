"use client";
import { useToast } from "@/hooks/use-toast";
import { verifySchema } from "@/schemas/verifySchema";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { useParams, useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";

const verifyAccount = () => {
  const [isCodeVerifying, setIsCodeVerifying] = useState(false);
  const params = useParams<{ username: string }>(); //It allows to read the dynamic params of the current url username is our dynamic param
  const router = useRouter();
  const { toast } = useToast();
  const form = useForm<z.infer<typeof verifySchema>>({
    resolver: zodResolver(verifySchema),
  });
  const onSubmit = async (data: z.infer<typeof verifySchema>) => {
    setIsCodeVerifying(true);
    try {
      const response = await axios.post("/api/verifycode", {
        username: params.username,
        otp: data.code,//made cahnge here check
      });

      toast({
        title: "Success",
        description: response.data.message,
      });
      router.replace("/sign-in");
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Verifcation failed",
        description:
          axiosError.response?.data.message ??
          "An error occurred.Please try again",
      });
    } finally {
      setIsCodeVerifying(false);
    }
  };
  return (
    <div className="flex justify-center items-center bg-slate-800 min-h-screen">
      <div className="w-1/2 max-w-md p-5 bg-white rounded-md shadow-xl">
        <div className="text-center">
          <h1 className=" font-extrabold tracking-tight lg:text-4xl mb-6">
            Verification Code{" "}
          </h1>
          <p className="mb-4">Enter the verification code sent to your email</p>
        </div>
        <Form {...form}>
          {/* we have to use spread operator here so that Form element can have access to all methods of
        useForm here it need watch , setvalue etc and many more methods so the best way is to use spread operator 
        so that it has access to each object of useForm  */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}//This object contains methods for registering components into React Hook Form.
              // do not access any of the properties inside this object directly. It's for internal usage only.
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verification Code</FormLabel>
                  <FormControl>
                    <Input placeholder="verification code" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button disabled={isCodeVerifying} type="submit">
              {isCodeVerifying ? (
                <>
                  <Loader className="animate-spin"></Loader>Please wait
                </>
              ) : (
                "Submit"
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default verifyAccount;
