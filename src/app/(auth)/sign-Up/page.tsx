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
import { useDebounceValue } from "usehooks-ts";

//Custom hook that returns a debounced version of the provided value, along with a function to update it.
/**A debounced value in this context means that the value update will be delayed until the user has stopped interacting for a specified period of time. This can help avoid unnecessary operations like API calls on every keystroke in a search bar. */
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
//The useRouter hook allows you to programmatically change routes inside Client Components.
//router.push(href: string, { scroll: boolean }): Perform a client-side navigation to the provided route
import { signUpSchemaValidation } from "@/schemas/signUpSchema";
import { ApiResponse } from "@/types/ApiResponse";
import axios, { AxiosError } from "axios";

const page = () => {
  const [username, setUsername] = useState("");
  //state for storing username
  const [usernamereqmsg, setUserNameReqMsg] = useState("");
  //This state is for storing the message which will come after request is made to check username present in db
  const [ischeckingusername, setIsCheckingUsername] = useState(false);
  //it will manage the state of loader .loader  is to manage the application when the control is processing the request on serverside
  const [issubmitting, setIsSubmitting] = useState(false);
  //this state will manage the submission part of form to ensure the form is submitted corretly
  const debouncedusername = useDebounceValue(username, 300);
  //I used the useDebounceValue() hook it will return the debounced version of the username i.e after 300 ms what is the value username will contain that we will consider
  //for API request we will not consider username state as it will change very rapidly whenever the state changes (when user is typing) so for each state change it will make API call so to avoid this we are using debounced value here debouncedusername variable will contain the debounced version of username it means it will consider the username value which is after 300 m/s and will be stored in the debouncedusername variable
  const { toast } = useToast(); //useToast() hook include toast method for showing toast message
  const router = useRouter(); //router for routing from one direction to another
  const form = useForm<z.infer<typeof signUpSchemaValidation>>({
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
      if (debouncedusername) {
        //To ensure it is not empty
        setIsCheckingUsername(true);
        setUserNameReqMsg("");
        try {
          const response = await axios.get<ApiResponse>( //making get request and response will be of type API RESPONSE
            `/check-username-unique?username=${debouncedusername}`
          );
          console.log(response.data);
          console.log(response.data.message); //in axios response is inside data object
          setUserNameReqMsg(response.data.message); //type string
        } catch (error) {
          const axiosError = error as AxiosError<ApiResponse>; //type casting generic error as Axios Error which will be of type API RESPONSE
          setUserNameReqMsg(
            axiosError.response?.data.message ?? "error checking username" //?? is used if the left side value is null right side will be used
          );
        } finally {
          //finally block will be executed for both try..catch
          setIsCheckingUsername(false);
        }
      }
      checkingUserNameUnique();
    };
  }, [debouncedusername]);
  const submitform = async (data: z.infer<typeof signUpSchemaValidation>) => {
    //This will handle the form submission
    setIsSubmitting(true);
    try {
      const submitresponse = await axios.post<ApiResponse>("/signUp", data); //sending the data to server data will be username , email and password
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
  return <div></div>;
};

export default page;
