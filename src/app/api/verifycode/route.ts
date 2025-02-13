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
    const verificationCodeResult = verificationCodeSchema.safeParse({ otp }); //Safely parse this object It returns the data inside data object
    if (!verificationCodeResult.success) {
      const verificationCodeErrorspecifictovalidation =
        verificationCodeResult.error.format().otp?._errors || [];
      return Response.json(
        {
          success: false,
          message:
            verificationCodeErrorspecifictovalidation.length > 0
              ? verificationCodeErrorspecifictovalidation.join(", ")
              : "Invalid verfication code",
        },
        { status: 400 } //BAD REQUEST
      );
    }
    const vCode = verificationCodeResult.data.otp.code;
    const user = await UserModel.findOne({
      username: decodedusername,
    });
    if (!user) {
      return Response.json(
        {
          success: false,
          message: "User Not Found",
        },
        { status: 404 } //requested resource (in this case, the user) does not exist on the server.
      );
    }
    const verifyCodeVerification = user.verifyCode === vCode;
    const isverifyCodeExpired = user.verifyCodeExpiry > new Date();
    // console.log(
    //   "expiry data from db ",
    //   user.verifyCodeExpiry,
    //   "Current date",
    //   new Date()
    // );
    // console.log("Date Valid till", new Date(user.verifyCodeExpiry));
    if (!isverifyCodeExpired) {
      return Response.json(
        {
          success: false,
          message: "verification code has expired.Please signUp again ",
        },
        { status: 410 } //The resource (verification code) is no longer available and will not be available again.
      );
    } else if (!verifyCodeVerification) {
      return Response.json(
        {
          success: false,
          message: "Incorrect verification code ",
        },
        { status: 400 } //bad request
      );
    } else {
      user.isVerified = true; //making user verification to true important one
      await user.save(); //THIS IS IMPORTANT
      return Response.json(
        {
          success: true,
          message: "Account verified successfully",
        },
        { status: 200 } //Request Succeeded
      );
    }
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: "Error verifying code",
      },
      { status: 500 } //Internal server error
    );
  }
}
