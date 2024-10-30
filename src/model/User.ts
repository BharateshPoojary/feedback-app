//IN THIS FILE WE ARE DOING USER MODELLING

import mongoose, { Schema, Document } from "mongoose";
//mongoose: This is the default export, providing the main mongoose object, which includes methods like connect(), model(), etc.
//{ Schema, Document }: These are named exports. Schema and Document are exported as specific parts of the mongoose library that can be accessed directly, so they are imported inside curly braces.

//Interface is a common approach which we generally use to define the type of data

export interface Message extends Document {
  //In Mongoose with TypeScript, extending Document in your interface is necessary because it gives the Message interface all the properties and methods that a Mongoose document provides.
  //By extending Document, you ensure that TypeScript recognizes these properties and methods on any instance of Message. Without extending Document, TypeScript wouldn’t be aware of them, and you would encounter type errors when trying to use them properties and methods like _id and save() respectively
  content: string; //ts string is in smallcase
  createdAt: Date;
}

const MessageSchema: Schema<Message> = new Schema({
  content: {
    type: String, //mongoDb  string is in sentencecase
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
});
export interface User extends Document {
  username: string;
  useremail: string;
  password: string;
  verifyCode: string; //This code is for user verification
  verifyCodeExpiry: Date; //Expiry date of code
  isVerified: boolean;
  isAcceptingMessage: boolean; //whether user accepting message or not
  message: Message[]; //this is a field which includes all the messages document inside an  array which will be relevant to a particular user
}
const UserSchema: Schema<User> = new Schema({
  //In your code, Schema refers to a schema constructor provided by Mongoose, a popular Node.js library for MongoDB. Schema is used to define the structure of documents in a MongoDB collection, setting up fields, types, and validations.
  //UserSchema is the schema instance you're creating, which defines the structure for documents in the User collection.
  //Schema<User> indicates that the schema is specifically for documents of type User, enforcing TypeScript type safety if you’ve defined an interface or type User.
  username: {
    type: String,
    required: [true, "Username is required"], //we have given this in array form so that if the field returns false it will return the message
    trim: true, //This is for removing white spaces if any
    unique: true, //username must be unique
  },
  useremail: {
    type: String,
    required: [true, "UserEmail is required"],
    unique: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email address"],
    /**Explanation of this particular Regex Pattern:
        ^: Start of the string.
        [^\s@]+: One or more characters that are not whitespace (\s) or @.
        @: The @ symbol.
        [^\s@]+: One or more characters that are not whitespace or @ (the domain name).
        \.: A literal dot (.) character for the domain extension.
        [^\s@]+: One or more characters that are not whitespace or @ (the domain extension).
        $: End of the string. */
    //Regexr is a popular online tool for creating, testing, and learning about regular expressions (regex). It allows users to build regex patterns, test them on sample text, and see matches in real-time.
    //Regular expressions (regex) are commonly used in various areas of software development and data processing, including:Validation: Checking if inputs match a specified format, such as validating email addresses, phone numbers, or passwords.
  },
  password: {
    type: String,
    required: [true, "Password is required"],
  },
  verifyCode: {
    type: String,
    required: [true, "VerifyCode is required"],
  },
  verifyCodeExpiry: {
    type: Date,
    required: [true, "VerifyCodeExpiry date is required"],
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  isAcceptingMessage: {
    type: Boolean,
    default: true,
  },
  message: [MessageSchema],
});
const UserModel =
  (mongoose.models.User as mongoose.Model<User>) ||
  mongoose.model<User>("User", UserSchema);
//here is 2 condition if User Model is  already present   it will be selected among the multiple models
//or else It will create a new model
/**is casting mongoose.models.User to be of type mongoose.Model<User>. Here’s a breakdown of what each part does:
mongoose.models.User:
This is typically an object managed by Mongoose that stores any models that have already been created. If User has already been defined as a model, it will be available in mongoose.models.User.
as mongoose.Model<User>:This part is a TypeScript type assertion (casting), which tells TypeScript to treat mongoose.models.User as a mongoose.Model<User> type.
mongoose.Model<User> means that the UserModel object should conform to the shape of a Mongoose model where the generic type User represents the structure of each document within the collection. */
export default UserModel;
