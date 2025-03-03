import { Message } from "@/model/User";

//Standardizing the api response here
export interface ApiResponse {
  success: boolean;
  message: string;
  isAcceptingMessages?: boolean;
  messages?: Array<Message>;
  putPresignedUrl?: string;
  getPresignedUrl?: string;
  fileName?: string;
  key?: string;
}
