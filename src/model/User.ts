import mongoose, { Schema, Document } from "mongoose";

// Message Interface and Schema
export interface Message extends Document {
  _id: string;
  content: string;
  createdAt: Date;
}

const MessageSchema: Schema<Message> = new Schema({
  content: { type: String, required: true },
  createdAt: { type: Date, required: true, default: Date.now },
});

// Base User Interface (Common Fields)
export interface User extends Document {
  username: string;
  useremail: string;
  isVerified: boolean;
  isAcceptingMessages: boolean;
  messages: Message[];
  authType: "oauth" | "credential"; // Discriminator key
}

// OAuth User Interface
export interface OauthUser extends User {}

// Local User Interface (Includes password & verification fields)
export interface CredUser extends User {
  password: string;
  verifyCode: string;
  verifyCodeExpiry: Date;
}

// Base Schema (Common Fields for All Users)
const UserSchema: Schema<User> = new Schema(
  {
    username: { type: String, required: true, trim: true, unique: true },
    useremail: {
      type: String,
      required: true,
      unique: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email"],
    },

    isVerified: { type: Boolean, default: false },
    isAcceptingMessages: { type: Boolean, default: true },
    messages: [MessageSchema],
  },
  { discriminatorKey: "authType", timestamps: true }
);
//A discriminator in Mongoose is a way to create sub-models based on a base model while keeping shared fields in a single collection. It allows us to have different types of users (e.g., OAuth users and Local users) while still using the same underlying User collection.
// Creating the Base Model (`User`)
const UserModel =
  (mongoose.models.User as mongoose.Model<User>) ||
  mongoose.model<User>("User", UserSchema); //This is our base Model

// Ensure Discriminators Are Not Defined Twice
const existingDiscriminators = UserModel.discriminators || {};

// OAuth User Schema (No password)
const OauthUserSchema = new Schema<OauthUser>({});
const CredUserSchema = new Schema<CredUser>({
  password: { type: String, required: true },
  verifyCode: { type: String, required: true },
  verifyCodeExpiry: { type: Date, required: true },
});

// Only Create Discriminators If They Do Not Exist
const OauthUserModel =
  existingDiscriminators["oauth"] ||
  UserModel.discriminator<OauthUser>("oauth", OauthUserSchema);

const CredUserModel =
  existingDiscriminators["credential"] ||
  UserModel.discriminator<User>("credential", CredUserSchema);

// Export the models
export { UserModel, OauthUserModel, CredUserModel };
