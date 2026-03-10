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

export async function sendConnectionRequest(toUserId: string) {
  const aboutme = await me();
  const accessToken = localStorage.getItem("accessToken");
  // console.log(aboutme); //sanity check whether it is retrieving data for aboutme
  const fromUserId = aboutme._id;
  const res = await fetch(`${apiServerURL}/connectionrequests`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      fromUserId,
      toUserId,
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    // If the API returns a message, throw it explicitly.
    const errorMessage = data.message || "Failed to send connection request.";
    throw new Error(errorMessage);
  }

  return data;
}

export async function statusUpdate(_id: string, status: string) {
  const accessToken = localStorage.getItem("accessToken");
  // const id = _id.toString();

  const res = await fetch(`${apiServerURL}/connectionrequests/${_id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      status,
    }),
  });
  if (!res.ok) {
    throw new Error("Failed to update request status");
  }

  const data = await res.json();
  return data;
}
