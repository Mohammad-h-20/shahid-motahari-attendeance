import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const authCookie = cookies().get("school_auth")?.value;
    if (!authCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const history = await prisma.loginHistory.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json(history);
  } catch (error) {
    console.error("Error fetching login history:", error);
    return NextResponse.json(
      { error: "خطا در دریافت تاریخچه ورود" },
      { status: 500 }
    );
  }
}
