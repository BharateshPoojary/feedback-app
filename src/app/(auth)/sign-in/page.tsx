"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { signInSchema } from "@/schemas/signInSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signIn } from "next-auth/react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";

const page = () => {
  const [issubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),//integrates the Zod schema validation with the form validation process
    defaultValues: {
      identifier: "",//Identifier can be username or email
      password: "",
    },
  });
  const onSubmit = async (data: z.infer<typeof signInSchema>) => {
    setIsSubmitting(true);
    const result = await signIn("credentials", {
      redirect: false,
      identifier: data.identifier,
      password: data.password,
    });
    console.log("Result after signIn", result)
    if (result?.error) {
      if (result.error === "CredentialsSignin") {
        toast({
          title: "SignIn Failed",
          description: "Invalid username or password",
          variant: "destructive",
        });
        setIsSubmitting(false);
      } else {
        toast({
          title: "SignIn Failed",
          description: result.error,
          variant: "destructive",
        });
        setIsSubmitting(false);
      }
    }
    if (result?.url) {
      //This indicates the URL to which the user should be redirected after a successful sign-in.
      console.log(result.url);

      setIsSubmitting(false);
      router.replace("/dashboard");
    }
  };
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-700">
      <div className="w-1/2 max-w-md p-6 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className=" font-extrabold tracking-tight lg:text-4xl mb-6">
            {/*min-width: 1024px means that the styles inside this media query will only apply if the viewport width is 1024 pixels or larger.*/}
            Welcome back to Bharat Feedback
          </h1>
          <p className="mb-4">Login in to continue your feedback journey</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="identifier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username/Email</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="username/email" />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" placeholder="password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-center">
              <Button disabled={issubmitting} className="space-y-16">
                {issubmitting ? (
                  <>
                    <Loader2 className="animate-spin"></Loader2>Please wait
                  </>
                ) : (
                  "Signin"
                )}
              </Button>
            </div>
          </form>
        </Form>
        <div className="flex justify-center">
          <p>
            New to Bharat Feedback ?&nbsp;
            <Link href="/sign-Up" className="text-blue-500 hover:text-blue-900">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default page;
