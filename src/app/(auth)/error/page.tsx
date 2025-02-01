"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"

export default function AuthError() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  const errorConfig = {
    default: {
      message: "An error occurred during authentication. Please try again.",
      action: "Back to Sign In",
      link: "/sign-in",
    },
    AccountNotFound: {
      message: "Your account doesn't exist. Please create an account.",
      action: "Create Account",
      link: "/sign-up",
    },
    AccountNotVerified: {
      message: "Please verify your account before logging in.",
      action: "Resend Verification Email",
      link: "/resend-verification",
    },
    FailedToCreateAccount: {
      message: "Failed to create your account. Please try again.",
      action: "Back to Sign Up",
      link: "/sign-up",
    },
    IncorrectPassword: {
      message: "The password you entered is incorrect. Please try again.",
      action: "Back to Sign In",
      link: "/sign-in",
    },
    NoEmailFound: {
      message: "No email associated with this account was found.",
      action: "Back to Sign In",
      link: "/sign-in",
    },
  }

  const { message, action, link } = errorConfig[error as keyof typeof errorConfig] || errorConfig.default

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Authentication Error</h2>
        </div>
        <div className="text-center text-red-500">{message}</div>
        <div>
          <Link
            href={link}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {action}
          </Link>
        </div>
      </div>
    </div>
  )
}

