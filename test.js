async function test() {
  const token = '8624341838:AAFtwtu4wU46Gt4YPxrF0zoiMLZRPbkE-sY';
  // Use the chat ID the user provided earlier: 7036994564
  const chatId = '7036994564';
  const text = 'Test message from server!';

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
  
  const data = await response.json();
  console.log("Telegram API Response:", data);
}

test();
