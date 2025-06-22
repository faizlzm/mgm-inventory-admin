"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export default function LoginPage() {
  const router = useRouter();
  const [nim, setNim] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Panggil API route internal yang kita buat
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nim, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        // Jika ada error dari API, tampilkan pesannya
        throw new Error(data.message ?? "Login failed. Please try again.");
      }

      // Jika login berhasil
      console.log("Login successful:", data);

      // Simpan token ke localStorage (atau cara lain yang lebih aman seperti httpOnly cookie)
      if (data.data.accessToken) {
        localStorage.setItem("accessToken", data.data.accessToken);
      }
      if (data.data.refreshToken) {
        localStorage.setItem("refreshToken", data.data.refreshToken);
      }

      // Arahkan pengguna ke halaman dashboard
      router.push("/dashboard/beranda");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
        console.error(err);
      } else {
        setError("An unexpected error occurred.");
        console.error(err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen w-full grid-cols-1 lg:grid-cols-2">
      {/* Left Panel */}
      <div className="bg-blue-700 relative hidden items-center justify-center rounded-r-2xl lg:flex">
        <div className="text-center">
          <div className="mb-4 inline-block">
            <Image
              src="/mgm.svg"
              alt="MGM Laboratory Logo"
              width={150}
              height={150}
              className="h-auto w-auto"
            />
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="bg-background flex w-full items-center justify-center p-6 sm:p-8">
        <div className="mx-auto w-full max-w-sm space-y-7">
          <div className="space-y-2 text-left">
            <h1 className="text-3xl font-bold">Login</h1>
            <p className="text-muted-foreground">
              Login to access your system account
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleLogin}>
            {/* Tampilkan pesan error jika ada */}
            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="grid gap-2">
              <Label htmlFor="nim">NIM</Label>
              <Input
                id="nim"
                type="text"
                placeholder="Ketik di sini..."
                required
                className="h-11"
                value={nim}
                onChange={(e) => setNim(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Ketik di sini..."
                  required
                  className="h-11 pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <div className="flex items-center gap-2">
                <Checkbox id="remember-me" disabled={isLoading} />
                <Label htmlFor="remember-me" className="font-normal">
                  Remember me
                </Label>
              </div>
              <Link
                href="#"
                className="ml-auto inline-block text-sm text-destructive hover:underline"
              >
                Forgot Password
              </Link>
            </div>

            <Button
              type="submit"
              className="bg-blue-700 h-11 w-full text-base"
              disabled={isLoading}
            >
              {isLoading ? (
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>

          {/* Bagian social login tidak saya ubah */}
          <div className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-medium text-primary hover:underline"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
