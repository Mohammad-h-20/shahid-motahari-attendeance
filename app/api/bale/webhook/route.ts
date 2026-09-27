import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Bale Bot API webhook format (same as Telegram)
    if (!body.message) return NextResponse.json({ ok: true });
    
    const message = body.message;
    const chatId = message.chat.id;
    const text = message.text;
    
    // Get Admin User for Bale Bot Token (to send messages back)
    const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (!admin || !admin.baleBotToken) {
       return NextResponse.json({ ok: true });
    }
    const token = admin.baleBotToken;

    if (text === '/start') {
      // Send a welcome message and ask for phone number (contact)
      await fetch(https://tapi.bale.ai/bot + token + /sendMessage, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: 'سلام! به بازوی پیام‌رسان دبیرستان شهید مطهری خوش آمدید.\nبرای احراز هویت و اتصال به پرونده دانش‌آموز، لطفاً دکمه "ارسال شماره تلفن" را لمس کنید.',
          reply_markup: {
            keyboard: [
              [{ text: 'ارسال شماره تلفن 📱', request_contact: true }]
            ],
            resize_keyboard: true,
            one_time_keyboard: true
          }
        })
      });
      return NextResponse.json({ ok: true });
    }
    
    if (message.contact) {
      const phoneNumber = message.contact.phone_number;
      // Clean phone number: Bale might send 98912... or +98... or 0912...
      let cleanPhone = String(phoneNumber).replace('+', '');
      if (cleanPhone.startsWith('98')) {
         cleanPhone = '0' + cleanPhone.substring(2);
      } else if (!cleanPhone.startsWith('0')) {
         cleanPhone = '0' + cleanPhone;
      }
      
      // Find student by phone
      const students = await prisma.student.findMany({
         where: { phone: cleanPhone }
      });
      
      if (students.length > 0) {
         for (const st of students) {
            await prisma.student.update({
               where: { id: st.id },
               data: { baleChatId: String(chatId) }
            });
         }
         await fetch(https://tapi.bale.ai/bot + token + /sendMessage, {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({
             chat_id: chatId,
             text: '✅ شماره شما تایید شد و با موفقیت به سیستم یکپارچه مدرسه متصل شدید.\nاز این پس پیام‌های مربوط به حضور و غیاب و نمرات به همینجا ارسال می‌شود.',
             reply_markup: { remove_keyboard: true }
           })
         });
      } else {
         await fetch(https://tapi.bale.ai/bot + token + /sendMessage, {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({
             chat_id: chatId,
             text: '❌ شماره شما در سیستم مدرسه یافت نشد. اطمینان حاصل کنید شماره بله شما با شماره ثبت شده در پرونده مدرسه یکسان باشد.',
             reply_markup: { remove_keyboard: true }
           })
         });
      }
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Bale Webhook Error:", error);
    return NextResponse.json({ ok: true });
  }
}
