// import toast styles (used by ToastContainer)
import "react-toastify/dist/ReactToastify.css";

import { useState, useRef, useEffect } from "react"; // added useRef + useEffect
import Markdown from "react-markdown";
import { ToastContainer } from "react-toastify";
import { createChat } from "../data/ai.ts";

// structure of each message in the chat
interface Message {
  _id: string; // unique id for React rendering
  role: "user" | "assistant"; // who sent the message
  content: string; // text of the message
}

export default function Chat() {
  // stores all chat messages
  const [messages, setMessages] = useState<Message[]>([]);

  // text typed by the user
  const [prompt, setPrompt] = useState("");

  // loading state while waiting for AI response
  const [loading, setLoading] = useState(false);

  // chat id returned by backend (used to continue same conversation)
  const [chatId, setChatId] = useState<string | null>(null);

  // reference to the bottom of the chat container
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // whenever messages OR loading changes → scroll to the bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // called when the user submits the form
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();

    // prevent sending empty messages
    if (!prompt) return;

    // show loading indicator
    setLoading(true);

    // create user message object
    const userMsg: Message = {
      role: "user",
      content: prompt,
      _id: crypto.randomUUID(), // generate unique id
    };

    setMessages((prev) => [...prev, userMsg]); // add user message to chat immediately

    try {
      const res = await createChat({ prompt, chatId }); // send message to backend AI server

      const botMsg: Message = {
        // create assistant response message
        role: "assistant",
        content: res.completion,
        _id: crypto.randomUUID(),
      };

      setMessages((prev) => [...prev, botMsg]); // adds AI message to chat

      setChatId(res.chatId);
      // stores chatId returned by backend
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false); // stop loading state

      setPrompt(""); // clear textarea after sending
    }
  };
  function speakMessage(text: string) {
    // function to read aloud a message using Web Speech API
    if (!text) return;
    window.speechSynthesis.cancel(); // Clear any stuck queue or previous speech

    window.speechSynthesis.resume(); // Force a resume in case the engine was left in a paused state

    const textToSpeech = new SpeechSynthesisUtterance(text);

    speechSynthesis.speak(textToSpeech);
  }
  function stopPlayback() {
    speechSynthesis.pause();
  }
  function resumePlayback() {
    speechSynthesis.resume();
  }

  return (
    <div
      // fixed chat window positioned at bottom-right
      className="fixed bottom-20 right-8 w-80 max-h-[70vh] rounded-lg shadow-lg flex flex-col z-[9998]"
      style={{
        backgroundColor: "var(--chat-bg)",
        color: "var(--chat-text)",
      }}
    >
      {/* message container */}
      {/* overflow-y-auto enables scrolling */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg) => {
          const isBot = msg.role === "assistant";

          return (
            <div
              key={msg._id}
              className={`chat ${isBot ? "chat-start" : "chat-end"}`} // left/right bubble depending on sender
            >
              <div
                className="chat-bubble"
                style={{
                  // different color for user and assistant bubbles
                  backgroundColor: isBot
                    ? "var(--chat-bot-bubble)"
                    : "var(--chat-user-bubble)",
                  color: "var(--chat-text)",
                }}
              >
                <Markdown>{msg.content}</Markdown>
                <div className="flex gap-2">
                  {" "}
                  {/* container for listen/stop buttons */}
                  {isBot && (
                    <button
                      onClick={() => speakMessage(msg.content)} // btn to read message aloud
                      className="mt-2 p-2 text-xs   opacity-70 hover:opacity-100 bg-orange-200 rounded-2xl"
                    >
                      ▶️ Listen
                    </button>
                  )}
                  {isBot && (
                    <button
                      onClick={() => stopPlayback()} // btn to stop speech
                      className="  mt-2 p-2 text-xs   opacity-70 hover:opacity-100 bg-orange-200 rounded-2xl justify-end"
                    >
                      ⏸️ pause
                    </button>
                  )}
                  {isBot && (
                    <button
                      onClick={() => resumePlayback()} // btn to stop speech
                      className="  mt-2 p-2 text-xs   opacity-70 hover:opacity-100 bg-orange-200 rounded-2xl justify-end"
                    >
                      ⏯️ resume
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {/* loading indicator while waiting for AI */}
        {loading && <span className="loading loading-dots loading-sm"></span>}
        <div ref={bottomRef} /> {/* invisible element used for auto-scroll */}
      </div>

      {/* message input form */}
      <form
        onSubmit={handleSend}
        className="p-4 border-t border-gray-500 flex flex-col gap-2"
      >
        {/* textarea for typing prompt */}
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            // allow sending message with Enter key (without Shift)
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend(e as unknown as React.FormEvent);
            }
          }}
          rows={3}
          placeholder="Ask me about CareNest..."
          className="w-full px-2 py-1 rounded"
          style={{
            backgroundColor: "var(--chat-bg)",
            color: "var(--chat-text)",
          }}
        />

        {/* send button */}
        <button
          type="submit"
          disabled={loading} // disabled while waiting for AI
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

      {/* toast notification container */}
      <ToastContainer autoClose={1500} theme="colored" />
    </div>
  );
}
