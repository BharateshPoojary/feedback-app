"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { AppDispatch, RootState } from "@/lib/store";
import { ApiResponse } from "@/types/ApiResponse";
import axios, { AxiosError } from "axios";
import { CloudUpload, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setTextArea } from "@/lib/features/textArea/textAreaSlice";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import "@/app/globals.css";
import { AnyARecord } from "dns";
const page = () => {
  type MediaData = {
    getPresignedUrl: string;
    fileName: string;
    key: string;
  };
  const dispatch: AppDispatch = useDispatch();
  const { content } = useSelector((state: RootState) => state.textArea);
  const { toast } = useToast();
  const params = useParams<{ username: string }>();
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isMediaUploading, setIsMediaUploading] = useState<boolean>(false);
  const [mediaData, setMediaData] = useState<MediaData[]>([
    { getPresignedUrl: "", fileName: "", key: "" },
  ]);
  const [ImageExtensionsAllowed, setImageExtensionsAllowed] = useState<
    string[]
  >([]);
  const [VideoExtensionsAllowed, setVideoExtensionsAllowed] = useState<
    string[]
  >([]);
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
  useEffect(() => {
    setImageExtensionsAllowed(img_extensions);
    setVideoExtensionsAllowed(video_extensions);
  }, [mediaData]);
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
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
    const response = await Promise.all(
      acceptedFiles.map(async (file) => {
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

        const filename = file.name.replaceAll(" ", "-");
        // const uniquefilename:Array<string> = [] ;
        const uniquefilename = Date.now() + filename;

        // console.log(object)
        try {
          setIsMediaUploading(true);
          const putPresignedUrlRequest = await axios.get<ApiResponse>(
            `/api/presigned-url?file=${uniquefilename}&type=${file.type}`
          );
          if (putPresignedUrlRequest.data) {
            const { putPresignedUrl, getPresignedUrl, fileName, key } =
              putPresignedUrlRequest.data as {
                putPresignedUrl: string;
                getPresignedUrl: string;
                fileName: string;
                key: string;
              };

            try {
              const uploadFileToS3Bucket = await axios.put(
                putPresignedUrl,
                file
              );
              if (uploadFileToS3Bucket) {
                console.log("File Uploaded successfully");
              }
              console.log(getPresignedUrl);

              return { getPresignedUrl, fileName, key };
            } catch (error: unknown) {
              let errorMessage = "Failed to upload file"; // Default message

              if (error instanceof Error) {
                errorMessage = error.message; // Extract error message from Error object
              } else if (typeof error === "string") {
                errorMessage = error; // Handle string errors
              }

              toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
              });
            }
          }
        } catch (error) {
          const axiosError = error as AxiosError<ApiResponse>;
          toast({
            title: "Error",
            description:
              axiosError.response?.data.message || "Failed to upload file",
            variant: "destructive",
          });
        } finally {
          setIsMediaUploading(false);
        }
      })
    );
    setMediaData(response as MediaData[]);
  }, []);

  const username = params.username;
  const decodedusername = username.replace(/%20/g, " ");
  const handleClick = async (): Promise<void> => {
    console.log("Media Data", mediaData);

    const keyString: string = mediaData
      .map((eachMediaData) => eachMediaData.key)
      .join(",");
    console.log("KeyString", keyString);

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
        mediaPath: keyString,
      });
      toast({ title: "Success", description: result.data?.message });
      dispatch(setTextArea(""));
      setMediaData([{ getPresignedUrl: "", fileName: "", key: "" }]);
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
  if (isMediaUploading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <CloudUpload className="h-52 w-52 text-gray-500" />
        <div className="text-gray-500 text-lg">Uploading...</div>
      </div>
    );
  }
  const handleDelete = async (deleteFileName: string) => {
    try {
      // console.log(fileName);
      const result = await axios.delete<ApiResponse>(
        `/api/delete-object/${deleteFileName}`
      );
      if (result.data.success) {
        setMediaData(
          mediaData.filter((eachMediaData) => {
            console.log(eachMediaData.fileName, deleteFileName);
            return eachMediaData.fileName !== deleteFileName;
          })
        );
        toast({ title: "success", description: result.data.message });
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Error",
        description:
          axiosError.response?.data.message || "Error deleting Media",
        variant: "destructive",
      });
    }
  };
  // console.log(mediaData);
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
          <div className="flex  md:flex-row flex-col justify-between items-top">
            <div
              className={`drop-zone ${
                mediaData.length > 4 ? "pointer-events-none opacity-50" : ""
              }`}
              {...getRootProps()}
            >
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
            <div className="mt-5 grid min-[431px]:grid-cols-2 grid-cols-1 gap-4 max-[378px]:w-full ">
              {mediaData.map((eachMediaData, index) => (
                <div
                  key={index}
                  className="flex  max-[378px]:justify-center justify-top items-top"
                >
                  {ImageExtensionsAllowed.includes(
                    eachMediaData.key.split(".").pop() || ""
                  ) && (
                    <>
                      <Image
                        src={eachMediaData.getPresignedUrl}
                        width={1000}
                        height={1000}
                        alt="UploadedImage"
                        className="min-[1155px]:h-60  min-[1155px]:w-60 h-40 w-40 "
                      />
                      <Trash2
                        className="text-red-700 cursor-pointer"
                        onClick={() => handleDelete(eachMediaData.fileName)}
                      />
                    </>
                  )}
                  {VideoExtensionsAllowed.includes(
                    eachMediaData.key.split(".").pop() || ""
                  ) && (
                    <>
                      {" "}
                      <video
                        src={eachMediaData.getPresignedUrl}
                        controls
                        width={1000}
                        height={1000}
                        className="min-[1155px]:h-60  min-[1155px]:w-60 h-40 w-40 "
                      ></video>
                      <Trash2
                        className="text-red-700 cursor-pointer"
                        onClick={() => handleDelete(eachMediaData.fileName)}
                      />
                    </>
                  )}
                </div>
              ))}
            </div>
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
            Create Your Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default page;
