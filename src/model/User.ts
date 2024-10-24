import mongoose ,{Schema,Document} from "mongoose";
//Schema module is used in order to avoid writing mongoose.schema everytime we need it
//Document is used as we are using typescripts typesafety
//Interface is a common approach which we generally use to define the type of data

export interface Message extends Document{
    content:string;
    createdAt:Date;
}

const MessageSchema:Schema<Message> = new Schema({
content:{
    type:String,
    required:true
},
createdAt:{
    type:Date,
    required:true,
    default:Date.now
}
})
export interface User extends Document{
    
}

