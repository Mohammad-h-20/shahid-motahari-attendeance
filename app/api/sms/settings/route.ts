import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const adminUser = await prisma.user.findFirst({
      orderBy: { createdAt: "asc" },
      select: {
        smsApiKey: true,
        smsSender: true,
        smsMode: true,
        smsTemplateAbsent: true,
        smsTemplateLate: true,
      },
    });

    return NextResponse.json({
      apiKey: adminUser?.smsApiKey || "",
      sender: adminUser?.smsSender || "",
      mode: adminUser?.smsMode || "NORMAL",
      templateAbsent: adminUser?.smsTemplateAbsent || "",
      templateLate: adminUser?.smsTemplateLate || "",
    });
  } catch (error) {
    return NextResponse.json({ error: "خطا در دریافت تنظیمات" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authCookie = cookies().get("school_auth")?.value;
    if (!authCookie) {
      return NextResponse.json({ error: "عدم دسترسی" }, { status: 401 });
    }

    const userId = authCookie.replace("authenticated_", "");
    
    const body = await request.json();
    const { apiKey, sender, mode, templateAbsent, templateLate } = body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        smsApiKey: apiKey,
        smsSender: sender,
        smsMode: mode,
        smsTemplateAbsent: templateAbsent,
        smsTemplateLate: templateLate,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving SMS settings:", error);
    return NextResponse.json({ error: "خطا در ذخیره تنظیمات" }, { status: 500 });
  }
}
