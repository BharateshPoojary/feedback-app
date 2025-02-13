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
  const { data: session } = useSession(); //To retrieve session data this will trigger [...nextauth]
  const handleDeleteMessage = (messageId: string) => {
    //this is for optimistic ui
    setMessages(Messages.filter((message) => message._id !== messageId));
  };
  //This function is for deleting messages it considers message id
  //and filters from the messages array and display the filtered one at that time only
  //here we are following optimistic approach fom db we will delete it later on using its Id
  //Like in Instagram the like is happened at that time only but it is reflected on server later on
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
      setValue("acceptMessages", response.data.isAcceptingMessages ?? false); //here i have a provided default value using the ?? operator, which ensures undefined (or null) gets replaced by a fallback value:
      //set ValueProgrammatically updates the value of a field.
      //This function allows you to dynamically set the value of a registered field and have the options to validate and update the form state.
    } catch (error) {
      //handling error if there is any error while getting acceptmessage value
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
      const responseForSwitchingAcceptMessage = await axios.post<ApiResponse>( //this api request is for sending the user accepting message property
        "/api/accept-messages",
        {
          acceptMessage: !acceptMessages, //when the user switch the message accepting property if it is previously true then it will send false or vice versa
        }
      );
      if (responseForSwitchingAcceptMessage) {
        setValue("acceptMessages", !acceptMessages); //if the switching is done in server side then we will also reflect it in client side by setting its value
        toast({
          title: responseForSwitchingAcceptMessage.data.message,
          variant: "default",
        });
      }
    } catch (error) {
      const axioserror = error as AxiosError<ApiResponse>; //in case any error while switching
      toast({
        title: "Error",
        description:
          axioserror.response?.data.message ||
          "Failed to  switch message settings",
        variant: "destructive",
      });
    }
  };

  console.log("User Session", session);//here 
  if (!session || !session?.user) return;
  //Once we get session after that we will safely retrieve the username
  //here our if is like a boundary it will check if the session is present or not if notit will be returned from here only 

  const { username } = session?.user; //accessing user name
  const baseUrl = `${window.location.protocol}//${window.location.host}`; /*window.location.protocol:
  Specifies the protocol used in the URL (e.g., http: or https:). 
  window.location.host:
  Specifies the hostname and port number of the URL (e.g., example.com:8080).*/
  const profileUrl = `${baseUrl}/u/${username}`; //profile url of the particular user which he can give to any one an they may send anonymous messages to him
  const copyToClipboard = () => {
    //function for handling copying the profile url
    navigator.clipboard.writeText(profileUrl); //writeText: Copies the provided string to the clipboard
    toast({
      //sending toast message after copying
      title: "Success",
      description: "URL Copied to Clipboard",
    });
  };

  return (
    <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
      <h1 className="text-4xl font-bold mb-4">User Dashboard</h1>
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Copy Your Unique Link</h2>
        <div className="flex items-center">
          <input
            type="text"
            value={profileUrl} //profile url will be by default a  value to this input tag which this logged in user can copy
            disabled //it is disabled as user cannot edit this input only can copy
            className="input input-bordered w-full p-2 mr-2"
          />
          <Button onClick={copyToClipboard}>Copy</Button>
          {/* button for copying to clipboard*/}
        </div>
      </div>

      <div className="mb-4">
        <Switch
          {...register(
            "acceptMessages"
          )} /*{...register("acceptMessages")}: This is a function from a library like React Hook Form.
          It registers the switch with a form field named "acceptMessages", enabling it to be validated and tracked as part of the form. (registering the switch as form field with the name as "acceptMessages" )*/
          checked={acceptMessages} //it is to determine  / verify whether the user is accepting message or not i.e if it is true which means user is accepting message or vice versa
          onCheckedChange={handleSwitchChange} // A callback function (handleSwitchChange) that handles toggling logic when the switch is clicked or toggled.
          disabled={
            isSwitching
          } /*Controls whether the switch is interactive or not.
          When disabled is true, the user cannot toggle the switch. This is controlled by the isSwitching state.*/
        />
        <span className="ml-2">
          Accept Messages: {acceptMessages ? "On" : "Off"}
          {/*  Displays text that reflects the current state of acceptMessages:
            If acceptMessages is true, it shows "Accept Messages: On".
            If false, it shows "Accept Messages: Off". */}
        </span>
      </div>
      <Separator />
      {/* a line from shadcn to separate the ui components    */}

      <Button
        className="mt-4"
        variant="outline"
        onClick={(e) => {
          e.preventDefault();
          fetchMessages(true); //this is a button for refreshing generally to get new messaeges its a function which will run it considers true argument to make refresh true and sending toast message
        }}
      >
        {isLoading ? ( //when the loading is true it will show loader
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCcw className="h-4 w-4" /> //or else if not loading then refresh button so that user can refresh
        )}
      </Button>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {Messages.length > 0 ? ( //if messagelength is >0
          Messages.map(
            (
              message
            ) => (
              <MessageCard //showing message card for each message
                key={message._id} //to uniquely identify each message
                message={message} //this is the actual message we are displaying
                onMessageDelete={handleDeleteMessage} //function for handling deletion of message
              />
            )
          )
        ) : (
          <p>No messages to display.</p> //if no messages to display
        )}
      </div>
    </div>
  );
};
export default page;
