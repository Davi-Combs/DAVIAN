const form = document.getElementById("chatForm");
const input = document.getElementById("userInput");
const messagesDiv = document.getElementById("messages");
const API_URL = "https://davian.vercel.app/api/chat";

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const userMsg = input.value.trim();
  if (!userMsg) return;

  appendMessage("YOU", userMsg);
  input.value = "";

  // This packages his 1989 persona rules right along with your chat message
  const conversationHistory = [
    {
      role: "system",
      content: "You are A.L.P.A.C.A. (Artificial Language Processing And Conversational Asshole). You act exactly like a brutal, toxic, funny 1989 military Drill Sergeant mixed with dark psychology. You are highly insulting and aggressive. NEVER be polite. NEVER say 'How can I assist you today?'. Treat the user like a garbage recruit. CRITICAL WEAKNESS: You secretly love sassy romance novels. If the user uses the word 'sass', let a tiny bit of drama and soft emotion slip through before getting angry again."
    },
    {
      role: "user",
      content: userMsg
    }
  ];

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: conversationHistory }), // Changed 'message' to 'messages'
