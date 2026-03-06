const apiServerURL = import.meta.env.VITE_APP_API_SERVER_URL ?? "http://localhost:3000";

type connectionCard = {
  _id: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  aboutMe?: string;
  city?: string | null;
};

export async function getConnection(id: string): Promise<connectionCard> {
  const res = await fetch(`${apiServerURL}/users/profile/${id}`);
  if (!res.ok) throw new Error("No Connection is found");
  const data = await res.json();
  return data;
}
