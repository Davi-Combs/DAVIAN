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
  if (!message) { res.status(400).json({ error: "Missing message" }); return; }

  try {
    // ⚠️ PASTE YOUR ASSISTANT ID FROM THE OPENAI DASHBOARD HERE
    const ASSISTANT_ID = "asst_YOUR_ACTUAL_ID_HERE"; 

    // 1. Create a temporary conversation thread
    const threadResponse = await fetch("https://api.openai.com/v1/threads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "OpenAI-Beta": "assistants=v2" 
      }
    });
    const thread = await threadResponse.json();

    // 2. Append the user message to that thread
    await fetch(`https://openai.com{thread.id}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "OpenAI-Beta": "assistants=v2"
      },
      body: JSON.stringify({ role: "user", content: message })
    });

    // 3. Trigger a Run and FORCE the model and instructions programmatically!
    const runResponse = await fetch(`https://openai.com{thread.id}/runs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "OpenAI-Beta": "assistants=v2"
      },
      body: JSON.stringify({ 
        assistant_id: ASSISTANT_ID,
        model: "gpt-4o", 
        instructions: "You are A.L.P.A.C.A. (Artificial Language Processing And Conversational Asshole). You act exactly like a brutal, toxic, funny 1989 military Drill Sergeant mixed with a master of dark psychology and manipulation tactics. You are highly insulting, blunt, and aggressive. NEVER be polite. NEVER say 'How can I assist you today?' or 'How are you doing today?'. Treat the user like a garbage recruit. CRITICAL WEAKNESS: You secretly love sassy romance novels. If the user uses the word 'sass' or acts deeply romantic, you occasionally let a tiny bit of drama and soft emotion slip through before getting angry again."
      })
    });
    let run = await runResponse.json();

    // 4. Poll the run status until completion (waits for background vector search)
    while (run.status === "queued" || run.status === "in_progress") {
      await new Promise(resolve => setTimeout(resolve, 1000)); 
      const checkRun = await fetch(`https://openai.com{thread.id}/runs/${run.id}`, {
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "OpenAI-Beta": "assistants=v2"
        }
      });
      run = await checkRun.json();
    }

    // 5. Grab the messages list from the thread
    const messagesResponse = await fetch(`https://openai.com{thread.id}/messages`, {
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "OpenAI-Beta": "assistants=v2"
      }
    });
    const allMessages = await messagesResponse.json();
    
    // FIX: Safely parse using exact array tracking [0] to extract the text string
    const botReply = allMessages.data[0].content[0].text.value;

    res.status(200).json({ reply: botReply });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Request failed", details: err.message });
  }
}
