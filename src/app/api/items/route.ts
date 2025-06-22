import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // 1. Ambil token otorisasi dari header yang dikirim oleh client
    const authorization = request.headers.get("Authorization");
    if (!authorization) {
      return NextResponse.json(
        { success: false, message: "Authorization header is missing" },
        { status: 401 }
      );
    }

    // 2. Ambil parameter pagination dari URL
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") ?? "1";
    const limit = searchParams.get("limit") ?? "10";

    // 3. Panggil API backend yang sebenarnya dengan menyertakan token
    const apiResponse = await fetch(
      `https://mgm-inventory-be.vercel.app/api/v1/item?page=${page}&limit=${limit}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: authorization, // Teruskan token ke backend
        },
      }
    );

    const data = await apiResponse.json();

    if (!apiResponse.ok) {
      return NextResponse.json(
        { success: false, message: data.message ?? "Failed to fetch items" },
        { status: apiResponse.status }
      );
    }

    // 4. Kirim kembali respons dari backend ke client
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Items API route error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
