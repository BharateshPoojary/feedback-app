//Client Components allow you to write interactive UI that is prerendered on the server and can use client JavaScript to run in the browser.
"use client";
/**To use Client Components, you can add the React "use client" directive at the top of a file, above your imports.

"use client" is used to declare a boundary between a Server and Client Component modules. This means that by defining a "use client" in a file, all other modules imported into it, including child components, are considered part of the client bundle. */
import { zodResolver } from "@hookform/resolvers/zod";
//zodResolver is used to integrate the Zod schema validation library with react-hook-form. It allows you to use Zod for form validation. When using react-hook-form, this resolver validates the form inputs against a Zod schema.
import { useForm } from "react-hook-form";
//useForm is a custom React hook for managing form state and handling form submissions in a performant way. It simplifies form handling by providing methods to register inputs, validate data, and handle submission.
//using react-hook-form it allow you to manage all the fields in a single object or else you have to manage seperate state for every field
import * as z from "zod";
//This import is bringing in everything (*) from the zod library under the namespace z.
import React, { useEffect, useState } from "react";
import { useDebounceCallback } from "usehooks-ts";
import Link from "next/link";
//Custom hook that returns a debounced version of the provided value, along with a function to update it.
/**A debounced value in this context means that the value update will be delayed until the user has stopped interacting for a specified period of time. This can help avoid unnecessary operations like API calls on every keystroke in a search bar. */
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
//The useRouter hook allows you to programmatically change routes inside Client Components.
//router.push(href: string, { scroll: boolean }): Perform a client-side navigation to the provided route
import { signUpSchemaValidation } from "@/schemas/signUpSchema";
import { ApiResponse } from "@/types/ApiResponse";
import axios, { AxiosError } from "axios";
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
import { Loader2 } from "lucide-react";
const page = () => {
  const [username, setUsername] = useState("");
  //state for storing username
  const [usernamereqmsg, setUserNameReqMsg] = useState("");
  //This state is for storing the message which will come after request is made to check username present in db
  const [ischeckingusername, setIsCheckingUsername] = useState(false);
  //it will manage the state of loader .loader  is to manage the application when the control is processing the request on serverside
  const [issubmitting, setIsSubmitting] = useState(false);
  //this state will manage the submission part of form to ensure the form is submitted corretly
  const debounced = useDebounceCallback(setUsername, 300);
  //Custom hook that creates a debounced version of a callback function
  //debounced version of a callback function means for e.g. we have setUsername as callbackfn means the username will be assigned or value will be setted after 300m/s
  //we can directly use the username variable to access debounced username
  const { toast } = useToast(); //useToast() hook include toast method for showing toast message
  const router = useRouter(); //router for routing from one direction to another
  const form = useForm<z.infer<typeof signUpSchemaValidation>>({
    /**z.infer is a utility provided by the Zod library.
It infers and extracts the TypeScript type from a Zod schema.
Essentially, it converts your Zod validation schema into a TypeScript type. */
    //implementing zod validation on our react hook form
    resolver: zodResolver(signUpSchemaValidation), //zodResolver ,for wrapping our form fields with specific  validation
    defaultValues: {
      userName: "",
      email: "",
      password: "",
    },
  });
  useEffect(() => {
    //This use effect will run when the debounced version of user name will change
    const checkingUserNameUnique = async () => {
      if (username) {
        //To ensure it is not empty
        setIsCheckingUsername(true);
        setUserNameReqMsg("");
        try {
          const response = await axios.get<ApiResponse>( //making get request and response will be of type API RESPONSE
            `/api/check-username-unique?username=${username}`
          );
          console.log(response.data);
          console.log(response.data.message); //in axios response is inside data object
          setUserNameReqMsg(response.data.message); //type string
        } catch (error) {
          const axiosError = error as AxiosError<ApiResponse>;
          /**It tells the TypeScript compiler that you expect the error object to be of type AxiosError and that the response data inside this error is structured according to the ApiResponse interface you defined:
           *
           */
          setUserNameReqMsg(
            axiosError.response?.data.message ?? "error checking username" //?? is used if the left side value is null or undefined right side will be used
            /**If it was a network error or something else, axiosError.response could be undefined, so you use optional chaining (?.) to safely access data. */
          );
        } finally {
          //finally block will be executed for both try..catch
          setIsCheckingUsername(false);
        }
      }
    };
    checkingUserNameUnique();
  }, [username]);
  const submitform = async (data: z.infer<typeof signUpSchemaValidation>) => {
    //This will handle the form submission
    /**When you use useForm with zodResolver, it automatically validates the input based on your Zod schema before calling onSubmit. However, TypeScript does not inherently know that values will match formSchema. Using z.infer<typeof formSchema> in the function signature helps ensure that:

TypeScript understands that values strictly adheres to the schema.
You prevent type errors within the function, e.g., accessing values.username is guaranteed to be a valid operation because TypeScript knows it exists and is a string. */
    setIsSubmitting(true);
    try {
      const submitresponse = await axios.post<ApiResponse>("/api/signUp", data); //sending the data to server data will be username , email and password
      toast({
        //sending the toast message after sending data to server
        title: "Success",
        description: submitresponse.data.message,
      });
      router.replace(`/verify/${username}`); //Perform a client-side navigation to the provided route without adding a new entry into the browser’s history stack.
    } catch (error) {
      const axioserror = error as AxiosError<ApiResponse>;
      console.log(axioserror);
      const formsubmissionerror =
        axioserror.response?.data.message ?? "error during form submission";

      toast({
        title: "signUp failed",
        description: formsubmissionerror,
        variant: "destructive", //to make the toast message in red color
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-700">
      <div className="w-1/2 max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className=" font-extrabold tracking-tight lg:text-4xl mb-6">
            {/*min-width: 1024px means that the styles inside this media query will only apply if the viewport width is 1024 pixels or larger.*/}
            Bharat Feedback App Welcomes you
          </h1>
          <p className="mb-4">Sign up to start your feedback adventure</p>
        </div>
        <Form {...form}>
          {/* To access all properties and methods of useForm hook if we not passed that it will throw error syaing The Form component from Shadcn expects a prop that conforms to UseFormReturn, which is the return type of useForm() from react-hook-form. However, if you only pass children, it will complain that the required properties from UseFormReturn (like watch, setValue, etc.) are missing.*/}
          <form onSubmit={form.handleSubmit(submitform)} className="space-y-6">
            <FormField
              control={form.control}
              name="userName"
              render={({ field }) => (
                /**render  prop   is a function that receives an object with properties provided by react-hook-form.
                  This function is called with an object that contains properties you can use, such as field, fieldState, and formState.
                  I am not directly using that object I am doing destructuring here to directly access field property of an object or else if we not used that render={(props) => {
                    const field = props.field; we have to do like this so for conciseness we used destructuring  */
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="username"
                      onChange={(e) => {
                        field.onChange(e);
                        debounced(e.target.value);
                      }}
                    />
                  </FormControl>
                  {/* It is a wrapper component used to manage form input components like <Input>, <Select>, etc.  */}
                  {ischeckingusername && (
                    <Loader2 className="animate-spin"></Loader2>
                  )}

                  <p
                    className={`text-sm ${
                      usernamereqmsg === "Username is unique"
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {usernamereqmsg}
                  </p>

                  <FormMessage />
                  {/* The above  component is used to display validation messages or feedback based on the form field's state. */}
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="email" />
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
                  "SignUp"
                )}
              </Button>
            </div>
          </form>
        </Form>
        <div className="flex justify-center">
          <p>
            Already a member?&nbsp;
            <Link href="/sign-in" className="text-blue-500 hover:text-blue-900">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default page;
