"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { AlertCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function ForgotPasswordPage() {
    const { toast } = useToast();
    const [email, setEmail] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    console.log(email)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true)

        try {
            const response = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            })

            if (response.ok) {
                router.push('/sign-in')
                toast({
                    title: "Success",
                    description: "Password has been sent to your email",
                })
            } else {
                const data = await response.json()
                console.log(data)
                toast({
                    title: "Error",
                    description: data.message || "Something went wrong",
                    variant: "destructive",
                })
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "An error occurred. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-12 sm:px-6 lg:px-8">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">Forgot Password</CardTitle>
                    <CardDescription className="text-center">
                        Enter your email address and we'll send you a link to reset your password.
                    </CardDescription>
                </CardHeader>
                <CardContent>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? "Sending..." : "Send Reset Link"}
                        </Button>
                    </form>

                </CardContent>
                <CardFooter className="flex justify-center">
                    <Link href="/sign-in" className="flex items-center text-sm text-gray-600 hover:text-gray-800">
                        <ArrowLeft size={16} className="mr-2" />
                        Back to Signin
                    </Link>
                </CardFooter>
            </Card>
        </div>
    )
}

