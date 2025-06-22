// src/app/api/auth/login/route.ts

import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Ambil body (nim dan password) dari request yang dikirim oleh form login
    const body = await request.json();
    const { nim, password } = body;

    if (!nim || !password) {
      return NextResponse.json(
        { success: false, message: "NIM and password are required" },
        { status: 400 }
      );
    }

    // Kirim request ke API backend yang sebenarnya
    const apiResponse = await fetch(
      "https://mgm-inventory-be.vercel.app/api/v1/auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // Pastikan body yang dikirim sesuai dengan format yang diminta backend
        body: JSON.stringify({ nim, password }),
      }
    );

    // Ambil data JSON dari respons backend
    const data = await apiResponse.json();

    // Debug: log response dari backend
    console.debug("Backend login response:", {
      status: apiResponse.status,
      ok: apiResponse.ok,
      data,
    });

    // 4. Periksa apakah request ke backend berhasil atau tidak
    if (!apiResponse.ok) {
      // Jika backend mengembalikan error (misal: password salah), teruskan pesan errornya
      console.error("Login failed:", data.message ?? "Unknown error");
      return NextResponse.json(
        { success: false, message: data.message ?? "An error occurred" },
        { status: apiResponse.status }
      );
    }

    // Debug: log success jika login berhasil
    console.info("Login successful:", data);

    // 5. Jika berhasil, teruskan respons dari backend ke client (frontend)
    // Kita bisa mengatur cookie di sini jika perlu, tapi untuk sekarang kita teruskan saja datanya
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Login API route error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
