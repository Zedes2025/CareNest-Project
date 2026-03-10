import { NotificationCard } from "../components/contactcomponents/notifCard";
import { getConnections } from "../data/connection";
import { me } from "../data";
import { useLoaderData } from "react-router";
import { useState } from "react";

export async function connectionLoader() {
  const aboutme = await me();
  if (!aboutme) return;
  const toUserID = aboutme._id;
  try {
    const id = toUserID;
    if (!id) return { user: null, error: "Missing id." };
    const connections = await getConnections(toUserID);
    return { user: connections };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to load profile.";
    return { user: null, error: msg };
  }
}

export const ContactPage = () => {
  // const { user, error } = useLoaderData() as { user: any[] | null; error: string | null };
  const { user: initialUser, error } = useLoaderData() as { user: any[] | null; error: string | null };
  const [connections, setConnections] = useState(initialUser || []);
  const handleUpdate = (id: string, newStatus: string) => {
    // This updates the local array, triggering a re-render
    setConnections((prev) => prev.map((conn) => (conn._id === id ? { ...conn, status: newStatus } : conn)));
  };

  if (error) return <p className="text-red-500">{error}</p>;
  if (!connections) return <p>Loading...</p>;

  return (
    <div className="container mx-auto px-4 py-10">
      <section>
        <h1 className="text-2xl font-semibold">Notifications</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="mt-4">
            <h2 className="text-lg font-semibold mb-2">Pending requests</h2>
            {connections
              .filter((e) => e.status === "pending")
              .map((each) => (
                <NotificationCard
                  key={each._id}
                  id={each._id}
                  // Pass the callback to update the state
                  onUpdate={(status) => handleUpdate(each._id, status)}
                  username={`${each.senderFirstName} ${each.senderLastName}`}
                  avatarUrl={each.senderProfilePicture}
                  initialStatus={each.status}
                />
              ))}
          </div>
          <div className="mt-4">
            <h2 className="text-lg font-semibold mb-2">Archives</h2>
            {connections
              .filter((e) => e.status === "accepted" || e.status === "declined")
              .map((each) => (
                <NotificationCard
                  key={each._id}
                  id={each._id}
                  // Pass the callback to update the state
                  onUpdate={(status) => handleUpdate(each._id, status)}
                  username={`${each.senderFirstName} ${each.senderLastName}`}
                  avatarUrl={each.senderProfilePicture}
                  initialStatus={each.status}
                />
              ))}
          </div>
        </div>
      </section>
    </div>
  );
};
