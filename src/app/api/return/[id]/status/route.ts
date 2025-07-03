import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Ambil token dari cookie
    const accessToken = request.cookies.get("accessToken")?.value;
    if (!accessToken) {
      return NextResponse.json(
        { success: false, message: "Authentication token not found" },
        { status: 401 }
      );
    }

    // 2. Ambil ID dari parameter
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Return ID is required" },
        { status: 400 }
      );
    }

    // 3. Ambil data dari body request
    const body = await request.json();
    const { status } = body;

    // 4. Validasi status
    const validStatuses = ["approved", "rejected"];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, message: "Valid status is required (approved or rejected)" },
        { status: 400 }
      );
    }

    // 5. Panggil API backend untuk update return status
    const apiResponse = await fetch(
      `https://mgm-inventory-be.vercel.app/api/v1/return/${id}/status`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ status }),
      }
    );

    const data = await apiResponse.json();

    if (!apiResponse.ok) {
      return NextResponse.json(
        { success: false, message: data.message ?? "Failed to update return status" },
        { status: apiResponse.status }
      );
    }

    // 6. Kirim kembali respons dari backend ke client
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Update return status API route error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
