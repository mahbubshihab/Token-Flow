import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const res = await fetch("https://tools.dongvanfb.net/api/get_messages_oauth2", {
      method: "POST",
      headers: {
        "accept": "*/*",
        "content-type": "application/json",
        "Referer": "https://dongvanfb.net/"
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { status: false, content: "Server Proxy Error: " + (error?.message || "Lỗi kết nối!") },
      { status: 500 }
    );
  }
}
