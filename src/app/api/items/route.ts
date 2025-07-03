import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // 1. Ambil token dari cookie (HttpOnly cookies tidak bisa diakses dari frontend)
    const accessToken = request.cookies.get("accessToken")?.value;
    if (!accessToken) {
      return NextResponse.json(
        { success: false, message: "Authentication token not found" },
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
          Authorization: `Bearer ${accessToken}`, // Menggunakan Bearer token format
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

export async function POST(request: NextRequest) {
  try {
    // 1. Ambil token dari cookie (HttpOnly cookies tidak bisa diakses dari frontend)
    const accessToken = request.cookies.get("accessToken")?.value;
    if (!accessToken) {
      return NextResponse.json(
        { success: false, message: "Authentication token not found" },
        { status: 401 }
      );
    }

    // 2. Ambil data dari body request
    const body = await request.json();
    const { name, quantity } = body;

    // 3. Validasi sederhana
    if (!name || quantity === undefined) {
      return NextResponse.json(
        { success: false, message: "Name and quantity are required" },
        { status: 400 }
      );
    }

    // 4. Panggil API backend yang sebenarnya dengan menyertakan token
    const apiResponse = await fetch(
      "https://mgm-inventory-be.vercel.app/api/v1/item",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ name, quantity }),
      }
    );

    const data = await apiResponse.json();

    if (!apiResponse.ok) {
      return NextResponse.json(
        { success: false, message: data.message ?? "Failed to create item" },
        { status: apiResponse.status }
      );
    }

    // 5. Kirim kembali respons dari backend ke client
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Create item API route error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
