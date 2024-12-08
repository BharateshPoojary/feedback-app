"use client";
import React, { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { z } from "zod";
import { acceptMessageSchema } from "@/schemas/acceptMessageSchema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Message, User } from "@/model/User";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Loader2, RefreshCcw } from "lucide-react";
import MessageCard from "@/components/MessageCard";
const page = () => {
  const [Messages, setMessages] = useState<Message[]>([]); //to store all the messages in an array
  const [isLoading, setIsLoading] = useState(false); // To ensure loading   when new messages arrive on clicking refresh button
  const [isSwitching, setIsSwitching] = useState(false); //To ensure whether user is accepting messages or not
  const handleDeleteMessage = (messageId: string) => {
    //this is for optimistic ui
    setMessages(Messages.filter((message) => message._id !== messageId));
  };
  //This function is for deleting messages it considers message id
  //and filters from the messages array and display the filtered one at that time only
  //here we are following optimistic approach fom db we will delete it later on using its Id
  //Like in Instagram the like is happened at that time only but it is reflected on server later on
  const { data: session } = useSession(); //To retrieve session data
  if (!session || !session?.user) {
    return <div>Please Login</div>;
  }
  const form = useForm<z.infer<typeof acceptMessageSchema>>({
    resolver: zodResolver(acceptMessageSchema),
  }); //using useForm in order to ensure or get the user behavior  whether user is accepting message or not using a switch in a form
  const { register, watch, setValue } = form;
  //register allows React Hook Form to track the values, validation, and interactions of the particular input fields.
  //It means linking form component to React Hook Form's internal state management system.
  const acceptMessages = watch("acceptMessages"); //Watches specific fields for changes in their values here the field name is accept-message
  // watch("accept-Messages"); will watch specified input and if any changes to its value it will return that value
  const fetchAcceptMessage = useCallback(async () => {
    //useCallback avoids the overhead of re-creating the function on every render it will be same unless it dependencies gets change
    //usecallback is mainly used when functions include heavy computation and should not be recreted on every page render this will optimize the performance
    setIsSwitching(true); //user is switching right now
    try {
      const response = await axios.get<ApiResponse>("/api/accept-messages"); //accessing the user's accepting message which is boolean
      setValue("acceptMessages", response.data.isAcceptingMessages as boolean); //set ValueProgrammatically updates the value of a field.
      //This function allows you to dynamically set the value of a registered field and have the options to validate and update the form state.
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
    //this function is for fetching all the messages
    async (refresh: boolean = false) => {
      //includes a parameter whose default value is false this is to ensure whether user clicked refresh button or not
      setIsLoading(true); //loading the messages
      // setIsSwitching(false);
      try {
        const response = await axios.get<ApiResponse>("/api/get-messages"); //getting all messages
        setMessages(response.data.messages || []); //setting in setmessage array

        if (refresh) {
          //if refreshed successfully then showing toast
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
            axioserror.response?.data.message || "Failed to  fetch messages",
        });
      } finally {
        setIsLoading(false);
        // setIsSwitching(false); //user switching is done
      }
    },
    [setIsLoading, setMessages]
  );
  //calling the function on specific cases using useeffect
  useEffect(() => {
    if (!session || !session?.user) return;
    fetchMessages(); //TO ACCESS ALL MESSAGES
    fetchAcceptMessage(); //TO VERIFY WHETHER USER IS ACCEPTING MESSAGE OR NOT

    return;
  }, [session, setValue, fetchAcceptMessage, fetchMessages]);

  //HANDLING SWITCHING OF ACCEPT MESSAGE
  const handleSwitchChange = async () => {
    try {
      const responseForSwitchingAcceptMessage = await axios.post<ApiResponse>(
        "/api/accept-messages",
        {
          acceptMessage: !acceptMessages,
        }
      );
      if (responseForSwitchingAcceptMessage) {
        setValue("acceptMessages", !acceptMessages);
        toast({
          title: responseForSwitchingAcceptMessage.data.message,
          variant: "default",
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
    }
  };
  const { username } = session?.user as User;
  const baseUrl = `${window.location.protocol}//${window.location.host}`;
  const profileUrl = `${baseUrl}/u/${username}`;
  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl);
    toast({
      title: "Success",
      description: "URL Copied to Clipboard",
    });
  };
  return (
    <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
      <h1 className="text-4xl font-bold mb-4">User Dashboard</h1>
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Copy Your Unique Link</h2>{" "}
        <div className="flex items-center">
          <input
            type="text"
            value={profileUrl}
            disabled
            className="input input-bordered w-full p-2 mr-2"
          />
          <Button onClick={copyToClipboard}>Copy</Button>
        </div>
      </div>

      <div className="mb-4">
        <Switch
          {...register("acceptMessages")}
          checked={acceptMessages}
          onCheckedChange={handleSwitchChange}
          disabled={isSwitching}
        />
        <span className="ml-2">
          Accept Messages: {acceptMessages ? "On" : "Off"}
        </span>
      </div>
      <Separator />

      <Button
        className="mt-4"
        variant="outline"
        onClick={(e) => {
          e.preventDefault();
          fetchMessages(true);
        }}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCcw className="h-4 w-4" />
        )}
      </Button>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {Messages.length > 0 ? (
          Messages.map((message, index) => (
            <MessageCard
              key={message._id}
              message={message}
              onMessageDelete={handleDeleteMessage}
            />
          ))
        ) : (
          <p>No messages to display.</p>
        )}
      </div>
    </div>
  );
};
export default page;
