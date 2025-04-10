//Client Components allow you to write interactive UI that is prerendered on the server and can use client JavaScript to run in the browser.
"use client";
/**However, "use client" doesn't need to be defined in every component that needs to be rendered on the client. Once you define the boundary, all child components and modules imported into it are considered part of the client bundle.  */
/**To use Client Components, you can add the React "use client" directive at the top of a file, above your imports.
"use client" is used to declare a boundary between a Server and Client Component modules. */
import { zodResolver } from "@hookform/resolvers/zod";
//zodResolver is used to integrate the Zod schema validation library with react-hook-form. It allows you to use Zod for form validation. When using react-hook-form, this resolver validates the form inputs against a Zod schema.
import { useForm } from "react-hook-form";
//useForm is a custom React hook for managing form state and handling form submissions in a performant way. It simplifies form handling by providing methods to register inputs, validate data, and handle submission.
//using react-hook-form it allow you to manage all the fields in a single object or else you have to manage separate state for every field
import * as z from "zod";
//This import is bringing in everything (*) from the zod library under the namespace z.
import React, { useEffect, useState } from "react";
import { useDebounceCallback } from "usehooks-ts";
//Custom hook that returns a debounced version of the provided value, along with a function to update it.
/**A debounced value in this context means that the value update will be delayed until the user has stopped interacting for a specified period of time. This can help avoid unnecessary operations like API calls on every keystroke in a search bar. */
import Link from "next/link";
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
const SignupPage = () => {
  const [username, setUsername] = useState("");
  //state for storing username
  const [usernamereqmsg, setUserNameReqMsg] = useState("");
  //This state is for storing the message which will come after request is made to check username present in db
  const [ischeckingusername, setIsCheckingUsername] = useState(false);
  //it will manage the state of loader . This state  to manage the application when the control is processing the request on serverside
  const [issubmitting, setIsSubmitting] = useState(false);
  //this state will manage the submission part of form to ensure the form is submitted corretly
  const debounced = useDebounceCallback(setUsername, 300); //It is of type debounced state and we are giving values like we normally give using setUsername() here debounced()
  //Custom hook that creates a debounced version of a callback function
  //debounced version of a callback function means for e.g. we have setUsername as callbackfn means the username will be assigned or value will be setted after 300m/s
  //we can directly use the username variable to access debounced username
  const { toast } = useToast(); //useToast() hook include toast method for showing toast message
  const router = useRouter(); //router for routing from one direction to another
  const form = useForm<z.infer<typeof signUpSchemaValidation>>({
    /**z.infer is a utility provided by the Zod library.
    It infers and extracts the TypeScript type from a Zod schema.
 Here we are explicitly telling zod that this form should adhere to this schema vaildation*/
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
          //console.log(response.data);
          //console.log(response.data.message); //in axios response is inside data object
          setUserNameReqMsg(response.data.message); //type string
        } catch (error) {
          const axiosError = error as AxiosError<ApiResponse>; // as keyword in TypeScript is a type assertion. It tells TypeScript to treat a value as a specific type Treat error as axios specifc error as it is associated with axios request
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
      const submitresponse = await axios.post<ApiResponse>("/api/signUp", data); //sending the data to server
      // //console.log("Data Received", data);
      //axios sends the data in json format
      // data will be username , email and password
      toast({
        //sending the toast message after sending data to server
        title: "Success",
        description: submitresponse.data.message,
      });
      router.replace(`/verify/${username}`); //Perform a client-side navigation to the provided route without adding a new entry into the browser’s history stack.
    } catch (error) {
      const axioserror = error as AxiosError<ApiResponse>;
      //console.log(axioserror);
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
      <div className="w-fit  max-w-md mx-auto p-4  space-y-8 space-x-3 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className=" font-extrabold tracking-tight  text-lg min-[474px]:text-2xl sm:text-4xl mb-6">
            {/*min-width: 1024px means that the styles inside this media query will only apply if the viewport width is 1024 pixels or larger.*/}
            Bharat Feedback App Welcomes you
          </h1>
          <p className="mb-4">Sign up to start your feedback adventure</p>
        </div>
        <Form {...form}>
          {/* The spread operator automatically passes all required props at once. To access all properties and methods of useForm hook if we not passed that it will throw error saying The Form component from Shadcn expects a prop that conforms to UseFormReturn, which is the return type of useForm() from react-hook-form. However, if you only pass children, it will complain that the required properties from UseFormReturn (like watch, setValue, etc.) are missing.*/}
          <form onSubmit={form.handleSubmit(submitform)} className="space-y-6">
            <FormField
              control={form.control}
              name="userName"
              render={({ field }) => (
                //render attribute includes a call back function which is having parameter in object.
                //I am destructuring it to access ony field property which is an object with some properties
                //neccessary to work with form fields
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input
                      {...field} //accessing all the properties
                      //this field object includes various properties which handles the form field on behalf of us
                      //no need to explicitly call on Change to handle unless and until it is required for some more
                      //field specific work
                      placeholder="username"
                      onChange={(e) => {
                        field.onChange(e);
                        debounced(e.target.value); //Using debounced value
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
                    {/* Input element from shadcn ui has various attributes like  a typical input tag is having like onChange ,ref, value etc field is a prop sent to input component which includes various objects  typically used to control the input tag .By using spread operator we are directly accessing those object and assigning it to particular attribute of Input tag so that react hook form can handle and can have control over  the field   
                    or else we have to do like  <Input 
            value={field.value} 
            onChange={field.onChange} 
            onBlur={field.onBlur} 
            ref={field.ref} 
            placeholder="username/email" 
          /> this*/}
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

export default SignupPage;
