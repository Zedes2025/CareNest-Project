import { NotificationCard } from "../components/contactcomponents/notifCard";
import { getConnections, myConnectionRequest } from "../data/connection";
import { me } from "../data";
import { useLoaderData } from "react-router";
import { useState } from "react";

export async function connectionLoader() {
  const aboutme = await me();
  if (!aboutme) return;

  try {
    // Fetch both types of requests
    const [incoming, outgoing] = await Promise.all([
      getConnections(aboutme._id), // Requests others sent to me
      myConnectionRequest(aboutme._id), // Requests I sent to others
    ]);

    // Tag them so you can distinguish them in the UI if needed
    const allRequests = [...incoming.map((req: any) => ({ ...req, type: "incoming" })), ...outgoing.map((req: any) => ({ ...req, type: "outgoing" }))];

    return { user: allRequests };
  } catch (e) {
    return { user: null, error: "Failed to load connections." };
  }
}

export const ContactPage = () => {
  // const { user, error } = useLoaderData() as { user: any[] | null; error: string | null };
  const { user: initialUser, error } = useLoaderData() as { user: any[] | null; error: string | null };
  console.log("Loader Data:", initialUser);
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
              .filter((e) => e.status === "pending" && e.type === "incoming")
              .map((each) => (
                <NotificationCard
                  key={each._id}
                  id={each._id}
                  // Pass the callback to update the state
                  onUpdate={(status) => handleUpdate(each._id, status)}
                  username={`${each.senderFirstName} ${each.senderLastName}`}
                  avatarUrl={each.senderProfilePicture}
                  initialStatus={each.status}
                  isOutgoing={false}
                />
              ))}
          </div>
          <div className="mt-4">
            <h2 className="text-lg font-semibold mb-2">Sent requests</h2>
            {connections
              .filter((e) => e.type === "outgoing")
              .map((each) => (
                <NotificationCard
                  key={each._id}
                  id={each._id}
                  isOutgoing={true}
                  // Pass the callback to update the state
                  username={`${each.receiverFirstName} ${each.receiverLastName}`}
                  avatarUrl={each.receiverProfilePicture}
                  initialStatus={each.status}
                  onUpdate={(status) => handleUpdate(each._id, status)}
                />
              ))}
          </div>
          <div className="mt-4">
            <h2 className="text-lg font-semibold mb-2">Archives</h2>
            {connections
              .filter((e) => {
                const isFinalized = (e.status === "accepted" || e.status === "declined") && e.type === "incoming";
                // 2. Exclude self-requests (if the sender ID matches the receiver ID)
                const isNotSelf = e.fromUserId !== e.toUserId;

                return isFinalized && isNotSelf;
              })
              .map((each) => (
                <NotificationCard
                  key={each._id}
                  id={each._id}
                  // Pass the callback to update the state
                  onUpdate={(status) => handleUpdate(each._id, status)}
                  username={`${each.senderFirstName} ${each.senderLastName}`}
                  avatarUrl={each.senderProfilePicture}
                  initialStatus={each.status}
                  isOutgoing={false}
                />
              ))}
          </div>
        </div>
      </section>
    </div>
  );
};
