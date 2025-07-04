import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Ambil data dari body request
    const body = await request.json();
    const { name, email, nim, password } = body;

    // Validasi sederhana
    if (!name || !email || !nim || !password) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    // Kirim request ke API backend yang sebenarnya
    const apiResponse = await fetch(
      "https://mgm-inventory-be.vercel.app/api/v1/auth/register",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, nim, password }),
      }
    );

    const data = await apiResponse.json();

    // Periksa jika ada error dari backend
    if (!apiResponse.ok) {
      return NextResponse.json(
        { success: false, message: data.message ?? "Registration failed" },
        { status: apiResponse.status }
      );
    }

    // Jika berhasil, teruskan respons sukses ke frontend
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Register API route error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
