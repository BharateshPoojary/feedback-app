import { z } from "zod";
import dbConnection from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { verifySchema } from "@/schemas/verifySchema";
export async function POST(request: Request) {
  await dbConnection();
  try {
    const verificationCodeSchema = z.object({
      otp: verifySchema,
    });
    const { username, otp } = await request.json();
    const decodedusername = decodeURIComponent(username); //this function removes any whitespace code like %20 for white space and we will get the correct username
    const verificationCodeResult = verificationCodeSchema.safeParse({ otp });
    if (!verificationCodeResult.success) {
      const verificationCodeErrorspecifictovalidation =
        verificationCodeResult.error.format().otp?.code?._errors || [];
      return Response.json(
        {
          success: false,
          message:
            verificationCodeErrorspecifictovalidation.length > 0
              ? verificationCodeErrorspecifictovalidation.join(", ")
              : "Invalid verfication code",
        },
        { status: 500 }
      );
    }
    const { code } = verificationCodeResult.data.otp;
    const user = await UserModel.findOne({
      username: decodedusername,
      verifyCode: code,
    });
    if (!user) {
      return Response.json(
        {
          success: false,
          message: "User Not Found",
        },
        { status: 500 }
      );
    }
    const verifyCodeVerification = user.verifyCode === code;
    const isverifyCodeExpired = new Date(user.verifyCodeExpiry) > new Date();
    if (isverifyCodeExpired) {
      return Response.json(
        {
          success: false,
          message: "verification code has expired.Please signUp again ",
        },
        { status: 500 }
      );
    } else if (!verifyCodeVerification) {
      return Response.json(
        {
          success: false,
          message: "Incorrect verification code ",
        },
        { status: 500 }
      );
    } else {
      user.isVerified = true; //making user verification to true important one
      await user.save();
      return Response.json(
        {
          success: true,
          message: "Account verified successfully",
        },
        { status: 200 }
      );
    }
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: "Error verifying code",
      },
      { status: 500 }
    );
  }
}
