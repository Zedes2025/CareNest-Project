//import { createChat, getChatHistory } from "@/data";
//import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useState } from "react";
import Markdown from "react-markdown";
import { ToastContainer } from "react-toastify";

export default function Chat() {
  const [messages, setMessages] = useState([
    { _id: "1", role: "assistant", content: "Hello! I am your AI." },
  ]);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt) return;

    // fake user message
    const userMsg = { _id: crypto.randomUUID(), role: "user", content: prompt };
    setMessages([...messages, userMsg]);
    setPrompt("");

    // fake AI response after 1s
    setLoading(true);
    setTimeout(() => {
      const botMsg = {
        _id: crypto.randomUUID(),
        role: "assistant",
        content: "AI response here.",
      };
      setMessages((prev) => [...prev, botMsg]);
      setLoading(false);
    }, 1000);
  };

  return (
    <div
      className="fixed bottom-20 right-8 w-80 max-h-[70vh] rounded-lg shadow-lg flex flex-col z-[9998]"
      style={{ backgroundColor: "var(--chat-bg)", color: "var(--chat-text)" }}
    >
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg) => {
          const isBot = msg.role === "assistant";
          return (
            <div
              key={msg._id}
              className={`chat ${isBot ? "chat-start" : "chat-end"}`}
            >
              <div
                className="chat-bubble"
                style={{
                  backgroundColor: isBot
                    ? "var(--chat-bot-bubble)"
                    : "var(--chat-user-bubble)",
                  color: "var(--chat-text)",
                }}
              >
                <Markdown>{msg.content}</Markdown>
              </div>
            </div>
          );
        })}
        {loading && (
          <div style={{ color: "var(--chat-text)" }}>Thinking...</div>
        )}
      </div>

      <form
        onSubmit={handleSend}
        className="p-4 border-t border-gray-500 flex flex-col gap-2"
      >
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
          placeholder="Ask me anything..."
          className="w-full px-2 py-1 rounded"
          style={{
            backgroundColor: "var(--chat-bg)",
            color: "var(--chat-text)",
          }}
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded py-2"
          style={{
            backgroundColor: "var(--chat-btn-bg)",
            color: "var(--chat-btn-text)",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor = "var(--chat-btn-hover)")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.backgroundColor = "var(--chat-btn-bg)")
          }
        >
          Send
        </button>
      </form>

      <ToastContainer autoClose={1500} theme="colored" />
    </div>
  );
}
