// Utility functions for Persian (Jalali) date, time and number formatting

export function toPersianDigits(num: number | string | null | undefined): string {
  if (num === null || num === undefined) return '';
  const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num
    .toString()
    .replace(/\d/g, (x) => farsiDigits[parseInt(x)]);
}

export function toEnglishDigits(str: string | number | null | undefined): string {
  if (str === null || str === undefined) return '';
  const persianDigits = [/۰/g, /۱/g, /۲/g, /۳/g, /۴/g, /۵/g, /۶/g, /۷/g, /۸/g, /۹/g];
  const arabicDigits = [/٠/g, /١/g, /٢/g, /٣/g, /٤/g, /٥/g, /٦/g, /٧/g, /٨/g, /٩/g];
  let result = str.toString();
  for (let i = 0; i < 10; i++) {
    result = result.replace(persianDigits[i], String(i)).replace(arabicDigits[i], String(i));
  }
  return result;
}

export function getTodayJalaliString(dateObj: Date = new Date()): string {
  const formatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian-nu-latn', {
    timeZone: 'Asia/Tehran',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const parts = formatter.formatToParts(dateObj);
  let year = '';
  let month = '';
  let day = '';

  for (const part of parts) {
    if (part.type === 'year') year = part.value;
    if (part.type === 'month') month = part.value;
    if (part.type === 'day') day = part.value;
  }

  return `${year}-${month}-${day}`;
}

export function formatJalaliFull(dateStr?: string): string {
  try {
    let date: Date;
    if (!dateStr) {
      date = new Date();
    } else {
      // If dateStr is YYYY-MM-DD jalali, convert to a nice formatted string
      const [jy, jm, jd] = dateStr.split('-').map(Number);
      if (jy && jm && jd) {
        const monthNames = [
          'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
          'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
        ];
        const monthName = monthNames[jm - 1] || '';
        return `${toPersianDigits(jd)} ${monthName} ${toPersianDigits(jy)}`;
      }
      date = new Date(dateStr);
    }

    return new Intl.DateTimeFormat('fa-IR', {
      timeZone: 'Asia/Tehran',
      calendar: 'persian',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  } catch (err) {
    return dateStr || '';
  }
}

export function getIranLiveTime(): { time: string; fullDate: string; jalaliDate: string } {
  const now = new Date();
  
  const timeFormatter = new Intl.DateTimeFormat('fa-IR', {
    timeZone: 'Asia/Tehran',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const dateFormatter = new Intl.DateTimeFormat('fa-IR', {
    timeZone: 'Asia/Tehran',
    calendar: 'persian',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return {
    time: timeFormatter.format(now),
    fullDate: dateFormatter.format(now),
    jalaliDate: getTodayJalaliString(now),
  };
}

export function shiftJalaliDate(jalaliDateStr: string, daysOffset: number): string {
  try {
    const [jy, jm, jd] = jalaliDateStr.split('-').map(Number);
    // Jalali days per month
    const isLeap = isJalaliLeapYear(jy);
    const daysInMonth = [
      31, 31, 31, 31, 31, 31,
      30, 30, 30, 30, 30, isLeap ? 30 : 29
    ];

    let currentY = jy;
    let currentM = jm;
    let currentD = jd + daysOffset;

    while (currentD > (daysInMonth[currentM - 1] || 30)) {
      currentD -= daysInMonth[currentM - 1];
      currentM++;
      if (currentM > 12) {
        currentM = 1;
        currentY++;
      }
    }

    while (currentD < 1) {
      currentM--;
      if (currentM < 1) {
        currentM = 12;
        currentY--;
      }
      currentD += daysInMonth[currentM - 1];
    }

    const yStr = currentY.toString();
    const mStr = currentM.toString().padStart(2, '0');
    const dStr = currentD.toString().padStart(2, '0');
    return `${yStr}-${mStr}-${dStr}`;
  } catch {
    return jalaliDateStr;
  }
}

function isJalaliLeapYear(jy: number): boolean {
  const rem = jy % 33;
  return [1, 5, 9, 13, 17, 22, 26, 30].includes(rem);
}
