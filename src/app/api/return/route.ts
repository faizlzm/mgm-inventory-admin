import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // 1. Ambil token dari cookie
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
    const limit = searchParams.get("limit") ?? "100";

    // 3. Panggil API backend untuk mendapatkan data return
    const apiResponse = await fetch(
      `https://mgm-inventory-be.vercel.app/api/v1/return?page=${page}&limit=${limit}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const data = await apiResponse.json();

    if (!apiResponse.ok) {
      return NextResponse.json(
        { success: false, message: data.message ?? "Failed to fetch return data" },
        { status: apiResponse.status }
      );
    }

    // 4. Kirim kembali respons dari backend ke client
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Return API route error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. Ambil token dari cookie
    const accessToken = request.cookies.get("accessToken")?.value;
    if (!accessToken) {
      return NextResponse.json(
        { success: false, message: "Authentication token not found" },
        { status: 401 }
      );
    }

    // 2. Ambil data dari form data
    const formData = await request.formData();
    const itemId = formData.get("itemId") as string;
    const borrowDate = formData.get("borrowDate") as string;
    const returnDate = formData.get("returnDate") as string;
    const damagedItem = formData.get("damagedItem") as File | null;

    // 3. Validasi data yang diperlukan
    if (!itemId || !borrowDate || !returnDate) {
      return NextResponse.json(
        { success: false, message: "itemId, borrowDate, and returnDate are required" },
        { status: 400 }
      );
    }

    // 4. Siapkan form data untuk dikirim ke backend
    const backendFormData = new FormData();
    backendFormData.append("itemId", itemId);
    backendFormData.append("borrowDate", borrowDate);
    backendFormData.append("returnDate", returnDate);
    
    if (damagedItem) {
      backendFormData.append("damagedItem", damagedItem);
    }

    // 5. Panggil API backend untuk membuat return request
    const apiResponse = await fetch(
      "https://mgm-inventory-be.vercel.app/api/v1/return",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          // Note: Don't set Content-Type header for FormData, browser will set it automatically with boundary
        },
        body: backendFormData,
      }
    );

    const data = await apiResponse.json();

    if (!apiResponse.ok) {
      return NextResponse.json(
        { success: false, message: data.message ?? "Failed to create return request" },
        { status: apiResponse.status }
      );
    }

    // 6. Kirim kembali respons dari backend ke client
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Create return API route error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
