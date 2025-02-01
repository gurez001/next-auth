import { GalleryVerticalEnd } from "lucide-react"

import { LoginForm } from "@/modules/components/auth/login-form"
import { Logo } from "@/modules/components/header/logo"

export default function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex items-center justify-center">
          <Logo />
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
