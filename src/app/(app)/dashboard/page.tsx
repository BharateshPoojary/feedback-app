"use client";
import React, { useCallback, useState } from "react";
import { useSession } from "next-auth/react";
import { z } from "zod";
import { acceptMessageSchema } from "@/schemas/acceptMessageSchema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Message } from "@/model/User";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";
import { toast } from "@/hooks/use-toast";
const page = () => {
  const [Messages, setMessages] = useState<Message[]>([]); //to store all the messages in an array
  const [isLoading, setIsLoading] = useState(false); // To ensure loading   when new messages arrive on clicking refresh button
  const [isSwitching, setIsSwitching] = useState(false); //To ensure whether user is accepting messages or not
  const deleteMessage = (messageId: string) => {
    setMessages(Messages.filter((message) => message._id !== messageId));
  };
  //This function is for deleting messages it considers message id
  //and filters from the messages array and display the filtered one at that time only
  //here we are following optimistic approach fom db we will delete it later on using its Id
  //Like in Instagram the like is happened at that time only but it is reflected on server later on
  const { data: session } = useSession(); //To retrieve session data
  const form = useForm<z.infer<typeof acceptMessageSchema>>({
    resolver: zodResolver(acceptMessageSchema),
  }); //using useForm in order to ensure or get the user behavior  whether user is accepting message or not using a switch in a form
  const { register, watch, setValue } = form;
  //register allows React Hook Form to track the values, validation, and interactions of the particular input fields.
  //It means linking form component to React Hook Form's internal state management system.
  const acceptMessages = watch("accept-message"); //Watches specific fields for changes in their values here the field name is accept-message

  const fetchAcceptMessage = useCallback(async () => {
    //useCallback avoids the overhead of re-creating the function on every render it will be same unless it dependencies gets change
    //usecallback is mainly used when functions include heavy computation and should not be recreted on every page render this will optimize the performance
    setIsSwitching(true); //user is switching right now
    try {
      const response = await axios.get<ApiResponse>("/api/accept-messages"); //accessing the user's accepting message which is boolean
      setValue("accept-message", response.data.isAcceptingMessage); //set ValueProgrammatically updates the value of a field.
    } catch (error) {
      const axioserror = error as AxiosError<ApiResponse>;
      toast({
        title: "Error",
        description:
          axioserror.response?.data.message ||
          "Failed to  fetch message settings",
        variant: "destructive",
      });
    } finally {
      setIsSwitching(false); //user switching is done
    }
  }, [setValue]); //This call back will only run when setValue changes to prevent unnecessary function calls
  const fetchMessages = useCallback(
    async (refresh: boolean = false) => {
      setIsLoading(true);
      setIsSwitching(false);
      try {
        const response = await axios.get<ApiResponse>("/api/get-messages");
        setMessages(response.data.messages || []);

        if (refresh) {
          toast({
            title: "Refreshed",
            description: "showing latest messages",
          });
        }
      } catch (error) {
        const axioserror = error as AxiosError<ApiResponse>;
        toast({
          title: "Error",
          description:
            axioserror.response?.data.message ||
            "Failed to  fetch message settings",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
        setIsSwitching(false); //user switching is done
      }
    },
    [setIsLoading, setMessages]
  );
  return <div></div>;
};
export default page;
