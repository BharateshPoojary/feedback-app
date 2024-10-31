import mongoose from "mongoose";

type connectionResObj = {
  isConnected?: number; //this is a custom type as object  where we have isConnected property which is optional it can be number or undefined (?) represents it is optional
};
const Connection: connectionResObj = {}; //This object will later store the connection status of the MongoDB database.
const dbConnection = async (): Promise<void> => {
  if (Connection.isConnected) {
    console.log("Already connected to database");
    return;
  }
  try {
    const dbConnect = await mongoose.connect(process.env.MONGODB_URI || "", {});
    //If the connection is not done properly it will return an empty string leading to an error
    //{} inside this braces we can give optional properties
    Connection.isConnected = dbConnect.connections[0].readyState;
  } catch (error) {
    console.log("Failed to connect to the database");
    process.exit(1);
    //Exits the Node.js process with a status code of 1, indicating an error occurred.
  }
};
