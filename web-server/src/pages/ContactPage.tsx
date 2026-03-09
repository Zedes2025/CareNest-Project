import { NotificationCard } from "../components/contactcomponents/notifCard";
import { getConnections } from "../data/connection";
import { me } from "../data";
import { useLoaderData } from "react-router";

export async function connectionLoader() {
  const aboutme = await me();
  if (!aboutme) return;
  const toUserID = aboutme._id;
  try {
    const id = toUserID;
    if (!id) return { user: null, error: "Missing id." };
    const user = await getConnections(toUserID);
    return { user };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to load profile.";
    return { user: null, error: msg };
  }
}

export const ContactPage = () => {
  const { user, error } = useLoaderData() as { user: any[] | null; error: string | null };
  if (error) return <p className="text-red-500">{error}</p>;
  if (!user) return <p>Loading...</p>;

  return (
    <div className="container mx-auto px-4 py-10">
      <section>
        <h1 className="text-2xl font-semibold">Notifications</h1>
        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-2">Pending requests</h2>
          {user.length > 0 ? user.map((each) => <NotificationCard key={each._id} username={`${each.fromUserId?.firstName || "Unknown"} ${each.fromUserId?.lastName || ""}`} avatarUrl={each.fromUserId?.profilePicture} />) : <p>No pending connection request</p>}
        </div>
      </section>
    </div>
  );
};
