type VercelRequest = {
  method?: string;
  body?: {
    name?: string;
    email?: string;
    phone?: string;
    service?: string;
    message?: string;
  };
};

type VercelResponse = {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => {
    json: (body: unknown) => void;
  };
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).json({ ok: true });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return res.status(500).json({ error: "Configuration error: Telegram credentials missing" });
  }

  const name = String(req.body?.name || "");
  const email = String(req.body?.email || "");
  const phone = String(req.body?.phone || "");
  const service = String(req.body?.service || "");
  const message = String(req.body?.message || "");

  const text = `New Proposal Request:
Name: ${name}
Email: ${email}
Phone: ${phone || "N/A"}
Service: ${service}
Message: ${message}`;

  try {
    const telegramResponse = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
    });

    const rawResponse = await telegramResponse.text();
    let responseData: any = null;

    try {
      responseData = rawResponse ? JSON.parse(rawResponse) : null;
    } catch {
      responseData = { raw: rawResponse };
    }

    if (!telegramResponse.ok) {
      const telegramDescription =
        responseData?.description || responseData?.raw || "Telegram rejected the request.";

      return res.status(500).json({ error: telegramDescription });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Internal Error sending to Telegram:", error);
    return res.status(500).json({ error: "Failed to send notification" });
  }
}
