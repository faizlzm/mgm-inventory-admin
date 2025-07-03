import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Ambil token dari cookie (HttpOnly cookies tidak bisa diakses dari frontend)
    const accessToken = request.cookies.get("accessToken")?.value;
    if (!accessToken) {
      return NextResponse.json(
        { success: false, message: "Authentication token not found" },
        { status: 401 }
      );
    }

    // 2. Ambil ID dari parameter
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Item ID is required" },
        { status: 400 }
      );
    }

    // 3. Panggil API backend yang sebenarnya dengan menyertakan token
    const apiResponse = await fetch(
      `https://mgm-inventory-be.vercel.app/api/v1/item/${id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const data = await apiResponse.json();

    if (!apiResponse.ok) {
      return NextResponse.json(
        { success: false, message: data.message ?? "Failed to delete item" },
        { status: apiResponse.status }
      );
    }

    // 4. Kirim kembali respons dari backend ke client
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Delete item API route error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Ambil token dari cookie (HttpOnly cookies tidak bisa diakses dari frontend)
    const accessToken = request.cookies.get("accessToken")?.value;
    if (!accessToken) {
      return NextResponse.json(
        { success: false, message: "Authentication token not found" },
        { status: 401 }
      );
    }

    // 2. Ambil ID dari parameter
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Item ID is required" },
        { status: 400 }
      );
    }

    // 3. Panggil API backend yang sebenarnya dengan menyertakan token
    const apiResponse = await fetch(
      `https://mgm-inventory-be.vercel.app/api/v1/item/${id}`,
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
        { success: false, message: data.message ?? "Failed to fetch item" },
        { status: apiResponse.status }
      );
    }

    // 4. Kirim kembali respons dari backend ke client
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Get item API route error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Ambil token dari cookie (HttpOnly cookies tidak bisa diakses dari frontend)
    const accessToken = request.cookies.get("accessToken")?.value;
    if (!accessToken) {
      return NextResponse.json(
        { success: false, message: "Authentication token not found" },
        { status: 401 }
      );
    }

    // 2. Ambil ID dari parameter
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Item ID is required" },
        { status: 400 }
      );
    }

    // 3. Ambil data dari body request
    const body = await request.json();
    const { name, quantity } = body;

    // 4. Validasi sederhana
    if (!name || quantity === undefined) {
      return NextResponse.json(
        { success: false, message: "Name and quantity are required" },
        { status: 400 }
      );
    }

    // 5. Panggil API backend yang sebenarnya dengan menyertakan token
    const apiResponse = await fetch(
      `https://mgm-inventory-be.vercel.app/api/v1/item/${id}`,
      {
        method: "PUT",
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
        { success: false, message: data.message ?? "Failed to update item" },
        { status: apiResponse.status }
      );
    }

    // 6. Kirim kembali respons dari backend ke client
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Update item API route error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
