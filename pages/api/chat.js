// pages/api/chat.js
import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { message, history } = req.body || {};
  if (!message) return res.status(400).json({ error: "No message provided" });

  // Read API key from environment variable (set on Vercel / your server)
  const KEY = process.env.GOOGLE_API_KEY;
  if (!KEY) return res.status(500).json({ error: "Server missing Google API key" });

  try {
    const ai = new GoogleGenAI({ apiKey: KEY }); // use API key mode (Gemini Developer API)
    // Build contents as chat-like messages (simple history + user message)
    const contents = [
      // system instruction — optional
      { role: "system", parts: [{ text: "You are a helpful assistant." }] },
      // include history if provided (array of {role:'user'|'assistant', text: '...'})
      ...(Array.isArray(history) ? history.flatMap(m => [{ role: m.role, parts: [{ text: m.text }] }]) : []),
      // user message
      { role: "user", parts: [{ text: message }] }
    ];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // recommended model - change if you want
      contents
    });

    // The SDK returns a response object; .text gives the final text.
    const text = response?.text ?? (typeof response === "string" ? response : "No response");

    return res.status(200).json({ reply: text });
  } catch (err) {
    console.error("Gemini error:", err);
    return res.status(500).json({ error: "Failed to call Gemini API", details: err.message || err });
  }
}
