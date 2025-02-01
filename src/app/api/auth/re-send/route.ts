import { NextResponse } from "next/server";
import dbConnect from "@/dbConfig/dbConfig";
import { OTPModel } from "@/models/otpModel";
import { OTPGenerator } from "@/utils/otpGenerator";
export async function POST(req: Request) {
  try {
    await dbConnect();
    const { token } = await req.json();
    const OtpToken: any = await OTPModel.findOne({ token: token }).sort({
      updated_at: -1,
    });
    const otp: string = await OTPGenerator(6);
    const otpdata = {
      userId: OtpToken?.userId,
      email: OtpToken.email,
      token: token,
      otpCode: Number(otp),
    };
    await OTPModel.create(otpdata);
    return NextResponse.json(
      { message: "OTP resend successfully." },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json(
      { message: err || "An error occurred during OTP verification." },
      { status: 500 } // Internal Server Error
    );
  }
}
