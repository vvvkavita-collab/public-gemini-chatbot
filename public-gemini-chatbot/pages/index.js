// pages/index.js
import { useState } from "react";

export default function Home() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hello — ask me anything!" }
  ]);
  const [loading, setLoading] = useState(false);

  async function send() {
    if (!input.trim()) return;
    const userMsg = { role: "user", text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const history = messages.filter(m => m.role).map(m => ({ role: m.role, text: m.text }));
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg.text, history })
      });
      const data = await res.json();
      if (data.reply) {
        setMessages(prev => [...prev, { role: "assistant", text: data.reply }]);
      } else {
        setMessages(prev => [...prev, { role: "assistant", text: "Sorry, no reply." }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", text: "Error contacting server." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: "40px auto", padding: 12, fontFamily: "sans-serif" }}>
      <h1>Gemini Chatbot</h1>
      <div style={{ border: "1px solid #ddd", padding: 12, minHeight: 300 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: 12 }}>
            <b style={{ textTransform: "capitalize" }}>{m.role}:</b>
            <div>{m.text}</div>
          </div>
        ))}
        {loading && <div>...waiting for reply</div>}
      </div>
      <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Type your question..."
          style={{ flex: 1, padding: 8 }}
        />
        <button onClick={send} disabled={loading}>Send</button>
      </div>
      <p style={{ fontSize: 12, color: "#666" }}>Note: This demo uses Gemini via a server API (your key stays secret).</p>
    </div>
  );
}
