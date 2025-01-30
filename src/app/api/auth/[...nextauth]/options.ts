import CredentialsProvider from "next-auth/providers/credentials"; // Imports the Credentials provider from NextAuth, allowing the use of custom login credentials.
import bcrypt from "bcryptjs";
import dbConnection from "@/lib/dbConnect";
import UserModel from "@/model/User";
import type { NextAuthOptions } from "next-auth";
export const authOptions: NextAuthOptions = {
  /**means that authOptions is explicitly typed as NextAuthOptions. TypeScript will check that the object assigned to authOptions has all required properties and conforms to the expected structure defined by NextAuthOptions. This ensures that your authOptions object is correctly configured for next-auth without missing or misconfigured properties.
In NextAuthOptions, you can define settings like:
Providers (OAuth, credentials, etc.)
Callbacks (to control behaviors like JWT token manipulation)
Pages (for custom login, register, etc.)
Session settings (e.g., session strategy, expiration) */
  providers: [
    //Defines the array of providers (like  Credentials in our case can be google , github) used for authentication.
    /**n Auth.js (formerly NextAuth.js), the providers array is used to configure the authentication providers that your application will support. This array defines how users can log into your app via third-party services like Google, Facebook, GitHub, Twitter, etc., as well as credentials-based logins if needed. */
    CredentialsProvider({
      credentials: {
        //Defines input fields required for login—username for the email or username, and password.
        Identifier: {},
        password: {},
      },
      async authorize(credentials: any): Promise<any> {
        //A function to handle custom logic for authenticating users when they log in.
        await dbConnection();
        try {
          const user = await UserModel.findOne({
            $or: [
              // $or: A MongoDB operator that checks if either the email or username matches the identifier provided.
              { email: credentials.identifier },
              { username: credentials.identifier }, //identifier can refer to email or username
            ],
          });
          if (!user) {
            throw new Error("No user found with this credentials");
          }
          if (!user.isVerified) {
            throw new Error("Please verify your account");
          }
          const passwordverification = await bcrypt.compare(
            credentials.password,
            user.password
          );
          if (passwordverification) {
            return user; //Returning the user document
          } else {
            throw new Error(
              "Password mismatched.please try to login with correct credentials"
            );
          }
        } catch (err: any) {
          throw new Error(err);
        }
      },
    }),
  ],
  callbacks: {
    //I am storing the data in jwt and session the advantage here is I can get the user data through if I have any one of the access it can be session or jwt
    async jwt({ token, user }) {
      if (user) {
        //storing the user data in payload
        token._id = user._id?.toString(); //converting object id to string
        token.isVerified = user.isVerified;
        token.isAcceptingMessage = user.isAcceptingMessages;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user._id = token._id;
        session.user.isVerified = token.isVerified;
        session.user.isAcceptingMessages = token.isAcceptingMessage;
        session.user.username = token.username;
      }
      return session;
    },
  },
  pages: { signIn: "/sign-in" }, //// Redirects to a custom sign-in page which is present in specified route
  session: { strategy: "jwt" }, //using jwt for storing the session data or else we can use database as well
  secret: process.env.NEXTAUTH_URL, //This is a very important credential in order to use auth
};
