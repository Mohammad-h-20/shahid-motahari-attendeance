export interface SmsIrSendParams {
  apiKey: string;
  sender?: string;
  receptor: string;
  message: string;
}

export interface SmsIrPatternParams {
  apiKey: string;
  receptor: string;
  templateId: number;
  parameters: Array<{ name: string; value: string }>;
}

export async function sendSmsIrNormal({ apiKey, sender, receptor, message }: SmsIrSendParams) {
  const url = "https://api.sms.ir/v1/send/bulk";
  const body: any = {
    MessageText: message,
    Mobiles: [receptor.trim()],
  };
  
  if (sender && sender.trim()) {
    body.lineNumber = parseInt(sender.trim(), 10);
  }

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "X-API-KEY": apiKey.trim(),
      "Content-Type": "application/json",
      "Accept": "text/plain",
    },
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function sendSmsIrPattern({ apiKey, receptor, templateId, parameters }: SmsIrPatternParams) {
  const url = "https://api.sms.ir/v1/send/verify";
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "X-API-KEY": apiKey.trim(),
      "Content-Type": "application/json",
      "Accept": "text/plain",
    },
    body: JSON.stringify({
      mobile: receptor.trim(),
      templateId: templateId,
      parameters: parameters,
    }),
  });
  return res.json();
}
