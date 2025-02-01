import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import User from "@/models/userModel";
import { generateToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/mail";
import dbConnect from "@/dbConfig/dbConfig";
import { OTPGenerator } from "@/utils/otpGenerator";
import { OTPModel } from "@/models/otpModel";

export async function POST(req: Request) {
  try {
    const { username, email, password } = await req.json();

    // Connect to database
    await dbConnect();
    // User exists but is not verified
    const verifyToken = generateToken();
    const verifyTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    const otp: string = await OTPGenerator(6);
    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      if (existingUser.email === email && existingUser.isVerified) {
        return NextResponse.json(
          { message: "Email already exists" },
          { status: 400 }
        );
      } else {
        // Update the user with a new verification token
        existingUser.username = username;
        existingUser.verifyToken = verifyToken;
        existingUser.verifyTokenExpiry = verifyTokenExpiry;
        await existingUser.save();

        // Update or create a new OTP entry
        await OTPModel.findOneAndUpdate(
          { userId: existingUser._id },
          { otpCode: Number(otp), token: verifyToken },
          { upsert: true } // Creates if not exists
        );

        // Resend OTP email
        await sendVerificationEmail(email, verifyToken, Number(otp));

        return NextResponse.json({
          message: "OTP has been sent.",
          success: true,
          token: verifyToken,
        });
      }
    }

    // New user registration flow
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      email,
      name: username,
      password: hashedPassword,
      verifyToken,
      provider: "credentials",
      verifyTokenExpiry,
      isVerified: false, // Ensure this field exists in your model
    });

    await newUser.save();

    await OTPModel.create({
      userId: newUser._id,
      email: email,
      token: verifyToken,
      otpCode: Number(otp),
    });

    await sendVerificationEmail(email, verifyToken, Number(otp));

    return NextResponse.json({
      message: "User created successfully. Please verify your email.",
      success: true,
      token: verifyToken,
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
