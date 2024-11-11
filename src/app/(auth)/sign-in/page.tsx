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
import React, { useState } from "react";
import { useDebounceValue } from "usehooks-ts";

//Custom hook that returns a debounced version of the provided value, along with a function to update it.
/**A debounced value in this context means that the value update will be delayed until the user has stopped interacting for a specified period of time. This can help avoid unnecessary operations like API calls on every keystroke in a search bar. */
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
//The useRouter hook allows you to programmatically change routes inside Client Components.
//router.push(href: string, { scroll: boolean }): Perform a client-side navigation to the provided route
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
  const { toast } = useToast();
  const router = useRouter();
  console.log("");
  return <div></div>;
};

export default page;
