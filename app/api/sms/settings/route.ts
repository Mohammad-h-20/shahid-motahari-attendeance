import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getKavenegarAccountInfo } from "@/lib/kavenegar";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await prisma.user.findFirst({
      orderBy: { createdAt: "asc" },
      select: {
        kavenegarApiKey: true,
        kavenegarSender: true,
        smsMode: true,
        lookupTemplateAbsent: true,
        lookupTemplateLate: true,
      },
    });

    let balanceInfo: any = null;
    let isConnected = false;

    const apiKey = user?.kavenegarApiKey || process.env.KAVENEGAR_API_KEY;
    if (apiKey) {
      try {
        balanceInfo = await getKavenegarAccountInfo(apiKey);
        isConnected = true;
      } catch (e: any) {
        console.warn("Could not fetch Kavenegar balance:", e.message);
      }
    }

    return NextResponse.json({
      configured: !!apiKey,
      apiKey: user?.kavenegarApiKey ? `${user.kavenegarApiKey.slice(0, 6)}...${user.kavenegarApiKey.slice(-4)}` : "",
      rawApiKey: user?.kavenegarApiKey || "",
      sender: user?.kavenegarSender || "2000660110",
      smsMode: user?.smsMode || "NORMAL",
      lookupTemplateAbsent: user?.lookupTemplateAbsent || "",
      lookupTemplateLate: user?.lookupTemplateLate || "",
      balanceInfo,
      isConnected,
    });
  } catch (error) {
    console.error("Error fetching SMS settings:", error);
    return NextResponse.json(
      { error: "خطا در دریافت تنظیمات پیامک" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      kavenegarApiKey,
      kavenegarSender,
      smsMode = "NORMAL",
      lookupTemplateAbsent,
      lookupTemplateLate,
    } = body;

    const user = await prisma.user.findFirst({
      orderBy: { createdAt: "asc" },
    });

    if (!user) {
      return NextResponse.json({ error: "کاربر یافت نشد." }, { status: 404 });
    }

    // Optional: test API key with Kavenegar if provided
    let accountInfo: any = null;
    if (kavenegarApiKey && kavenegarApiKey.trim()) {
      try {
        accountInfo = await getKavenegarAccountInfo(kavenegarApiKey.trim());
      } catch (err: any) {
        return NextResponse.json(
          {
            error: `کلید کاوه نگار نامعتبر است: ${err.message || "امکان اتصال وجود ندارد"}`,
          },
          { status: 400 }
        );
      }
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        kavenegarApiKey: kavenegarApiKey ? kavenegarApiKey.trim() : null,
        kavenegarSender: kavenegarSender ? kavenegarSender.trim() : null,
        smsMode,
        lookupTemplateAbsent: lookupTemplateAbsent ? lookupTemplateAbsent.trim() : null,
        lookupTemplateLate: lookupTemplateLate ? lookupTemplateLate.trim() : null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "تنظیمات وب‌سرویس کاوه نگار با موفقیت ذخیره و اعتبارسنجی شد.",
      accountInfo,
    });
  } catch (error: any) {
    console.error("Error saving SMS settings:", error);
    return NextResponse.json(
      { error: error.message || "خطا در ذخیره‌سازی تنظیمات پیامک" },
      { status: 500 }
    );
  }
}
