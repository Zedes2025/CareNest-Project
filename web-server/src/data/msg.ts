const apiServerURL = import.meta.env.VITE_APP_API_SERVER_URL ?? "http://localhost:3000";

export async function sendMsg(toUserId: string, msg: string) {
  //   const aboutme = await me();
  const accessToken = localStorage.getItem("accessToken");
  // const fromUserId = aboutme._id;
  const res = await fetch(`${apiServerURL}/chat/${toUserId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      toUserId,
      msg,
    }),
  });
  if (!res.ok) {
    throw new Error("Failed to update request status");
  }

  const data = await res.json();
  return data;
}
