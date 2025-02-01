import { NextResponse } from "next/server"
import dbConnect from "@/dbConfig/dbConfig"
import User from "@/models/userModel"
import { OTPModel } from "@/models/otpModel"

const MAX_ATTEMPTS = 5

export async function POST(req: Request) {
  try {
    const { otpValue, token } = await req.json()

    if (!otpValue || !token) {
      return NextResponse.json({ message: "OTP and token are required" }, { status: 400 })
    }

    await dbConnect()

    // Find the most recent OTP record for the given token
    const otpRecord:any = await OTPModel.findOne({ token }).sort({ createdAt: -1 }).exec()

    if (!otpRecord) {
      return NextResponse.json({ message: "Invalid token" }, { status: 404 })
    }

    if (otpRecord.expiresAt < new Date()) {
      return NextResponse.json({ message: "OTP has expired" }, { status: 410 })
    }

    if (otpRecord.isVerified) {
      return NextResponse.json({ message: "OTP has already been verified" }, { status: 400 })
    }

    if (otpRecord.attempts >= MAX_ATTEMPTS) {
      return NextResponse.json({ message: "Too many failed attempts. Please request a new OTP." }, { status: 429 })
    }

    if (otpRecord.otpCode !== Number(otpValue)) {
      otpRecord.attempts += 1
      await otpRecord.save()

      return NextResponse.json(
        {
          message: "Invalid OTP",
          attemptsLeft: MAX_ATTEMPTS - otpRecord.attempts,
        },
        { status: 400 },
      )
    }

    // OTP is valid, update records
    otpRecord.isVerified = true
    otpRecord.attempts = 0
    await otpRecord.save()

    const user = await User.findOneAndUpdate({ verifyToken: token }, { $set: { isVerified: true } }, { new: true })

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Invalidate all previous OTPs for this token
    await OTPModel.updateMany(
      { token, _id: { $ne: otpRecord._id } },
      { $set: { isVerified: true, attempts: MAX_ATTEMPTS } },
    )

    return NextResponse.json(
      {
        message: "OTP verified successfully",
        accessToken: token,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("OTP verification error:", error)
    return NextResponse.json({ message: "An error occurred during OTP verification" }, { status: 500 })
  }
}

