"use client";
import { useSession, signIn, signOut } from "next-auth/react";
//useSession is a hook which contain user data and authentication status
//sigin/out function will be invoked based on the condition
export default function Component() {
  const { data: session } = useSession(); //data contains the actual user data which we are initializing to session variable for better readability
  if (session) {
    //if there is some data which means user is signed in and it will return the signOut stuff
    return (
      <>
        Signed in as {session.user.email} <br />
        <button onClick={() => signOut()}>Sign out</button>
      </>
    );
  }
  return (
    //if the user is not signed in it will return this
    <>
      Not signed in <br />
      <button onClick={() => signIn()}>Sign in</button>
    </>
  );
}
