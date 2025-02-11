import { authOptions } from "../../../../lib/options";
import NextAuth from "next-auth";
const handler = NextAuth(authOptions); //This function handles the authentication logic and all relveant works
export { handler as GET, handler as POST }; //It can handle the request  from  both GET and POST
//THIS IS FOR CLIENT SIDE ONLY
