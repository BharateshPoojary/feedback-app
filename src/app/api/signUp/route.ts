import dbConnection from "@/lib/dbConnect";
import { sendverificationemail } from "@/helpers/sendverificationemail";
import { CredUserModel, OauthUserModel } from "@/model/User";
import bcrypt from "bcryptjs";
import { responseContent } from "@/hooks/use-response";

export async function POST(request: Request) {
  /**request is the name of the parameter, which represents the incoming HTTP request.
Request is a type, often provided by libraries or frameworks (like Express, Next.js, or the Fetch API), that describes the structure and properties of an HTTP request object. */
  //The function name is http request method like GET,POST etc based on scenario and  the api routes are automatically recognized by the folder structure like here /api/signUp etc

  await dbConnection();
  try {
    const { userName, email, password } = await request.json();
    /**This part waits for the JSON content of the incoming request to be parsed. The request.json() method reads the body of the request as JSON, which is typically used when the request's body contains JSON data (like {"username": "example", "email": "example@example.com", "password": "securepassword"}). */
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    const ExpiryDate = new Date();

    const isExisting_user_by_this_username = await CredUserModel.findOne({
      username: userName,
    });
    const Existing_user_by_this_email = await CredUserModel.findOne({
      useremail: email,
    });
    const Existing_user_by_this_email_in_oauth = await OauthUserModel.findOne({
      useremail: email,
    });
    ExpiryDate.setHours(ExpiryDate.getHours() + 1);
    //if a user exist by this email
    if (Existing_user_by_this_email) {
      //if a user exist by this email and is verified
      //console.log("Email existing but not verified");
      if (Existing_user_by_this_email.isVerified) {
        return responseContent(
          false,
          "User with this email already exists",
          409
        );
        // return Response.json(
        //   { success: false, message: "User with this email already exists" },
        //   { status: 409 } //duplicate resource is being created where uniqueness is required
        // );
      } else {
        //if a user exist by this email and is  not verified which means he is updating  his password
        const hashedpasswordfornewpassword = await bcrypt.hash(password, 10);
        Existing_user_by_this_email.password = hashedpasswordfornewpassword;
        Existing_user_by_this_email.verifyCode = verifyCode;
        Existing_user_by_this_email.verifyCodeExpiry = ExpiryDate;
        await Existing_user_by_this_email.save(); // Save updates to DB
      }
    } else {
      //if  user exist by this username
      if (isExisting_user_by_this_username) {
        if (isExisting_user_by_this_username.isVerified) {
          return responseContent(false, "Username already exists", 409);
          // return Response.json(
          //   { success: false, message: "Username already exists" },
          //   { status: 409 } //duplicate resource is being created where uniqueness is required
          // );
        } else {
          const hashedpasswordfornewpassword = await bcrypt.hash(password, 10);
          isExisting_user_by_this_username.password =
            hashedpasswordfornewpassword;
          isExisting_user_by_this_username.verifyCode = verifyCode;
          isExisting_user_by_this_username.verifyCodeExpiry = ExpiryDate;
          await isExisting_user_by_this_username.save();
        }
      } else {
        if (Existing_user_by_this_email_in_oauth) {
          return responseContent(
            false,
            "An account already exists with this email via Google.",
            409
          );
        } else {
          //if a user does not exist then regsitering a new user
          const hashedpassword = await bcrypt.hash(password, 10);
          const creatingnewuser = new CredUserModel({
            username: userName,
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
      }
    }

    const verificationemail = await sendverificationemail(
      email,
      userName,
      verifyCode
    );
    if (!verificationemail.success) {
      return responseContent(false, verificationemail.message, 500);
      // return Response.json(
      //   { success: false, message: verificationemail.message },
      //   { status: 500 } //Internal server error
      // );
    } else {
      return responseContent(true, verificationemail.message, 201);
      // return Response.json(
      //   {
      //     success: true,
      //     message: verificationemail.message,
      //   },
      //   { status: 201 } //New resource created
      // );
    }
  } catch (error) {
    console.error("Error registering user", error);
    return responseContent(false, "Error registering user", 500);
    // return Response.json(
    //   { success: false, message: "Error Registering user" },
    //   { status: 500 }
    // ); //code 500 means something went wrong on the server
  }
}
