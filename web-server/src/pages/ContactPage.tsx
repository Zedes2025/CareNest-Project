import { useMemo, useState } from "react";
import { useLoaderData } from "react-router";

import { NotificationCard } from "../components/contactcomponents/notifCard";
import { getConnections, myConnectionRequest } from "../data/connection";
import { me } from "../data";

type ConnectionType = "incoming" | "outgoing";
type ConnectionStatus = "pending" | "accepted" | "declined";

type ConnectionItem = {
  _id: string;
  fromUserId: string;
  toUserId: string;
  status: ConnectionStatus;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
  type: ConnectionType;

  senderFirstName?: string;
  senderLastName?: string;
  senderProfilePicture?: string;

  receiverFirstName?: string;
  receiverLastName?: string;
  receiverProfilePicture?: string;
};

export async function connectionLoader() {
  const aboutme = await me();
  if (!aboutme) return;

  try {
    const [incoming, outgoing] = await Promise.all([
      getConnections(aboutme._id),
      myConnectionRequest(aboutme._id),
    ]);

    const allRequests: ConnectionItem[] = [
      ...incoming.map((req: any) => ({ ...req, type: "incoming" as const })),
      ...outgoing.map((req: any) => ({ ...req, type: "outgoing" as const })),
    ];

    return { user: allRequests };
  } catch {
    return { user: null, error: "Failed to load connections." };
  }
}

function newestFirst(a: ConnectionItem, b: ConnectionItem) {
  const ta = new Date(a.updatedAt ?? a.createdAt ?? 0).getTime();
  const tb = new Date(b.updatedAt ?? b.createdAt ?? 0).getTime();
  return tb - ta;
}

export const ContactPage = () => {
  const { user: initialUser, error } = useLoaderData() as {
    user: ConnectionItem[] | null;
    error: string | null;
  };

  const [connections, setConnections] = useState<ConnectionItem[]>(
    initialUser || [],
  );

  const [activeTab, setActiveTab] = useState<"pending" | "sent" | "archives">(
    "pending",
  );

  const handleUpdate = (id: string, newStatus: ConnectionStatus) => {
    setConnections((prev) =>
      prev.map((conn) =>
        conn._id === id ? { ...conn, status: newStatus } : conn,
      ),
    );
  };

  const isNotSelf = (c: ConnectionItem) => c.fromUserId !== c.toUserId;

  const pendingIncoming = useMemo(
    () =>
      connections
        .filter((c) => c.type === "incoming" && c.status === "pending")
        .sort(newestFirst),
    [connections],
  );

  const sentPending = useMemo(
    () =>
      connections
        .filter((c) => c.type === "outgoing" && c.status === "pending")
        .sort(newestFirst),
    [connections],
  );

  const declinedArchive = useMemo(
    () =>
      connections
        .filter((c) => c.status === "declined" && isNotSelf(c))
        .sort(newestFirst),
    [connections],
  );

  const acceptedRequests = useMemo(
    () =>
      connections
        .filter((c) => c.status === "accepted" && isNotSelf(c))
        .sort(newestFirst),
    [connections],
  );

  if (error) return <p className="text-red-500">{error}</p>;
  if (!connections) return <p>Loading...</p>;

  const renderList = (items: ConnectionItem[]) => {
    if (items.length === 0) {
      return <p className="mt-3 text-sm opacity-60">Nothing to show.</p>;
    }

    return items.map((each) => {
      const isOutgoing = each.type === "outgoing";

      const username = isOutgoing
        ? `${each.receiverFirstName ?? ""} ${each.receiverLastName ?? ""}`.trim()
        : `${each.senderFirstName ?? ""} ${each.senderLastName ?? ""}`.trim();

      const avatarUrl = isOutgoing
        ? (each.receiverProfilePicture ?? "")
        : (each.senderProfilePicture ?? "");

      return (
        <NotificationCard
          key={each._id}
          id={each._id}
          username={username || "Unknown"}
          avatarUrl={avatarUrl}
          initialStatus={each.status}
          isOutgoing={isOutgoing}
          onUpdate={(status) =>
            handleUpdate(each._id, status as ConnectionStatus)
          }
        />
      );
    });
  };

  return (
    <div className="container mx-auto px-4 py-10 h-full flex flex-col min-h-0">
      <section className="flex flex-col flex-1 min-h-0">
        <h1 className="text-2xl font-semibold">Notifications</h1>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1fr_2fr] flex-1 min-h-200">
          {/* LEFT */}
          <div className="card bg-base-100 shadow border h-full min-h-0">
            <div className="card-body p-4 h-full min-h-0 flex flex-col justify-start">
              <div role="tablist" className="tabs tabs-boxed w-full">
                <button
                  type="button"
                  role="tab"
                  className={`tab flex-1 ${activeTab === "pending" ? "tab-active" : ""}`}
                  onClick={() => setActiveTab("pending")}
                >
                  Pending ({pendingIncoming.length})
                </button>
                <button
                  type="button"
                  role="tab"
                  className={`tab flex-1 ${activeTab === "sent" ? "tab-active" : ""}`}
                  onClick={() => setActiveTab("sent")}
                >
                  Sent ({sentPending.length})
                </button>
                <button
                  type="button"
                  role="tab"
                  className={`tab flex-1 ${activeTab === "archives" ? "tab-active" : ""}`}
                  onClick={() => setActiveTab("archives")}
                >
                  Archives ({declinedArchive.length})
                </button>
              </div>

              <div className="mt-4">
                {activeTab === "pending" && (
                  <h2 className="text-lg font-semibold">Pending requests</h2>
                )}
                {activeTab === "sent" && (
                  <h2 className="text-lg font-semibold">Sent requests</h2>
                )}
                {activeTab === "archives" && (
                  <h2 className="text-lg font-semibold">Archives</h2>
                )}
              </div>

              <div className="mt-3 flex-1 min-h-0 overflow-y-auto pr-1">
                <div className="space-y-4">
                  {activeTab === "pending" && renderList(pendingIncoming)}
                  {activeTab === "sent" && renderList(sentPending)}
                  {activeTab === "archives" && renderList(declinedArchive)}
                </div>
              </div>
            </div>
          </div>

          {/* ACCEPTED */}
          <div className="card bg-base-100 shadow border h-full min-h-0">
            <div className="card-body p-4 h-full min-h-0 flex flex-col justify-start">
              <div className="tabs tabs-boxed w-full pointer-events-none">
                <span className="tab flex-1">
                  Here you can chat with people by clicking on their card.
                  (Coming soon!)
                </span>
              </div>

              <div className="mt-1" />
              <h2 className="text-lg font-semibold">Accepted requests</h2>

              <div className="mt-3 flex-1 min-h-0 overflow-y-auto pr-1">
                <div className="space-y-4">{renderList(acceptedRequests)}</div>
              </div>
            </div>
          </div>

          {/* CHAT */}
          <div className="card bg-base-100 shadow border h-full min-h-0">
            <div className="card-body p-4 h-full min-h-0 flex items-center justify-center">
              <div className="text-center opacity-60">
                <div className="text-xl font-semibold">Placeholder</div>
                <div className="mt-1 text-sm">
                  Chat functionality will appear here later.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// import { NotificationCard } from "../components/contactcomponents/notifCard";
// import { getConnections, myConnectionRequest } from "../data/connection";
// import { me } from "../data";
// import { useLoaderData } from "react-router";
// import { useState } from "react";

// export async function connectionLoader() {
//   const aboutme = await me();
//   if (!aboutme) return;

//   try {
//     // Fetch both types of requests
//     const [incoming, outgoing] = await Promise.all([
//       getConnections(aboutme._id), // Requests others sent to me
//       myConnectionRequest(aboutme._id), // Requests I sent to others
//     ]);

//     // Tag them so you can distinguish them in the UI if needed
//     const allRequests = [...incoming.map((req: any) => ({ ...req, type: "incoming" })), ...outgoing.map((req: any) => ({ ...req, type: "outgoing" }))];

//     return { user: allRequests };
//   } catch (e) {
//     return { user: null, error: "Failed to load connections." };
//   }
// }

// export const ContactPage = () => {
//   // const { user, error } = useLoaderData() as { user: any[] | null; error: string | null };
//   const { user: initialUser, error } = useLoaderData() as { user: any[] | null; error: string | null };
//   console.log("Loader Data:", initialUser);
//   const [connections, setConnections] = useState(initialUser || []);
//   const handleUpdate = (id: string, newStatus: string) => {
//     // This updates the local array, triggering a re-render
//     setConnections((prev) => prev.map((conn) => (conn._id === id ? { ...conn, status: newStatus } : conn)));
//   };

//   if (error) return <p className="text-red-500">{error}</p>;
//   if (!connections) return <p>Loading...</p>;

//   return (
//     <div className="container mx-auto px-4 py-10">
//       <section>
//         <h1 className="text-2xl font-semibold">Notifications</h1>
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//           <div className="mt-4">
//             <h2 className="text-lg font-semibold mb-2">Pending requests</h2>
//             {connections
//               .filter((e) => e.status === "pending" && e.type === "incoming")
//               .map((each) => (
//                 <NotificationCard
//                   key={each._id}
//                   id={each._id}
//                   // Pass the callback to update the state
//                   onUpdate={(status) => handleUpdate(each._id, status)}
//                   username={`${each.senderFirstName} ${each.senderLastName}`}
//                   avatarUrl={each.senderProfilePicture}
//                   initialStatus={each.status}
//                   isOutgoing={false}
//                 />
//               ))}
//           </div>
//           <div className="mt-4">
//             <h2 className="text-lg font-semibold mb-2">Sent requests</h2>
//             {connections
//               .filter((e) => e.type === "outgoing")
//               .map((each) => (
//                 <NotificationCard
//                   key={each._id}
//                   id={each._id}
//                   isOutgoing={true}
//                   // Pass the callback to update the state
//                   username={`${each.receiverFirstName} ${each.receiverLastName}`}
//                   avatarUrl={each.receiverProfilePicture}
//                   initialStatus={each.status}
//                   onUpdate={(status) => handleUpdate(each._id, status)}
//                 />
//               ))}
//           </div>
//           <div className="mt-4">
//             <h2 className="text-lg font-semibold mb-2">Archives</h2>
//             {connections
//               .filter((e) => {
//                 const isFinalized = (e.status === "accepted" || e.status === "declined") && e.type === "incoming";
//                 // 2. Exclude self-requests (if the sender ID matches the receiver ID)
//                 const isNotSelf = e.fromUserId !== e.toUserId;

//                 return isFinalized && isNotSelf;
//               })
//               .map((each) => (
//                 <NotificationCard
//                   key={each._id}
//                   id={each._id}
//                   // Pass the callback to update the state
//                   onUpdate={(status) => handleUpdate(each._id, status)}
//                   username={`${each.senderFirstName} ${each.senderLastName}`}
//                   avatarUrl={each.senderProfilePicture}
//                   initialStatus={each.status}
//                   isOutgoing={false}
//                 />
//               ))}
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// };
