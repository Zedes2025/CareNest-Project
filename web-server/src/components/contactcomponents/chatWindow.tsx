import { useEffect, useRef, useState } from "react";
import { sendMsg, getMsg } from "../../data";

export const ChatWindow = ({ recipientId }: { recipientId: string }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const isInitialLoad = useRef(true);
  // Load history when the chat opens or changes
  useEffect(() => {
    const loadMessages = async (isFirstTime = false) => {
      // Only show spinner on the initial load
      if (isFirstTime) {
        setLoading(true);
        isInitialLoad.current = true; // Reset for new recipient}
      }

      try {
        const data = await getMsg(recipientId);
        // // We reverse because chat usually shows oldest at top, newest at bottom
        const reversed = data.reverse();

        // Use the functional update (prev) to get the LATEST messages
        setMessages((prev) => {
          // ONLY update state if the length is different
          // This prevents the "scroll" effect from triggering if no new mail arrived
          if (reversed.length !== prev.length) {
            return reversed;
          }
          return prev; // Returning the exact same reference prevents re-renders
        });
      } catch (err) {
        console.error("Chat load error:", err);
      } finally {
        if (isFirstTime) setLoading(false);
      }
    };
    // Initial load with spinner
    loadMessages(true);

    const intervalId = setInterval(() => {
      loadMessages(false);
    }, 3000);

    return () => clearInterval(intervalId);
  }, [recipientId]);

  // Handle scrolling
  useEffect(() => {
    if (messages.length > 0) {
      bottomRef.current?.scrollIntoView({
        // Snap instantly on first load, slide smoothly for new messages
        behavior: isInitialLoad.current ? "auto" : "smooth",
      });
      isInitialLoad.current = false;
    }
  }, [messages]);

  const onSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      const result = await sendMsg(recipientId, text);
      setMessages((prev) => [...prev, result]); // Add new message to list
      setText(""); // Clear input
    } catch (err) {
      console.error("Send error:", err);
    }
  };

  return (
    <div className="flex flex-col h-full max-h-full">
      {/* Scrollable Message List */}
      <div className="flex-1 overflow-y-auto  min-h-0 space-y-3 pr-2 mb-4">
        {loading ? (
          <div className="flex justify-center py-10">
            <span className="loading loading-dots"></span>
          </div>
        ) : (
          messages.map((m) => (
            <div key={m._id} className={`chat ${m.toUserId === recipientId ? "chat-end" : "chat-start"}`}>
              <div className={`chat-bubble ${m.toUserId === recipientId ? "chat-bubble-primary" : "chat-bubble-secondary"}`}>{m.msg}</div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Field */}
      <form onSubmit={onSend} className="flex gap-2 border-t pt-4">
        <input type="text" placeholder="Type a message..." className="input input-bordered flex-1 rounded-xl" value={text} onChange={(e) => setText(e.target.value)} />
        <button type="submit" className="btn btn-primary rounded-xl px-6">
          Send
        </button>
      </form>
    </div>
  );
};
