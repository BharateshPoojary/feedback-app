import dbConnection from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { Message } from "@/model/User";

export async function POST(request: Request) {
  await dbConnection();
  const { username, content } = await request.json();
  try {
    const usernameinDB = await UserModel.findOne({ username }).exec(); //It will return the first document which matches
    if (!usernameinDB) {
      //If no username found it means no such user present in Db
      return Response.json(
        {
          success: false,
          message: "User not found ",
        },
        { status: 404 }
      );
    }
    if (!usernameinDB.isAcceptingMessages) {
      //verifying whether users isAcceptingMessage property is set to false if false then sending the no accepting message ressponse
      return Response.json(
        {
          success: false,
          message: "User is not accepting the message",
        },
        { status: 403 }
      );
    }
    const message = { content, createdAt: new Date() };
    usernameinDB.messages.push(message as Message);

    /**Type Casting (as Message):
It tells TypeScript to treat the object as if it is of the Message type.
This does not validate or ensure that the object has all the required properties of Message. It simply overrides TypeScript's type checking. */
    await usernameinDB.save();
    return Response.json(
      {
        success: true,
        message: "Message sent successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error sending message to user", error);
    return Response.json(
      {
        success: false,
        message: "Error sending message to user",
      },
      { status: 500 }
    );
  }
}
