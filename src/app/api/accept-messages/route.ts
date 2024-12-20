import dbConnection from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { getServerSession } from "next-auth";
/**getServerSession() is a function provided by NextAuth to fetch the session data on the server side in Next.js.
It takes in the authentication options (authOptions), which typically include your configured providers, callbacks, and session settings.
This function returns the session object containing the authenticated user's data, including user information and any custom properties you might have added to the session or JWT */
import { authOptions } from "../auth/[...nextauth]/options";
//POST request is for updating the user isAcceptingMessage property
export async function POST(request: Request) {
  await dbConnection();
  const accessing_session = await getServerSession(authOptions); //Accessing the session by passing authOptions to it which includes providers , callback etc
  const userObj = accessing_session?.user; //accessing the user object from session
  if (!accessing_session || !userObj) {
    //If the session or user object is not present it means user is not authentiacted
    return Response.json(
      //returning the response
      {
        success: false,
        message: "User is not authenticated",
      },
      { status: 401 }
    );
  }
  try {
    const { acceptMessage } = await request.json(); //accessing true or false value from request to see whether user wants to accept message or not
    const { _id } = userObj; //accessing id from object
    const updatingusermessageacceptanceproperty =
      await UserModel.findByIdAndUpdate(
        _id,
        {
          isAcceptingMessage: acceptMessage, //updating isAcceptingMessage property  of the specified user
        },
        { new: true } //This property is for returning the new updated document
      );
    if (!updatingusermessageacceptanceproperty) {
      //if not got the user with specified id returning the response as user not found
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }
    return Response.json(
      //returning message about updation of isAcceptingmessage property
      {
        success: true,
        message: "Accepting message toggled successfully",
        updatingusermessageacceptanceproperty,
      },
      { status: 200 }
    );
  } catch (error) {
    //error while updating the user
    console.log("Error updating the user acceptance", error);
    return Response.json(
      {
        success: false,
        message: "Error updating user acceptance",
      },
      { status: 500 }
    );
  }
}
//GET request is accessing the user isAcceptingMessage property
export async function GET() {
  await dbConnection();
  const accessing_session = await getServerSession(authOptions); //Accessing the session by passing authOptions to it which includes providers , callback etc
  const userObj = accessing_session?.user; //accessing the user object from session
  if (!accessing_session || !userObj) {
    //If the session or user object is not present it means user is not authentiacted
    return Response.json(
      //returning the response
      {
        success: false,
        message: "User is not authenticated",
      },
      { status: 401 }
    );
  }
  const { _id } = userObj;
  try {
    const accessing_userid = await UserModel.findById(_id); //finding the user by Id
    if (!accessing_userid) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }
    return Response.json(
      {
        success: true,
        isAcceptingMessages: accessing_userid.isAcceptingMessages, //accessing the users isAcceptingMessage Property
      },
      { status: 200 }
    );
  } catch (error) {
    //error while updating the user
    console.log("Error accesing the userId", error);
    return Response.json(
      {
        success: false,
        message: "Error accesing the userId",
      },
      { status: 500 }
    );
  }
}
