import { authOptions } from "./options";
import NextAuth from "next-auth";
const handler = NextAuth(authOptions); //This function handles the authentication logic and all relvant works
export { handler as GET, handler as POST }; //It can handle the request  from  both GET and POST
