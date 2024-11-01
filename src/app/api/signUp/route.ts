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
  } catch (error) {
    console.error("Error registering user", error);
    return Response.json(
      { success: false, message: "Error Registering user" },
      { status: 500 }
    ); //code 500 means something went wrong on the server
  }
}
