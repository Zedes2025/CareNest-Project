import { useMemo, useState } from "react";
import { useLoaderData } from "react-router";
import { ChatWindow } from "../components/contactcomponents/chatWindow";
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

  const [activeTab, setActiveTab] = useState<"pending" | "sent" | "declined">(
    "pending",
  );

  const [acceptedTab, setAcceptedTab] = useState<
    "all" | "incoming" | "outgoing"
  >("all");

  const [selectedChat, setSelectedChat] = useState<{
    id: string;
    username: string;
  } | null>(null);

  const handleUpdate = (id: string, newStatus: ConnectionStatus) => {
    setConnections((prev) =>
      prev.map((conn) =>
        conn._id === id ? { ...conn, status: newStatus } : conn,
      ),
    );
  };

  const handleSelectChat = (id: string, username: string) => {
    setSelectedChat({ id, username });
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

  const acceptedIncoming = useMemo(
    () =>
      connections
        .filter(
          (c) =>
            c.status === "accepted" && c.type === "incoming" && isNotSelf(c),
        )
        .sort(newestFirst),
    [connections],
  );

  const acceptedOutgoing = useMemo(
    () =>
      connections
        .filter(
          (c) =>
            c.status === "accepted" && c.type === "outgoing" && isNotSelf(c),
        )
        .sort(newestFirst),
    [connections],
  );

  const acceptedToRender = useMemo(() => {
    if (acceptedTab === "incoming") return acceptedIncoming;

    if (acceptedTab === "outgoing") return acceptedOutgoing;
    return acceptedRequests;
  }, [acceptedTab, acceptedIncoming, acceptedOutgoing, acceptedRequests]);

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

      // Find the OTHER person's ID (the person we are chatting with)
      const chatPartnerId = isOutgoing ? each.toUserId : each.fromUserId;

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
          onMessage={() => handleSelectChat(chatPartnerId, username)}
        />
      );
    });
  };

  return (
    <div className="container mx-auto px-4 py-10 h-full flex flex-col min-h-0">
      <section className="flex flex-col flex-1 min-h-0">
        <div className="mx-auto max-w-6xl rounded-2xl bg-[#E6D9B5] border border-[#B39474] p-6">
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
                    className={`tab flex-1 ${activeTab === "declined" ? "tab-active" : ""}`}
                    onClick={() => setActiveTab("declined")}
                  >
                    Declined ({declinedArchive.length})
                  </button>
                </div>

                <div className="mt-4">
                  {activeTab === "pending" && (
                    <h2 className="text-lg font-semibold">Pending requests</h2>
                  )}
                  {activeTab === "sent" && (
                    <h2 className="text-lg font-semibold">Sent requests</h2>
                  )}
                  {activeTab === "declined" && (
                    <h2 className="text-lg font-semibold">Declined</h2>
                  )}
                </div>

                <div className="mt-3 flex-1 min-h-0 overflow-y-auto pr-1">
                  <div className="space-y-4">
                    {activeTab === "pending" && renderList(pendingIncoming)}
                    {activeTab === "sent" && renderList(sentPending)}
                    {activeTab === "declined" && renderList(declinedArchive)}
                  </div>
                </div>
              </div>
            </div>

            {/* ACCEPTED */}
            <div className="card bg-base-100 shadow border h-full min-h-0">
              <div className="card-body p-4 h-full min-h-0 flex flex-col justify-start">
                <div role="tablist" className="tabs tabs-boxed w-full">
                  <button
                    type="button"
                    className={`tab flex-1 ${acceptedTab === "all" ? "tab-active" : ""}`}
                    onClick={() => setAcceptedTab("all")}
                  >
                    All ({acceptedRequests.length})
                  </button>
                  <button
                    type="button"
                    role="tab"
                    className={`tab flex-1 ${acceptedTab === "incoming" ? "tab-active" : ""}`}
                    onClick={() => setAcceptedTab("incoming")}
                  >
                    Incoming ({acceptedIncoming.length})
                  </button>
                  <button
                    type="button"
                    role="tab"
                    className={`tab flex-1 ${acceptedTab === "outgoing" ? "tab-active" : ""}`}
                    onClick={() => setAcceptedTab("outgoing")}
                  >
                    Outgoing ({acceptedOutgoing.length})
                  </button>
                </div>
                <h2 className="text-lg font-semibold">Accepted requests</h2>

                <div className="mt-3 flex-1 min-h-0 overflow-y-auto pr-1">
                  <div className="space-y-4">
                    {renderList(acceptedToRender)}
                  </div>
                </div>
              </div>
            </div>

            {/* CHAT */}
            <div className="card bg-base-100 shadow border h-full min-h-0">
              <div className="card-body p-4 h-full min-h-0 flex flex-col">
                {selectedChat ? (
                  <div className="flex flex-col h-full">
                    {/* Chat Header */}
                    <div className="flex items-center justify-between border-b pb-2 mb-4">
                      <h2 className="text-lg font-bold">
                        Chat with {selectedChat.username}
                      </h2>
                      <button
                        className="btn btn-ghost btn-xs"
                        onClick={() => setSelectedChat(null)}
                      >
                        Close
                      </button>
                    </div>
                    {/* The Actual Chat Window */}{" "}
                    {/* // length of that chat window */}
                    <div className="h-[calc(100vh-100px)]">
                      <ChatWindow recipientId={selectedChat.id} />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-center opacity-60">
                    <div>
                      <div className="text-xl font-semibold">
                        Messaging Window
                      </div>
                      <div className="mt-1 text-sm">
                        Click "Message" on an accepted contact to start
                        chatting.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
