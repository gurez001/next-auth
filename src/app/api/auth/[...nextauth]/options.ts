import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import User from "@/models/userModel";
import dbConnect from "@/dbConfig/dbConfig";
import jwt from "jsonwebtoken";

interface GitHubEmail {
  email: string;
  primary: boolean;
  verified: boolean;
  visibility: string | null;
}

interface SocialProfile {
  name?: string;
  email: string;
  picture?: string;
}
async function findOrCreateUser(profile: SocialProfile, provider: string) {
  let user = await User.findOne({ email: profile.email });
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(
    profile.email.split("@")[0] + provider,
    salt
  );
  if (!user) {
    user = new User({
      name: profile.name || profile.email.split("@")[0],
      email: profile.email,
      image: profile.picture,
      password: hashedPassword,
      username: profile.name || profile.email.split("@")[0],
      provider,
      isVerified: true,
    });
    try {
      await user.save();
      console.log("New user created", user);
    } catch (error) {
      console.error("Error creating user:", error);
      throw new Error("FailedToCreateAccount");
    }
  } else {
    user.provider = provider;
    try {
      await user.save();
    } catch (error) {
      console.error("Error updating provider:", error);
    }
  }

  return user;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        identifier: {
          label: "Email or Username",
          type: "text",
          placeholder: "email@example.com or username",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any, req: any): Promise<any> {
        await dbConnect();
        try {
          const user = await User.findOne({
            $or: [
              { email: credentials.email },
              { username: credentials.identifier },
            ],
          });

          if (!user) {
            throw new Error("No user found with this email or username");
          }
          if (!user.isVerified) {
            throw new Error("Please verify your account before login");
          }
          const isPasswordCorrect = await bcrypt.compare(
            credentials.password,
            user.password
          );
          if (!isPasswordCorrect) {
            throw new Error("Incorrect password");
          }
          return user;
        } catch (error: any) {
          throw new Error(error.message);
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      await dbConnect();

      if (account?.provider === "github" && profile) {
        const res = await fetch("https://api.github.com/user/emails", {
          headers: {
            Authorization: `token ${account.access_token}`,
          },
        });

        const githubEmails: GitHubEmail[] = await res.json();
        const primaryEmail =
          githubEmails.find((email) => email.primary)?.email ||
          githubEmails[0]?.email;

        if (!primaryEmail) {
          return "/error?error=account-not-found";
        }

        const githubProfile: SocialProfile = {
          name: profile.name || (profile as any).login,
          email: primaryEmail,
          picture: (profile as any).picture,
        };

        const existingUser = await findOrCreateUser(githubProfile, "github");
        Object.assign(user, existingUser);
      } else if (account?.provider === "google") {
        const decodedToken = jwt.decode(account.id_token!) as SocialProfile;
        const existingUser = await findOrCreateUser(decodedToken, "google");
        Object.assign(user, existingUser);
      }

      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token._id = user._id?.toString();
        token.isVerified = user.isVerified;
        token.isAcceptingMessages = user.isAcceptingMessages;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user._id = token._id as string;
        session.user.isVerified = token.isVerified as boolean;
        session.user.isAcceptingMessages = token.isAcceptingMessages as boolean;
        session.user.username = token.username as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/sign-in",
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
};
