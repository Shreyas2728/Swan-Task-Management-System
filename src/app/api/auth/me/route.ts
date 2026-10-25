import { NextRequest, NextResponse } from "next/server";
import { getAuthSession, unauthorizedResponse } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthSession(req);
    if (!user) {
      return unauthorizedResponse("No active session. Please log in.");
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Auth Me Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve authenticated user" },
      { status: 500 }
    );
  }
}
