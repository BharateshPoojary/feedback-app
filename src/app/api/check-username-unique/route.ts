import { z } from "zod";
import { userNameValidation } from "../../../schemas/signUpSchema";
import dbConnection from "@/lib/dbConnect";
import UserModel from "@/model/User";

const usernamequerySchema = z.object({
  //creating usernamequerySchema it is the Schema to which the username query must adhere
  username: userNameValidation, //this is the userNameValidation  our username query parameter must follow
});
export async function GET(request: Request) {
  //This route will only accept GET request
  await dbConnection(); //connecting to database
  try {
    const { searchParams } = new URL(request.url); //accessing  all the query paramter from the url using destructuring
    const queryParams = { username: searchParams.get("username") }; //It will search for the query parameter  named username in the url like https://localhost:3000/api?username=bharat?default=true
    const result = usernamequerySchema.safeParse(queryParams); //applying the schema to username query paramter
    if (!result.success) {
      //if the result is not success means there are  some errors
      const usernameErrors = result.error.format().username?._errors || []; //getting the errors specific to username validation which is optional or else it will return an empty array
      /**Without initializing usernameErrors as an empty array, it could be undefined if result.error.format().username?._errors doesn't exist. This can lead to issues if you try to check its length or use array methods like join, as they aren't defined on undefined. */
      return Response.json(
        {
          success: false,
          message:
            usernameErrors?.length > 0
              ? usernameErrors.join(", ") //getting all the relevant errors seperated by commas
              : "Invalid query parameters", //if there is no error specific to username Validation it will return this message
        },
        { status: 400 }
      );
    }
    const { username } = result.data; //accessing the username
    const isExistingUserVerified = await UserModel.findOne({
      username,
      isVerified: true,
    });
    if (isExistingUserVerified) {
      //if the username is taken and is verified
      return Response.json(
        {
          success: false,
          message: "Username is already taken",
        },
        { status: 200 }
      );
    }
    return Response.json(
      //if the username is not verified and not present in db as well
      {
        success: true,
        message: "Username is unique",
      },
      { status: 200 }
    );
  } catch (error) {
    //handling other relevant errors
    console.error("Error in checking username", error);
    return Response.json(
      {
        success: false,
        message: "Error in checking username",
      },
      { status: 500 }
    );
  }
}
