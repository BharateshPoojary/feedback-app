import { useToast } from "@/hooks/use-toast";
import { Message } from "@/model/User";
import { ApiResponse } from "@/types/ApiResponse";
import axios from "axios";
import React from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"; //using the card component of shadcn
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"; //using the alert dialog
import { Button } from "@/components/ui/button"; //using the button component
import { X } from "lucide-react"; //using X icon from lucide-react
type MessageCardProps = {
  //using type aliases for custom type for Message card props
  message: Message; //message which is of type Message
  onMessageDelete: (messageId: string) => void; //this is a function to access the message id in case if anyone deleted the message from other components
};
const MessageCard = ({ message, onMessageDelete }: MessageCardProps) => {
  const { toast } = useToast();
  const handleDelete = async () => {
    //handling delete route
    const response = await axios.delete<ApiResponse>(
      `/api/delete-message/${message._id}`
    ); //sending the messageId in url params
    toast({
      title: response.data.message,
    });
    onMessageDelete(message._id); //function for accessing the messageId from other components and (sending it to the params for deleting from DB)
  };
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              {/*<AlertDialogTrigger asChild> is used to customize or replace the default trigger element. This pattern allows you to use your own element (e.g., a button or link) as the trigger for opening the dialog, rather than the library's default trigger styling and behavior. When you pass the asChild prop, it means the component will not create its own wrapper DOM element for the trigger. Instead, the child element you provide becomes the actual element used in the DOM, and the library's behavior (e.g., event listeners or ARIA attributes) is attached to this child element directly. This helps you avoid unnecessary additional DOM nodes and gives you more control over styling and structure. */}
              <Button variant="destructive">
                <X className="w-5 h-5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  your account and remove your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <CardDescription>Card Description</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
};

export default MessageCard;
