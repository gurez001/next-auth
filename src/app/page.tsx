"use client"
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export default function Home() {
  const handleLogout = async (): Promise<void> => {
    await signOut({ callbackUrl: "/sign-in" })
  }
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h1>Welcome</h1>
        <Button onClick={handleLogout}>  <LogOut className="mr-2 h-4 w-4" /> Logout</Button>
      </main>

    </div>
  );
}
