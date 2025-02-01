import dbConnect from "@/dbConfig/dbConfig";
import { sendNewPassword } from "@/lib/mail";
import User from "@/models/userModel";
import { generatePassword } from "@/utils/generatePassword";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
export async function POST(req: Request) {
  try {
    await dbConnect();
    const { email } = await req.json();
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { message: "User not found with this email." },
        { status: 404 }
      );
    }
    const salt = await bcrypt.genSalt(10);
    const password = await generatePassword();
    const hashedPassword = await bcrypt.hash(password, salt);
    user.password = hashedPassword;
    await user.save();
    await sendNewPassword(email, password);
    return NextResponse.json(
      { message: "New password sent successfully." },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json(
      { message: err || "An error occurred during OTP verification." },
      { status: 500 } // Internal Server Error
    );
  }
}
