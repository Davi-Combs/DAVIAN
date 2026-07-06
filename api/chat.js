// api/chat.js
export default async function handler(req, res) {
  // ... [Keep your existing CORS headers and method checks exactly the same] ...
  
  const { message } = req.body || {};
  if (!message) { res.status(400).json({ error: "Missing message" }); return; }

  try {
    const ASSISTANT_ID = "YOUR_ASSISTANT_ID_HERE"; // Paste your asst_xxxx here

    // 1. Create a temporary conversation thread
    const threadResponse = await fetch("https://openai.com", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "OpenAI-Beta": "assistants=v2" // Mandatory for File Search / Vector Stores
      }
    });
    const thread = await threadResponse.json();

    // 2. Append the user message to that thread
    await fetch(`https://openai.com/${thread.id}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "OpenAI-Beta": "assistants=v2"
      },
      body: JSON.stringify({ role: "user", content: message })
    });


    // 3. Trigger a Run to process the query against your Vector Store
    const runResponse = await fetch(`https://openai.com{thread.id}/runs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "OpenAI-Beta": "assistants=v2"
      },
      // ADD THE MODEL LINE HERE to force OpenAI to use gpt-4o every time!
      body: JSON.stringify({ 
        assistant_id: ASSISTANT_ID,
        model: "gpt-4o" 
      })
    });
    let run = await runResponse.json();

    // 4. Poll the run status until completion (handles the background document search)
    while (run.status === "queued" || run.status === "in_progress") {
      await new Promise(resolve => setTimeout(resolve, 1000)); // wait 1 sec
      const checkRun = await fetch(`https://openai.com/${thread.id}/runs/${run.id}`, {
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "OpenAI-Beta": "assistants=v2"
        }
      });
      run = await checkRun.json();
    }

    // 5. Grab the final processed answer containing his book data
    const messagesResponse = await fetch(`https://openai.com/${thread.id}/messages`, {
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "OpenAI-Beta": "assistants=v2"
      }
    });
    const allMessages = await messagesResponse.json();
    const botReply = allMessages.data[0].content[0].text.value;

    res.status(200).json({ reply: botReply });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Request failed" });
  }
}
