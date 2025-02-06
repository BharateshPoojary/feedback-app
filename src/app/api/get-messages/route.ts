import dbConnection from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { getServerSession } from "next-auth";
/**getServerSession() is a function provided by NextAuth to fetch the session data on the server side in Next.js.
It takes in the authentication options (authOptions), which typically include your configured providers, callbacks, and session settings.
This function returns the session object containing the authenticated user's data, including user information and any custom properties you might have added to the session or JWT */
import { authOptions } from "../../../lib/options";
import mongoose from "mongoose";
//POST request is for updating the user isAcceptingMessage property
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
  const userId = new mongoose.Types.ObjectId(userObj._id); //creating a new objectId as we made it to string but as we are using aggregation pipeline it must be of type mongoDB objectId it is ok for other methods like findById() etc
  try {
    //MONGODB AGGREGATION PIPELINE
    const gettingallmessagesfromuser = await UserModel.aggregate([
      { $match: { _id: userId } },
      { $unwind: "$messages" },
      { $sort: { "messages.createdAt": -1 } },
      { $group: { _id: "$_id", messages: { $push: "$messages" } } },
    ]).exec(); //This method will execute this aggregation pipeline and it always returns an array
    //e.g available in chatgpt demonstrating https://chatgpt.com/share/672de001-e1c8-800c-9d5c-f6d79dcf6227
    /**The aggregation pipeline in MongoDB is a framework for processing and transforming data/document in a collection. It allows you to perform complex queries and data/document manipulations by chaining multiple stages together. Each stage in the pipeline performs an operation on the input data/document and passes the result to the next stage.
     * db.collection.aggregate([
  { /* Stage 1 */
    //   { /* Stage 2 */ },
    //   { /* Stage 3 */ },
    //   ...
    // ]);*/
    if (
      !gettingallmessagesfromuser ||
      gettingallmessagesfromuser.length === 0
    ) {
      return Response.json(
        {
          success: false,
          message: "User Not Found",
        },
        { status: 404 }
      );
    }
    return Response.json(
      {
        messages: gettingallmessagesfromuser[0].messages,
      },
      { status: 200 }
    );
    //REFER THE ABOVE GPT LINK YOU WILL GET TO KNOW WHY gettingallmessagesfromuser[0].messages THIS
  } catch (error) {
    console.error("An unexpected error occurred", error);
    return Response.json(
      {
        success: false,
        message: "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}

/**WHEN TO USE console.error() and throw new Error() object
 * console.error() is for logging errors without interrupting program flow.
throw new Error() creates and throws an error, stopping execution unless it is caught by a try-catch block.
Use console.error() for debugging or logging purposes.
Use throw new Error() to indicate and propagate an error in your code flow, especially when you need to stop execution or handle specific error cases.
 */
