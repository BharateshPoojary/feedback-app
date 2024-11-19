import { useToast } from "@/hooks/use-toast";
import { Message } from "@/model/User";
import { ApiResponse } from "@/types/ApiResponse";
import axios from "axios";
import React from "react";
type MessageCardProps = {
  message: Message;
  onMessageDelete: (messageId: string) => void;
};
const MessageCard = ({ message, onMessageDelete }): MessageCardProps => {
  const { toast } = useToast();
  const handleDelete = async () => {
    const response = await axios.delete<ApiResponse>(
      `/api/delete-form/${message._id}`
    );
    toast({
      success: true,
      message: response.data.message,
    });
    onMessageDelete(message._id);
  };
  return <div></div>;
};

export default MessageCard;
