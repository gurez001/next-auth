import mongoose, { Document, Model } from "mongoose";

// Define IUser interface (without extending Document)
export interface IUser {
  username: string;
  name: string;
  email: string;
  image: string;
  provider: string;
  providerId: string;
  password: string;
  isVerified?: boolean; // Optional, defaults to false
  isAdmin?: boolean; // Optional, defaults to false
  forgotPasswordToken?: string;
  forgotPasswordTokenExpiry?: Date;
  verifyToken?: string;
  verifyTokenExpiry?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// Extend IUser with Mongoose Document
export interface IUserDocument extends IUser, Document {}

const userSchema = new mongoose.Schema<IUserDocument>(
  {
    username: {
      type: String,
      sparse: true,
      unique: true,
    },
    name: {
      type: String,
      default: null,
    },
    provider: {
      type: String,
      default: null,
    },
    providerId: {
      type: String,
      default: null,
    },
    image: {
      type: String,
      default: null,
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    forgotPasswordToken: String,
    forgotPasswordTokenExpiry: Date,
    verifyToken: String,
    verifyTokenExpiry: Date,
  },
  { timestamps: true }
);

const User: Model<IUserDocument> =
  mongoose.models.users || mongoose.model<IUserDocument>("users", userSchema);

export default User;
