"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ArrowLeft, LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage(null);
    console.log("Password recovery requested for:", email);

    // Simulasi pemanggilan API
    setTimeout(() => {
      if (email === "error@example.com") {
        setMessage({
          type: "error",
          text: "No account found with that email.",
        });
      } else {
        setMessage({
          type: "success",
          text: "If an account exists for that email, a recovery link has been sent.",
        });
      }
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="flex h-20 items-center px-6">
        <h1 className="text-2xl font-bold">Logistix</h1>
      </header>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 items-center p-6">
        {/* Kolom Kiri - Form */}
        <div className="flex w-full justify-center">
          <div className="w-full max-w-sm space-y-8">
            <div>
              <Link
                href="/login"
                className="flex items-center text-sm text-muted-foreground hover:text-primary"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to login
              </Link>
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl font-bold">Forgot your password?</h2>
              <p className="text-muted-foreground">
                Don&apos;t worry, happens to all of us. Enter your email below
                to recover your password
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              {message && (
                <p
                  className={`text-sm ${
                    message.type === "error"
                      ? "text-destructive"
                      : "text-green-600"
                  }`}
                >
                  {message.text}
                </p>
              )}
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Ketik di sini..."
                  required
                  className="h-11"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <Button
                type="submit"
                className="bg-blue-700 hover:bg-blue-800 h-11 w-full text-base"
                disabled={isLoading}
              >
                {isLoading ? (
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {isLoading ? "Submitting..." : "Submit"}
              </Button>
            </form>
          </div>
        </div>

        {/* Kolom Kanan */}
        <div className="hidden lg:flex items-center justify-center p-8">
          <Image
            src="/forgot-password-illustration.svg"
            alt="Forgot Password Illustration"
            width={150}
            height={150}
            className="h-auto w-auto"
          />
        </div>
      </main>
    </div>
  );
}
