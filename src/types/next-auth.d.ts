/**Automatic Type Declaration Recognition: TypeScript recognizes files with .d.ts extensions as declaration files, so by default, it will include next-auth.d.ts in its type-checking process. This is helpful because you don’t need to explicitly import these types everywhere—they’re globally available in the project. */
import "next-auth/jwt"; //this import is for jwt specifc work  like defining types of the payload data here
import { DefaultSession } from "next-auth"; //this import is general to all like session user object etc
declare module "next-auth" {
  //This declaration is used to extend the core NextAuth types.
  //so here we are adding some custom types to the default module of next-auth
  interface Session {
    //so the user property inside the session will have this custom property
    user: {
      _id?: string;
      isVerified?: boolean;
      isAcceptingMessages?: boolean;
      username?: string;
    } & DefaultSession["user"]; // you’re importing DefaultSession from NextAuth to keep the standard properties and then extending it with custom fields
  }
  interface User {
    _id?: string;
    isVerified?: boolean;
    isAcceptingMessages?: boolean;
    username?: string;
  }
}
declare module "next-auth/jwt" {
  // This interface allows adding custom claims to the JSON Web Token (JWT) stored by NextAuth. These fields:
  //_id, isVerified, isAcceptingMessage, and username are included in the JWT payload, so you can reference them in the jwt callback and persist them in the token.
  interface JWT {
    _id?: string;
    isVerified?: boolean;
    isAcceptingMessages?: boolean;
    username?: string;
  }
}
