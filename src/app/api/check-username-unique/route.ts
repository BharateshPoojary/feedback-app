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
    const { searchParams } = new URL(request.url);
    //URL object includes various methods one of which is searchParams which returns all the query parameter in an object (key is queryname : value is query value  )e.g:URLSearchParams { 'username' => 'BHARAT' }
    const queryParams = { username: searchParams.get("username") };
    // 1)Accessing the specific username query parameter get() method returns the first value of the given search parameter
    // 2)safeparse() method accepts argument as  object only so that is  the reason  why it is wrapped in an object
    const result = usernamequerySchema.safeParse(queryParams); //applying the schema to username query paramter
    // console.log("Result", result);

    /**
The safeParse() method in Zod is used to validate data against a defined schema and provides a safe way to handle validation results. Unlike parse(), which throws an error if validation fails, safeParse() always returns an object with two properties:

success: A boolean that is true if the data passed validation and false if it did not.
data or error:
If success is true, data contains the validated data that matches the schema.
If success is false, error contains information about why the data did not pass validation. */
    if (!result.success) {
      //if the result is not success means there are  some errors
      const usernameErrors = result.error.format().username?._errors || [];
      /**{O/P of format()
  username: { _errors: ["Username must be at least 5 characters long"] }
  //The key (username) matches the field name in the schema.
  _errors is an array of error messages for that specific field.
}
 */
      //getting the errors specific to username validation which is optional or else it will return an empty array
      /**Without initializing usernameErrors as an empty array, it could be undefined if result.error.format().username?._errors doesn't exist. This can lead to issues if you try to check its length or use array methods like join, as they aren't defined on undefined. */
      return Response.json(
        {
          success: false,
          message:
            usernameErrors?.length > 0
              ? usernameErrors.join(", ") //getting all the relevant errors seperated by commas
              : "Invalid query parameters", //if there is no error specific to username Validation it will return this message
        },
        { status: 400 } //BAD REQUEST
      );
    }
    //IF NO ERRORS
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
        { status: 200 } //Request succeeded
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
      { status: 500 } //INTERNAL SERVER ERROR
    );
  }
}
