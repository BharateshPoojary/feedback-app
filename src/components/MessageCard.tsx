"use client";
import { useToast } from "@/hooks/use-toast";
import { Message } from "@/model/User";
import { ApiResponse } from "@/types/ApiResponse";
import axios, { AxiosError } from "axios";
import React, { useEffect, useState } from "react";
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
import { Loader2, X } from "lucide-react"; //using X icon from lucide-react
import Image from "next/image";
type MessageCardProps = {
  //using type aliases for custom type for Message card props
  message: Message; //message which is of type Message
  onMessageDelete: (messageId: string) => void; //this is a function to access the message id in case if anyone deleted the message from other components
};
type MediaPath = {
  path: string;
  preSignedUrl: string;
};
const MessageCard = ({ message, onMessageDelete }: MessageCardProps) => {
  const [mediaPath, setMediaPath] = useState<MediaPath[]>([
    { path: "", preSignedUrl: "" },
  ]);
  const { toast } = useToast();
  const handleDelete = async () => {
    //handling delete route
    try {
      // setIsDeletingMessage(true);
      const response = await axios.delete<ApiResponse>(
        `/api/delete-message/${message._id}`
      ); //sending the messageId in url params
      toast({
        title: response.data.message,
      });
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Error",
        description:
          axiosError.response?.data.message || "Failed to delete message",
        variant: "destructive",
      });
    }
    //  finally {
    // setIsDeletingMessage(false);
    // }
    onMessageDelete(message._id); //function for accessing the messageId from other components and (sending it to the params for deleting from DB)
  };
  const messageDate = message.createdAt;
  const date = new Date(messageDate);
  const formattedDate = date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });
  const img_extensions: string[] = [
    "apng",
    "avif",
    "gif",
    "jpeg",
    "jpg",
    "png",
    "svg",
    "webp",
    "bmp",
    "tiff",
    "ico", // For image/x-icon
  ];
  const video_extensions: string[] = [
    "mp4",
    "webm",
    "ogg",
    "avi",
    "mpeg",
    "mov", // QuickTime
    "wmv", // x-ms-wmv
    "flv", // x-flv
    "3gp", // 3gpp
    "3g2", // 3gpp2
    "mkv", // x-matroska
  ];

  const mediaPathfromDB: string[] = message?.mediaPath
    ? message.mediaPath.split(",")
    : [];

  // setMediaPath(mediaPathfromDB)
  useEffect(() => {
    if (mediaPathfromDB.length > 0) {
      const fetchPresignedUrls = async () => {
        try {
          const responses = await Promise.all(
            //Promise.all([promise1,promise2]) promise.all() method considers an array of promises which are pending and not yet resolved  so we used await here to wait for the all the promises  to get resolved once all the promises gets resolved  it will return array of objects and this object are {path:string,preSignedUrl:string}
            mediaPathfromDB.map(async (eachMediaPath) => {
              //mediaPathfromDB includes an array of path e.g here eachMediaPath looks like {images/a1.png} we are mapping over that creating new api request for each filename
              const response = await axios.post<ApiResponse>( //using axios to make a request for eachmediapath as we used await it will return a promise here
                "/api/post-path-for-url",
                { fileName: eachMediaPath }
              );
              return {
                //as the promise  is not  resolved  yet so it will return {promise<pending>} where promise<pending> represent our path and pressigned url which is not resolved yet
                path: eachMediaPath,
                preSignedUrl: response.data.getPresignedUrl as string,
              }; //so this will will continue for eachmediapath and at last it will return an array of promises as  [
              //   Promise { <pending> }, // API call for "file1.jpg"
              //   Promise { <pending> }, // API call for "file2.png"
              //   Promise { <pending> }  // API call for "file3.mp4"
              // ] as map always return in array this is what promise.all() method expects it will consider all this promise and waits until all gets resolved once resolved it will return the desired result e.g an array of  objects in this case  which we expected
            })
          );
          // console.log("Responses", responses);
          setMediaPath(responses); // Setting that array of objects to mediaPath state not maintaining the prev state as after all the promise gets resolved we are pushing that result at once , not each time like we did previously using foreach and spread operator like setMediapath(prev => [...prev,{path:abc , presigned Url : "https://"}])
          // Its a better approach as foreach loop does not wait for async operation to get finished an Promise.all efficiently update the state as well
        } catch (error) {
          const axiosError = error as AxiosError<ApiResponse>;
          toast({
            title: "Error",
            description:
              axiosError.response?.data.message || "Failed to get URL",
            variant: "destructive",
          });
        }
      };

      fetchPresignedUrls();
    }
  }, []); // Empty dependency array ensures this runs only once

  // mediaPathfromDB.forEach(eachMediaPath => {
  //   const getExtension = eachMediaPath.split(".").pop() || "";
  //   if(img_extensions.includes(getExtension)){

  //   }

  // });
  return (
    <div>
      <Card>
        <CardHeader>
          <div className="flex flex-row justify-between">
            <CardTitle>{message.content}</CardTitle>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                {/*<AlertDialogTrigger asChild> is used to customize or replace the default trigger element. This pattern allows you to use your own element (e.g., a button or link) as the trigger for opening the dialog, rather than the library's default trigger styling and behavior. When you pass the asChild prop, it means the component will not create its own wrapper DOM element for the trigger. Instead, the child element you provide becomes the actual element used in the DOM, and the library's behavior (e.g., event listeners or ARIA attributes) is attached to this child element directly. This helps you avoid unnecessary additional DOM nodes and gives you more control over styling and structure. */}
                <Button variant="destructive" className="w-7 h-7">
                  <X />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    You want to delete this message
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
          </div>
          <CardDescription>{formattedDate}</CardDescription>
          <div className="mt-5 grid min-[431px]:grid-cols-2 grid-cols-1 gap-4 max-[378px]:w-full ">
            {mediaPath.length > 0 &&
              mediaPath
                .filter(
                  (eachMediaData) =>
                    eachMediaData.path !== "" &&
                    eachMediaData.preSignedUrl !== ""
                )
                .map((eachMediaData, index) => (
                  <div
                    key={index}
                    className="flex  max-[378px]:justify-center justify-top items-top"
                  >
                    {img_extensions.includes(
                      eachMediaData.path.split(".").pop() || ""
                    ) && (
                      <>
                        <Image
                          src={eachMediaData.preSignedUrl}
                          width={1000}
                          height={1000}
                          alt="UploadedImage"
                          className="min-[1155px]:h-60  min-[1155px]:w-60 h-40 w-40 "
                        />
                      </>
                    )}
                    {video_extensions.includes(
                      eachMediaData.path.split(".").pop() || ""
                    ) && (
                      <>
                        {" "}
                        <video
                          src={eachMediaData.preSignedUrl}
                          controls
                          width={1000}
                          height={1000}
                          className="min-[1155px]:h-60  min-[1155px]:w-60 h-40 w-40 "
                        ></video>
                      </>
                    )}
                  </div>
                ))}
          </div>
        </CardHeader>
      </Card>
    </div>
  );
};

export default MessageCard;
