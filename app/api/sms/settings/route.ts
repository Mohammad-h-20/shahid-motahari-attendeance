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
        baleBotToken: true,
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
      configured: !!apiKey || !!user?.baleBotToken,
      apiKey: user?.kavenegarApiKey ? user.kavenegarApiKey.slice(0, 6) + '...' + user.kavenegarApiKey.slice(-4) : "",
      rawApiKey: user?.kavenegarApiKey || "",
      sender: user?.kavenegarSender || "2000660110",
      smsMode: user?.smsMode || "NORMAL",
      lookupTemplateAbsent: user?.lookupTemplateAbsent || "",
      lookupTemplateLate: user?.lookupTemplateLate || "",
      baleBotToken: user?.baleBotToken || "",
      balanceInfo,
      isConnected,
    });
  } catch (error) {
    console.error("Error fetching SMS settings:", error);
    return NextResponse.json(
      { error: "خطا در دریافت تنظیمات" },
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
      baleBotToken,
    } = body;

    const admin = await prisma.user.findFirst({ orderBy: { createdAt: "asc" } });

    if (!admin) {
      return NextResponse.json(
        { error: "کاربر مدیر یافت نشد." },
        { status: 404 }
      );
    }

    // Verify Bale token if provided
    if (baleBotToken) {
       try {
          const baleRes = await fetch('https://tapi.bale.ai/bot' + baleBotToken + '/getMe');
          const baleData = await baleRes.json();
          if (!baleData.ok) {
             return NextResponse.json({ error: "توکن بله نامعتبر است" }, { status: 400 });
          }
          // Set Webhook automatically
          const webhookUrl = new URL(request.url).origin + '/api/bale/webhook';
          await fetch('https://tapi.bale.ai/bot' + baleBotToken + '/setWebhook', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: webhookUrl })
          });
          }
       } catch (e) {
          return NextResponse.json({ error: "خطا در ارتباط با سرور بله" }, { status: 400 });
       }
    }

    // Validate Kavenegar if provided and not Bale mode
    if (kavenegarApiKey && smsMode !== "BALE") {
      try {
        await getKavenegarAccountInfo(kavenegarApiKey);
      } catch (e: any) {
        return NextResponse.json(
          { error: "کلید API کاوه نگار نامعتبر است یا ارتباط برقرار نشد." },
          { status: 400 }
        );
      }
    }

    await prisma.user.update({
      where: { id: admin.id },
      data: {
        kavenegarApiKey: kavenegarApiKey || admin.kavenegarApiKey,
        kavenegarSender: kavenegarSender || admin.kavenegarSender,
        smsMode: smsMode,
        lookupTemplateAbsent: lookupTemplateAbsent !== undefined ? lookupTemplateAbsent : admin.lookupTemplateAbsent,
        lookupTemplateLate: lookupTemplateLate !== undefined ? lookupTemplateLate : admin.lookupTemplateLate,
        baleBotToken: baleBotToken !== undefined ? baleBotToken : admin.baleBotToken,
      },
    });

    return NextResponse.json({
      success: true,
      message: "تنظیمات ارتباطی با موفقیت ذخیره شد.",
    });
  } catch (error) {
    console.error("Error saving SMS settings:", error);
    return NextResponse.json(
      { error: "خطایی رخ داد" },
      { status: 500 }
    );
  }
}

