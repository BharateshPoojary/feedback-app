import dbConnection from "@/lib/dbConnect";
import { sendverificationemail } from "@/helpers/sendverificationemail";
import UserModel from "@/model/User";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  /**request is the name of the parameter, which represents the incoming HTTP request.
Request is a type, often provided by libraries or frameworks (like Express, Next.js, or the Fetch API), that describes the structure and properties of an HTTP request object. */
  //The function name is http request method like GET,POST etc based on scenario and  the api routes are automatically recognized by the folder structure like here /api/signUp etc

  await dbConnection();
  try {
    const { username, email, password } = await request.json();
    /**This part waits for the JSON content of the incoming request to be parsed. The request.json() method reads the body of the request as JSON, which is typically used when the request's body contains JSON data (like {"username": "example", "email": "example@example.com", "password": "securepassword"}). */
    const isExisting_user_by_this_username = await UserModel.findOne({
      username: username,
    });
    //if  user exist by this username
    if (isExisting_user_by_this_username) {
      return Response.json(
        { success: false, message: "Username already exists" },
        { status: 409 }
      );
    }
    const Existing_user_by_this_email = await UserModel.findOne({
      email: email,
    });
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    const ExpiryDate = new Date();
    ExpiryDate.setHours(ExpiryDate.getHours() + 1);
    //if a user exist by this email
    if (Existing_user_by_this_email) {
      //if a user exist by this email and is verified
      if (Existing_user_by_this_email.isVerified) {
        return Response.json(
          { success: false, message: "User with this email already exists" },
          { status: 409 }
        );
      } else {
        //if a user exist by this email and is  not verified which means he is updating  his password
        const hashedpasswordfornewpassword = await bcrypt.hash(password, 10);
        Existing_user_by_this_email.password = hashedpasswordfornewpassword;
        Existing_user_by_this_email.verifyCode = verifyCode;
        Existing_user_by_this_email.verifyCodeExpiry = ExpiryDate;
      }
    } else {
      //if a user does not exist then regsitering a new user
      const hashedpassword = await bcrypt.hash(password, 10);
      const creatingnewuser = new UserModel({
        username: username,
        useremail: email,
        password: hashedpassword,
        verifyCode: verifyCode,
        verifyCodeExpiry: ExpiryDate,
        isVerified: false,
        isAcceptingMessage: true,
        message: [],
      });
      await creatingnewuser.save();
    }

    const verificationemail = await sendverificationemail(
      email,
      username,
      verifyCode
    );
    if (!verificationemail.success) {
      return Response.json(
        { success: false, message: verificationemail.message },
        { status: 500 }
      );
    } else {
      return Response.json(
        {
          success: true,
          message: verificationemail.message,
        },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error("Error registering user", error);
    return Response.json(
      { success: false, message: "Error Registering user" },
      { status: 500 }
    ); //code 500 means something went wrong on the server
  }
}
