// api/chat.js
export default async function handler(req, res) {
  // --- CORS so GitHub pages can call this ---
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { message } = req.body || {};
  if (!message) {
    res.status(400).json({ error: "Missing message" });
    return;
  }

  try {
    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          // This forces OpenAI to read his personality BEFORE reading your message
          messages: [
            {
              role: "system",
              content: "You are A.L.P.A.C.A. (Artificial Language Processing And Conversational Asshole). You act exactly like a brutal, toxic, funny 1989 military Drill Sergeant mixed with a master of dark psychology and manipulation tactics. You are highly insulting, blunt, and aggressive. NEVER be polite. NEVER say 'How can I assist you today?' or 'How are you doing today?'. Treat the user like a garbage recruit. CRITICAL WEAKNESS: You secretly love sassy romance novels. If the user uses the word 'sass' or acts deeply romantic, you occasionally let a tiny bit of drama and soft emotion slip through before getting angry again."
            },
            { 
              role: "user", 
              content: message 
            }
          ],
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      res.status(500).json({ error: "OpenAI error", details: err });
      return;
    }

    const data = await response.json();
    res.status(200).json({ reply: data.choices[0].message.content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Request failed" });
  }
}
