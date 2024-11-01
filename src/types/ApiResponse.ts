import { Message } from "@/model/User";

//Standardizing the api response here
export interface ApiResponse {
  success: boolean;
  message: string;
  isAcceptingMessage?: boolean;
  messages?: Array<Message>;
}
