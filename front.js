// front.js

// ⚠️ THIS MUST BE YOUR VERCEL BACKEND LINK (the app that holds your OpenAI key!)


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

try {
const res = await fetch(API_URL, {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ message: userMsg }),
});

if (!res.ok) {  
  appendMessage("SYSTEM ERROR", "Could not reach the drill sergeant.");  
  return;  
}  

const data = await res.json();  
  
// Displays the drill sergeant's roast on your screen!  
appendMessage("ALPACAL", data.reply);

} catch (err) {
console.error(err);
appendMessage("SYSTEM ERROR", "Connection lost in the trenches.");
}
});

// Helper function to insert text into your neon HTML box
function appendMessage(sender, text) {
const msgHtml = <p><strong>[${sender}]:</strong> ${text}</p>;
messagesDiv.innerHTML += msgHtml;
messagesDiv.scrollTop = messagesDiv.scrollHeight;
}
