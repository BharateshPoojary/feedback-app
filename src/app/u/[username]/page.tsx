"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { AppDispatch, RootState } from "@/lib/store";
import { ApiResponse } from "@/types/ApiResponse";
import axios, { AxiosError } from "axios";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setTextArea } from "@/lib/features/textArea/textAreaSlice";
import { useDropzone } from "react-dropzone";
import "@/app/globals.css";
const page = () => {
  const dispatch: AppDispatch = useDispatch();
  const { content } = useSelector((state: RootState) => state.textArea);
  const { toast } = useToast();
  const params = useParams<{ username: string }>();
  const [isSending, setIsSending] = useState<boolean>(false);
  const onDrop = useCallback((acceptedFiles: File[]) => {
    console.log(acceptedFiles);
    if (acceptedFiles.length > 4) {
      toast({
        title: "Maximun 4 files can be sent at a time",
        variant: "destructive",
      });
      return;
    }
    const allowedImageTypes: Array<string> = [
      "image/apng",
      "image/avif",
      "image/gif",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/svg+xml",
      "image/webp",
      "image/bmp",
      "image/tiff",
      "image/x-icon",
    ];
    const allowedVideoTypes: Array<string> = [
      "video/mp4",
      "video/webm",
      "video/ogg",
      "video/avi",
      "video/mpeg",
      "video/quicktime",
      "video/x-ms-wmv",
      "video/x-flv",
      "video/3gpp",
      "video/3gpp2",
      "video/x-matroska",
    ];
    const allowedFileTypes: Array<string> = [
      ...allowedImageTypes,
      ...allowedVideoTypes,
    ];
    let totalFileSize: number = 0;
    acceptedFiles.forEach((file) => {
      if (!allowedFileTypes.includes(file.type)) {
        toast({
          title: "You can upload only image and video file ",
          variant: "destructive",
        });
        return;
      }
      totalFileSize += file.size;
      console.log(totalFileSize);
      const allowedFileSize = 41943040;
      if (totalFileSize > allowedFileSize) {
        toast({
          title: "Total file size should not exceed 40MB",
          variant: "destructive",
        });
        return;
      }
    });
    acceptedFiles.forEach(async (file) => {
      const filename = file.name.replaceAll(" ", "-");
      // const uniquefilename:Array<string> = [] ;
      const uniquefilename = Date.now() + filename;
      // console.log(object)
      try {
        const getPresignedUrl = await axios.get(
          `/api/presigned-url?file=${uniquefilename}`
        );
        if (getPresignedUrl.data) {
          const { preSignedUrl } = getPresignedUrl.data;
          console.log(preSignedUrl);
        }
      } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>;
        toast({
          title: "Error",
          description:
            axiosError.response?.data.message || "Failed to upload file",
          variant: "destructive",
        });
      }
    });
  }, []);

  const username = params.username;
  const decodedusername = username.replace(/%20/g, " ");
  const handleClick = async (): Promise<void> => {
    if (content.trim() === "") {
      toast({
        title: "Please enter a message",
      });
      return;
    }
    try {
      setIsSending(true);
      const result = await axios.post<ApiResponse>("/api/send-message", {
        username: decodedusername,
        content,
      });
      toast({ title: "Success", description: result.data?.message });
      dispatch(setTextArea(""));
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Error",
        description:
          axiosError.response?.data.message || "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });
  return (
    <div className="max-w-full w-full h-[100vh]  flex flex-col sm:justify-between justify-evenly items-center">
      <div className="max-w-7xl w-full my-4 p-6 h-fit">
        <p className="text-4xl font-extrabold text-center">
          Public Profile Link
        </p>
        <div>
          <p className="font-bold p-4">
            Send Anonymous Message to @{decodedusername}
          </p>
          <Textarea
            placeholder="Type your message here."
            className="h-40"
            value={content}
            onChange={(e) => {
              dispatch(setTextArea(e.target.value));
            }}
          />
          <div className="drop-zone" {...getRootProps()}>
            <input {...getInputProps()} />
            {isDragActive ? (
              <div className="drop-files">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  height="50"
                  width="50"
                  fill="currentColor"
                >
                  <path d="M1 14.5C1 12.1716 2.22429 10.1291 4.06426 8.9812C4.56469 5.044 7.92686 2 12 2C16.0731 2 19.4353 5.044 19.9357 8.9812C21.7757 10.1291 23 12.1716 23 14.5C23 17.9216 20.3562 20.7257 17 20.9811L7 21C3.64378 20.7257 1 17.9216 1 14.5ZM16.8483 18.9868C19.1817 18.8093 21 16.8561 21 14.5C21 12.927 20.1884 11.4962 18.8771 10.6781L18.0714 10.1754L17.9517 9.23338C17.5735 6.25803 15.0288 4 12 4C8.97116 4 6.42647 6.25803 6.0483 9.23338L5.92856 10.1754L5.12288 10.6781C3.81156 11.4962 3 12.927 3 14.5C3 16.8561 4.81833 18.8093 7.1517 18.9868L7.325 19H16.675L16.8483 18.9868ZM13 13V17H11V13H8L12 8L16 13H13Z"></path>
                </svg>
              </div>
            ) : (
              <p className="drag-files">
                {" "}
                Drag 'n' drop some files here,or click to select files{" "}
              </p>
            )}
          </div>
          {/* File upload element */}
          <div className="flex justify-center items-center">
            <Button
              className="my-5 p-5 px-10 hover:bg-gray-500"
              onClick={handleClick}
            >
              {isSending ? (
                <>
                  <Loader2 className="animate-spin" />
                  Sending..
                </>
              ) : (
                "Send"
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className=" max-w-7xl w-full p-6">
        <Separator />
        <p className=" text-xl text-bold text-center my-2">
          Get Your Message Board
        </p>
        <div className="flex  justify-center items-center">
          <Link
            href={"/"}
            className="my-2 p-2 rounded-lg bg-slate-900 text-slate-100 hover:bg-gray-500"
            onClick={() => dispatch(setTextArea(""))}
          >
            Create Your Account{" "}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default page;
