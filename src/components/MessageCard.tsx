import { useToast } from "@/hooks/use-toast";
import { Message } from "@/model/User";
import { ApiResponse } from "@/types/ApiResponse";
import axios from "axios";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type MessageCardProps = {
  message: Message;
  onMessageDelete: (messageId: string) => void;
};
const MessageCard = ({ message, onMessageDelete }: MessageCardProps) => {
  const { toast } = useToast();
  const handleDelete = async () => {
    const response = await axios.delete<ApiResponse>(
      `/api/delete-form/${message._id}`
    );
    toast({
      title: "Success",
      description: response.data.message,
    });
    onMessageDelete(message._id);
  };
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card Description</CardDescription>
        </CardHeader>
        <CardContent></CardContent>
      </Card>
    </div>
  );
};

export default MessageCard;
