import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nim, password } = body;

    // Panggil backend utama Anda untuk autentikasi
    const apiResponse = await fetch(
      "https://mgm-inventory-be.vercel.app/api/v1/auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nim, password }),
      }
    );

    const data = await apiResponse.json();

    if (!apiResponse.ok) {
      // Jika login gagal, kembalikan pesan error seperti biasa
      return NextResponse.json(
        { success: false, message: data.message ?? "Login failed" },
        { status: apiResponse.status }
      );
    }

    // Jika login berhasil:
    const { accessToken, refreshToken } = data.data;

    // Buat respons
    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      data: {
        // Anda bisa memilih untuk tidak mengirim token lagi di body
        // atau tetap mengirimnya jika UI memerlukannya sesaat setelah login
      },
    });

    // Atur accessToken di dalam HttpOnly cookie
    response.cookies.set("accessToken", accessToken, {
      httpOnly: true, // Wajib: Agar tidak bisa diakses JS di browser
      secure: process.env.NODE_ENV === "production", // Wajib: Hanya dikirim via HTTPS di produksi
      sameSite: "strict", // Wajib: Untuk keamanan CSRF
      path: "/", // Berlaku untuk seluruh path di aplikasi
      maxAge: 60 * 60, // Contoh: Cookie berlaku selama 1 jam (dalam detik)
    });

    // Anda juga bisa menyimpan refreshToken dengan cara yang sama,
    // mungkin dengan maxAge yang lebih lama
    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // Contoh: 7 hari
    });

    return response;
  } catch (error) {
    console.error("Login API route error:", error);
    return NextResponse.json(
      { success: false, message: "An internal server error occurred." },
      { status: 500 }
    );
  }
}
