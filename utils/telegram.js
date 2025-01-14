// import { fetchLinksByInterval, setTelegramChat } from "../utils/supabase";
import dotenv from 'dotenv';

dotenv.config();

async function update_telegram(request) {
    const body = await request.json();

    console.log("Received update");
    console.log(body);
    console.log(body.my_chat_member?.new_chat_member?.status);

    if (body.my_chat_member?.new_chat_member?.status == "kicked") {
      const chatId = body.my_chat_member.chat.id;

      console.log("User kickedd");

      try {
        // Fetch the telegram token or user record from the database
        // This is a placeholder - implement your actual DB call or external fetch
        await setTelegramChat(null, chatId, process.env);

        console.log("User kicked");

        // Return response to Telegram
        return new Response("Received start command and fetched user", { status: 200 });
      } catch (error) {
        console.log("Error when user kicked");
        // If an error occurs, return that the token is invalid
        return new Response("User kicked", { status: 200 });
      }
    }

    // Check for /start command
    if (body.message?.text?.startsWith("/start")) {
        const chatId = body.message.chat.id;
        const text = body.message.text;

        // Token extraction from "/start <token>"
        const textParts = text.split(" ");
        let token = null;

        if (textParts.length > 1) {
          token = textParts[1];
        }
        
        if (!token) {
            sendMessage(chatId, "No token provided", process.env)
            return new Response("No token provided", { status: 400 });
        }

        sendMessage(chatId, `Received token", ${token}`, process.env)

        try {
            // Fetch the telegram token or user record from the database
            // This is a placeholder - implement your actual DB call or external fetch
            await setTelegramChat(token, chatId, process.env);

            // If found, you can link userRecord to chatId, etc.
            // e.g., store chatId in DB if you haven't yet
            sendMessage(chatId, "Token set", process.env);

            // Return response to Telegram
            return new Response("Received start command and fetched user", { status: 200 });
        } catch (error) {
            sendMessage(chatId, "Invalid token", process.env);
            // If an error occurs, return that the token is invalid
            return new Response("Invalid token", { status: 400 });
        }
    }

    // If not /start command, just respond OK
    return new Response("OK", { status: 200 });
}


async function set_webhook() {
    const url = `https://api.telegram.org/bot${env.TELEGRAM_KEY}/setWebhook?url=${env.URL}/telegram/updates`;    

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
    });
    
    const responseBody = await response.json();
    return new Response(JSON.stringify(responseBody), { status: 200 });
}


async function remove_webhook() {
    const url = `https://api.telegram.org/bot${env.TELEGRAM_KEY}/deleteWebhook`;

    const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    });

    return new Response(JSON.stringify(await response.json()), { status: 200 });    
}


async function get_webhooks() {
    const url = `https://api.telegram.org/bot${env.TELEGRAM_KEY}/getWebhookInfo`;

    const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    });

    return new Response(JSON.stringify(await response.json()), { status: 200 });
}


export async function sendMessage(chat_id, message) {
  const url = `https://api.telegram.org/bot${process.env.TELEGRAM_KEY}/sendMessage?chat_id=${chat_id}`;
  const params = {
    // chat_id: CHAT_ID,
    text: message,
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const responseData = await response.json();

    if (responseData.ok) {
      console.log('Message sent successfully.');
    } else {
      console.error('Failed to send message:', responseData.description);
    }
  } catch (error) {
    console.error('Error sending message:', error);
  }
}


export { update_telegram, set_webhook, remove_webhook, get_webhooks };