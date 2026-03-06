const apiServerURL = import.meta.env.VITE_APP_API_SERVER_URL ?? "http://localhost:3000";
import { me } from "./auth";

export async function getConnections(userId: string) {
  // Your backend endpoint uses /:id, so the URL must look like this:
  const res = await fetch(`${apiServerURL}/connectionrequests/${userId}`);

  if (!res.ok) {
    if (res.status === 404) return []; // Return empty array if no requests
    throw new Error("Failed to fetch pending requests");
  }

  return await res.json();
}

export async function sendConnectionRequest(toUserId: string, profilePicture: string) {
  const aboutme = await me();
  console.log(aboutme);
  const fromUserId = aboutme._id;
  const res = await fetch(`${apiServerURL}/connectionrequests`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // If you use JWT authentication, add your token here:
      // "Authorization": `Bearer ${localStorage.getItem("token")}`
    },
    body: JSON.stringify({
      fromUserId,
      toUserId,
      profilePicture,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    // Throw the error so the frontend component can catch it
    throw new Error(data.message || "Failed to send request");
  }

  return data;
}
