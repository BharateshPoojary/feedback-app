import mongoose, { Schema, Document } from "mongoose";

// Message Interface and Schema
export interface Message extends Document {
  _id: string;
  content: string;
  mediaPath: string;
  createdAt: Date;
}

const MessageSchema: Schema<Message> = new Schema({
  content: { type: String, required: true },
  createdAt: { type: Date, required: true, default: Date.now },
  mediaPath: { type: String },
});

// Base User Interface (Common Fields) for both oauth and cred user
export interface User extends Document {
  username: string;
  useremail: string;
  isVerified: boolean;
  isAcceptingMessages: boolean;
  messages: Message[];
  authType: "oauth" | "credential"; // Discriminator key will be used to differentiate 2 discrminator model  inside a
  // a base Model i.e. UserModel
}

// Cred User Interface (Includes password & verification fields)
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
  { discriminatorKey: "authType", timestamps: true } //This is the 2nd argument in schema definition where we define the additional schema option
  // the discriminator key differentiate models (OauthUserModel and CredUserModel) in the base model (UserModel)
);
//A discriminator in Mongoose is a way to create sub-models based on a base model while keeping shared fields in a single collection. It allows us to have different types of users (e.g., OAuth users and Local users) while still using the same underlying User collection.
// Creating the Base Model (`User`)
const UserModel = //creating the base model selcting the model if it already exists or creating the new model for first model on subsequent render if not mentioned like this it will throw an error
  (mongoose.models.User as mongoose.Model<User>) ||
  mongoose.model<User>("User", UserSchema); //This is our base Model

// Ensure Discriminators Are Not Defined Twice
const existingDiscriminators = UserModel.discriminators || {};
// UserModel.discriminators contains all previously defined discriminators.
// If no discriminators exist yet, UserModel.discriminators will be undefined, so we use {} (an empty object) to avoid errors.
// This prevents re-creating a discriminator if it already exists.
// OAuth User Schema (No password)

const OauthUserSchema = new Schema<User>({}); //as it is having no additional fields and we already defined  base UserSchema we can leave it as an empty object
const CredUserSchema = new Schema<CredUser>({
  //CredUserSchema includes additional fields so we have to just define the schema for that additional fileds only
  password: { type: String, required: true },
  verifyCode: { type: String, required: true },
  verifyCodeExpiry: { type: Date, required: true },
});
//both this schema are inheriting the base User Schema
// Only Create Discriminators If They Do Not Exist
const OauthUserModel =
  existingDiscriminators["oauth"] || //if not creating the discriminator model for first time it will select the existing discriminator with the key oauth which points to oauthUserModel
  UserModel.discriminator<User>("oauth", OauthUserSchema); //If creating for first time it will create the new child  model as OauthuserModel which is a submodel under  base UserModel where  oauth is the value for the discriminator key "authtype".
// which means if we save the document using OauthUserModel instance it will automatically add field as "authType":"oauth"

const CredUserModel = // the  same is for CredUserModel as Oauth userModel (but the thing is Cred user is having additional fileds )
  existingDiscriminators["credential"] ||
  UserModel.discriminator<CredUser>("credential", CredUserSchema);
// The .discriminator() method will add this value to authtype key in CredUserModel which is a child model under userModel and it will create collection by considering the name of base user model i.e users for User model
// A discriminator model in Mongoose is a sub-model that extends a base model while sharing the same MongoDB collection.
// {
//   oauth: Model { OauthUser },
//   credential: Model { CredUser }
// }
// Export the models
export { UserModel, OauthUserModel, CredUserModel }; //exporting all three models which we can use it accordingly
