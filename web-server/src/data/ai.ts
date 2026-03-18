const AI_SERVER_URL = import.meta.env.VITE_AI_SERVER_URL;
if (!AI_SERVER_URL) throw new Error("AI_SERVER_URL is required, are you missing a .env file?");
const baseURL = `${AI_SERVER_URL}/ai/chat`;

type ChatBody = {
  prompt: string;
  chatId?: string | null;
};

type ChatRes = {
  completion: string;
  chatId: string;
};

export const createChat = async (body: ChatBody): Promise<ChatRes> => {
  const accessToken = localStorage.getItem("accessToken"); // in case user is logged in, save token
  const response = await fetch(`${baseURL}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: accessToken ? `Bearer ${accessToken}` : "", // in case user is logged in, include token in header
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || data.message || "Something went wrong");
  }

  const aiResponse = (await response.json()) as ChatRes;

  return aiResponse;
};
