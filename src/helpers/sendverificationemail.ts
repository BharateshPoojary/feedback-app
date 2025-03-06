import { resend } from "@/lib/resend";
import VerificationEmail from "../../emails/verification-email-template";
//we can use any syntax it can be @ or .. one
import { ApiResponse } from "@/types/ApiResponse";

export const sendverificationemail = async (
  email: string,
  username: string,
  verifyCode: string
): Promise<ApiResponse> => {
  try {
    await resend.emails.send({
      from: "onboarding@resend.dev", //as we are using free tier account
      to: email,
      subject: "Bharat-Feedback-app | Verification Code",
      react: VerificationEmail({ username, otp: verifyCode }),
      /**So otp is the prop name expected by VerificationEmail, and verifyCode is the actual value being assigned to it */
    });
    return { success: true, message: "verification email sent successfully" };
  } catch (emailError) {
    console.error("Error sending verification email");
    return {
      success: false,
      message: `Error sending verification email${emailError}`,
    };
  }
};
