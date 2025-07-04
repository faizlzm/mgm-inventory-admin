import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Fungsi middleware utama
export function middleware(request: NextRequest) {
  // 1. Ambil token dari cookie
  const accessToken = request.cookies.get("accessToken")?.value;

  // 2. Dapatkan path URL yang sedang diakses
  const { pathname } = request.nextUrl;

  // 3. Definisikan rute publik yang tidak memerlukan login
  const publicPaths = ["/login", "/signup", "/forgot-password"];

  // 4. Cek apakah path saat ini adalah rute yang dilindungi
  // Rute dilindungi adalah semua rute kecuali rute publik
  const isProtectedRoute = !publicPaths.some((path) =>
    pathname.startsWith(path)
  );

  // --- LOGIKA PENGALIHAN ---

  // Jika pengguna mencoba mengakses rute yang dilindungi TAPI tidak punya token,
  // alihkan ke halaman login.
  if (isProtectedRoute && !accessToken) {
    // Simpan URL yang ingin diakses agar bisa dialihkan kembali setelah login
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Jika pengguna SUDAH login (punya token) TAPI mencoba mengakses halaman login/signup,
  // alihkan ke halaman dashboard utama.
  if (accessToken && publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.redirect(new URL("/dashboard/beranda", request.url));
  }

  // Jika semua kondisi di atas tidak terpenuhi, lanjutkan ke tujuan
  return NextResponse.next();
}

// Konfigurasi `matcher` untuk menentukan di rute mana middleware ini akan berjalan
export const config = {
  matcher: [
    /*
     * Cocokkan semua path permintaan kecuali untuk:
     * - api (rute API)
     * - _next/static (file statis)
     * - _next/image (optimasi gambar)
     * - favicon.ico (file favicon)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
