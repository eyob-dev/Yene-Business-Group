import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import dotenv from "dotenv";

dotenv.config();
async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API route for Telegram notification
  app.post("/api/send-proposal", async (req, res) => {
    console.log("Received proposal request:", req.body);
    const { name, email, phone, service, message } = req.body;
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      console.error("TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID must be configured.");
      return res.status(500).json({ error: "Configuration error: Telegram credentials missing" });
    }

    const text = `New Proposal Request:
Name: ${name}
Email: ${email}
Phone: ${phone || 'N/A'}
Service: ${service}
Message: ${message}`;

    try {
      console.log("Sending to Telegram...");
      const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text }),
      });

      const responseData = await response.json();
      console.log("Telegram API Response status:", response.status, responseData);

      if (!response.ok) {
        console.error("Telegram API Error:", responseData);
        return res.status(500).json({ error: "Failed to send to Telegram", details: responseData });
      }

      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Internal Error sending to Telegram:", error);
      res.status(500).json({ error: "Failed to send notification" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
