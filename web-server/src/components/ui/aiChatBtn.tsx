import { useState } from "react";
import Chat from "../Chat";

export function ChatBtn() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && <Chat />}{" "}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="fixed bottom-14 right-8 z-[9999] btn btn-circle btn-ai"
      >
        Chat
      </button>
    </>
  );
}
