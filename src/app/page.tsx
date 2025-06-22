"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    // Cek apakah refreshToken ada di localStorage
    const refreshToken = localStorage.getItem("refreshToken");

    if (refreshToken) {
      // Jika ada, arahkan ke beranda dashboard
      router.replace("/dashboard/beranda");
    } else {
      // Jika tidak ada, arahkan ke halaman login
      router.replace("/login");
    }
  }, [router]);

  // Tampilkan loading indicator selama proses pengecekan dan pengalihan
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
    </div>
  );
}
