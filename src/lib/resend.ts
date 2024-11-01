import { Resend } from "resend";
export const resend = new Resend(process.env.RESEND_API_KEY);
//here we are exporting the resend api key using named export
