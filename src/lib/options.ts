import CredentialsProvider from "next-auth/providers/credentials"; // Imports the Credentials provider from NextAuth, allowing the use of custom login credentials.
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import dbConnection from "@/lib/dbConnect";
import { OauthUserModel, CredUserModel, UserModel } from "@/model/User";
import type { NextAuthOptions } from "next-auth";
import { User } from "@/model/User";
// we can place options.ts file anywhere but the thing is it should be injected inside the [...nextauth] file
//as here we are just writing options after wards it will be injected in a route where it will actual work as API
export const authOptions: NextAuthOptions = {
  /**means that authOptions is explicitly typed as NextAuthOptions. TypeScript will check that the object assigned to authOptions has all required properties and conforms to the expected structure defined by NextAuthOptions. This ensures that your authOptions object is correctly configured for next-auth without missing or misconfigured properties.
  In NextAuthOptions, you can define settings like:
  Providers (OAuth, credentials, etc.)
  Callbacks (to control behaviors like JWT token manipulation)
  Pages (for custom login, register, etc.)
  Session settings (e.g., session strategy, expiration) */
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,

      // authorization: {
      //   params: {
      //     access_type: "offline", // Ensures we get a refresh token
      //     response_type: "code",//It will manage the flow for getting token
      //     prompt: "select_account or  consent ", //  if select_account then we get interface for selecting account
      // if consent then he has to give consent everytime
      //   },
      // },
    }),

    //Defines the array of providers (like  Credentials in our case can be google , github) used for authentication.
    /**n Auth.js (formerly NextAuth.js), the providers array is used to configure the authentication providers that your application will support. This array defines how users can log into your app via third-party services like Google, Facebook, GitHub, Twitter, etc., as well as credentials-based logins if needed. */
    CredentialsProvider({
      //This is  for cutom login for github google seperate providers are there
      credentials: {
        //Defines input fields required for login—username for the email or username, and password.
        identifier: {},
        password: {},
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async authorize(
        credentials: Record<"identifier" | "password", string>
      ): Promise<User | any> {
        if (!credentials) return null;

        await dbConnection();
        try {
          const user = await CredUserModel.findOne({
            $or: [
              // $or: A MongoDB operator that checks if either the email or username matches the identifier provided.
              { useremail: credentials.identifier as string },
              { username: credentials.identifier as string }, //identifier can refer to email or username
            ],
          });

          //console.log("User", user);
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
        } catch (err: unknown) {
          if (err instanceof Error) {
            throw new Error(err.message);
          }
          throw new Error(String(err));
        }
      },
    }),
    //similarly there are  github ,google provider etc for Oauth authentication
    //for google or github we just need call back url from user and authentication will be handled by specific Oauths(google or github)
  ],
  callbacks: {
    //Callbacks are asynchronous functions you can use to control what happens when an action is performed(ACTION Like SIGNIN,accessing session data etc ).

    async jwt({ token, user, account }) {
      /**This callback is called whenever a JSON Web Token is created (i.e. at sign in) or updated (i.e whenever a session is accessed in the client). The returned value will be encrypted, and it is stored in a cookie. Requests to /api/auth/signin, /api/auth/session and calls to getSession(), getServerSession(), useSession() will invoke this function, but only if you are using a JWT session. This method is not invoked when you persist sessions in a database.JSON Web Tokens can be used for generating session tokens if enabled with session: { strategy: "jwt" } option.*/
      if (user) {
        /**The arguments LIKE  user (WE USED HERE ), account, profile and isNewUser are only passed the first time this callback is called at the time of creating a  new session, after the user signs in. In subsequent calls, only token will be available. AND IT WILL BE RETURNED .
        The contents user, account, profile and isNewUser will vary depending on the provider and if you are using a database. You can persist data such as User ID, OAuth Access Token in this token 
        Use an if branch to check for the existence of parameters (apart from token). If they exist, this means that the callback is being invoked for the first time (i.e. the user is being signed in). This is a good place to persist additional data like an access_token in the JWT. Subsequent invocations will only contain the token parameter.*/
        //storing the user data in payload
        console.log("Token before adding user", token);
        console.log("User from authorize:", user);
        console.log("Account Object", account);
        token._id = user._id?.toString(); //converting object id to string
        token.isVerified = user.isVerified;
        token.isAcceptingMessages = user.isAcceptingMessages;
        token.username = user.username;
      }
      if (account && account.provider === "google") {
        await dbConnection();
        //if he is having access token (account parameter is only available on first time sign in )
        try {
          const findUserwithemail = await UserModel.findOne({
            useremail: token.email, //if not got access token then there is trouble here
          });
          console.log("Token", token);
          console.log("Account", account);
          //token will conatin name,email,picture
          // but if you are using credential provider you will not get this  it will be undefined instead you will have user object with all the properties  your user document is containing but the user in google provider will contain the same property the token is having so you can access email from user or token object
          //if the Oauth logged in user is existing in DB
          if (findUserwithemail && findUserwithemail.isVerified) {
            //This condition if for those who logged in using cred provider but again login using google provider so inorder
            //to enure that the user is not added 2 times in db this is important if he is a new user then he will go to else conidtion
            //where we will create a new user
            console.log("User with email is there");
            token._id = findUserwithemail._id?.toString();
            token.isVerified = findUserwithemail.isVerified;
            token.isAcceptingMessages = findUserwithemail.isAcceptingMessages;
            token.username = findUserwithemail.username;
          } else {
            console.log("I am in else condition");
            const creatingnewuser = new OauthUserModel({
              username: token.name,
              useremail: token.email,
              isVerified: true,
              isAcceptingMessages: true,
              message: [],
            });
            await creatingnewuser.save();
            //accessing the data and storing in token
            token._id = creatingnewuser._id?.toString();
            token.isVerified = creatingnewuser.isVerified;
            token.isAcceptingMessages = creatingnewuser.isAcceptingMessages;
            token.username = creatingnewuser.username;
          }
        } catch (err: unknown) {
          if (err instanceof Error) {
            throw new Error(err.message);
          }
          throw new Error(String(err));
        }
      }
      console.log("Final JWT Token:", token);
      return token; // we will update the token with user data  by storing it in seperate key inside token  as we did above
      //returning the token which then will be stored in cookie and session  callback can access this now
    },
    //session we get by default in call backs ( When the authorize is true)
    async session({ session, token }) {
      console.log("Session callback token:", token);
      /**The session callback is called whenever a session is checked like while using methods like getSession(), useSession(), /api/auth/session(). By default, only a subset of the token is returned for increased security. 
      When using database sessions, the User (user) object is passed as an argument.
When using JSON Web Tokens for sessions, the JWT payload (token) is provided instead.*/
      if (token) {
        //Once the token is created from jwt() call back its data we are storing in session token
        /**When using JSON Web Tokens the jwt() callback is invoked before the session() callback, so anything you add to the JSON Web Token will be immediately available in the session callback, like for example an access_token or id from a provider. */
        session.user._id = token._id; //retrieving all the data from token and storing in user object of session under different keys
        session.user.isVerified = token.isVerified;
        session.user.isAcceptingMessages = token.isAcceptingMessages;
        session.user.username = token.username;
      }
      console.log("Final Session:", session);
      return session; //Now here session will contain user object and this object contains jwt data which is accessible everywhere
    },
  },
  pages: { signIn: "/sign-in", error: "/sign-in" }, // Redirects to a custom sign-in page which is present in specified route
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 30 },
  //maxAge: 60 * 60 * 24 * 30 → The session will expire after 30 days.
  // 60 → Seconds in a minute
  // 60 * 60 → 1 hour (3600 seconds)
  // 60 * 60 * 24 → 1 day (86,400 seconds)
  // 60 * 60 * 24 * 30 → 30 days (2,592,000 seconds)
  //we are not persisting session data on server side (i.e in db )(If I do then I will get access token  as return value from session callback this is by default how session works) . If using JSON Web Tokens instead of database sessions, you should use the User ID or a unique key stored in the token (you will need to generate a key for this yourself on sign in, as access tokens for sessions are not generated when using JSON Web Tokens)(agar jwt use kar rahe ho toh access token by default return nahi hoga aapko jo jwt token expose hua hee session sae use 1 object ka inside like here I made a user object and uskee andar different keys for different token creds  usse 1st mae store karta hu session mae and now this user object will be accessible form any where agar aap yahi kaam ko database strategy use kar rahe ho  toh token expose nahi hoga session usse internally rakh dega chaiye toh aap usse further process karke inside session callback db mae rakh sakte ho as we get user argument instead of token while using database strategy )
  secret: process.env.NEXTAUTH_SECRET, //This is a very important credential in order to use auth
};
// IN CASE YOU ARE USING ONLY GOOGLE OAUTH you can find details like how to do similar
// authentication system like mongodb atlas https://chatgpt.com/c/67bb0984-e5fc-800c-8251-d2687df75e30 here
