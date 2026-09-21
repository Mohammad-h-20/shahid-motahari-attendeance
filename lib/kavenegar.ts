// Modern Kavenegar REST API Client for Next.js and Node.js

export interface KavenegarSendParams {
  apiKey: string;
  sender?: string;
  receptor: string;
  message: string;
}

export interface KavenegarLookupParams {
  apiKey: string;
  receptor: string;
  template: string;
  token: string;
  token2?: string;
  token3?: string;
}

export interface KavenegarResponse {
  return: {
    status: number;
    message: string;
  };
  entries?: Array<{
    messageid: number;
    message: string;
    status: number;
    statustext: string;
    sender: string;
    receptor: string;
    date: number;
    cost: number;
  }>;
}

/**
 * Send standard SMS via Kavenegar
 */
export async function sendKavenegarSms({
  apiKey,
  sender,
  receptor,
  message,
}: KavenegarSendParams): Promise<KavenegarResponse> {
  const cleanKey = apiKey.trim();
  const url = `https://api.kavenegar.com/v1/${cleanKey}/sms/send.json`;

  const bodyParams = new URLSearchParams();
  bodyParams.append("receptor", receptor.trim());
  bodyParams.append("message", message);
  if (sender && sender.trim()) {
    bodyParams.append("sender", sender.trim());
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
    },
    body: bodyParams.toString(),
  });

  const data = await response.json();
  if (!response.ok || data?.return?.status !== 200) {
    throw new Error(data?.return?.message || "خطا در ارسال پیامک از طریق کاوه نگار");
  }

  return data;
}

/**
 * Send verify / lookup SMS (Pattern-based, reaches blacklisted numbers)
 */
export async function sendKavenegarLookup({
  apiKey,
  receptor,
  template,
  token,
  token2,
  token3,
}: KavenegarLookupParams): Promise<KavenegarResponse> {
  const cleanKey = apiKey.trim();
  const query = new URLSearchParams({
    receptor: receptor.trim(),
    template: template.trim(),
    token: token.trim(),
  });

  if (token2) query.append("token2", token2.trim());
  if (token3) query.append("token3", token3.trim());

  const url = `https://api.kavenegar.com/v1/${cleanKey}/verify/lookup.json?${query.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  const data = await response.json();
  if (!response.ok || data?.return?.status !== 200) {
    throw new Error(data?.return?.message || "خطا در ارسال پیامک اعتبارسنجی کاوه نگار");
  }

  return data;
}

/**
 * Check Kavenegar Account Info and Balance
 */
export async function getKavenegarAccountInfo(apiKey: string): Promise<any> {
  const cleanKey = apiKey.trim();
  const url = `https://api.kavenegar.com/v1/${cleanKey}/account/info.json`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  const data = await response.json();
  if (!response.ok || data?.return?.status !== 200) {
    throw new Error(data?.return?.message || "خطا در دریافت مشخصات حساب کاوه نگار");
  }

  return data.entries;
}
