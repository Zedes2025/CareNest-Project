import { statusUpdate } from "../../data/connection";

interface NotificationCardProps {
  username: string;
  avatarUrl: string;
  id: string;
  initialStatus: string;
  onUpdate: (newStatus: string) => void;
  isOutgoing: boolean;
}

export const NotificationCard = ({
  username,
  avatarUrl,
  id,
  initialStatus,
  onUpdate,
  isOutgoing,
}: NotificationCardProps) => {
  const changeStatus = async (newStatus: "accepted" | "declined") => {
    try {
      await statusUpdate(id, newStatus);
      onUpdate(newStatus);
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const isAccepted = initialStatus === "accepted";
  const requestLabel = isOutgoing ? "Outgoing request" : "Incoming request";

  // --- Accepted layout (used in "Accepted requests" column)
  if (isAccepted) {
    return (
      <div className="card w-full bg-base-100 shadow border">
        <div className="card-body p-4">
          {/* Top: avatar + name */}
          <div className="flex items-center gap-3 min-w-0">
            {avatarUrl ? (
              <div className="avatar">
                <div className="w-12 rounded-full">
                  <img src={avatarUrl} alt={username} />
                </div>
              </div>
            ) : (
              <div className="avatar placeholder">
                <div className="w-12 rounded-full bg-base-200" />
              </div>
            )}

            <div className="min-w-0">
              <div className="font-medium truncate">{username}</div>
            </div>
          </div>

          {/* Bottom: left label + message button */}
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm opacity-70">{requestLabel}</span>

            <button
              type="button"
              className="btn btn-sm btn-outline rounded-xl transition-colors hover:text-blue-50 hover:bg-blue-800"
            >
              Message
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Default layout (Pending / Sent / Declined etc.)
  return (
    <div className="card w-full bg-base-100 shadow border">
      <div className="card-body p-4">
        <div className="flex items-center gap-4">
          <div className="avatar">
            {!isOutgoing && avatarUrl && (
              <div className="w-14 rounded-full">
                <img src={avatarUrl} alt={username} />
              </div>
            )}
          </div>

          <div className="min-w-0">
            {!isOutgoing && (
              <div className="font-medium truncate">{username}</div>
            )}

            <div className="flex items-center gap-2 text-sm text-gray-500">
              {isOutgoing ? (
                <>
                  <span>
                    <b>You</b> sent a request to
                  </span>
                  <span className="font-medium text-gray-800 truncate">
                    {username}
                  </span>
                  <div className="avatar">
                    <div className="w-14 rounded-full">
                      <img src={avatarUrl} alt={username} />
                    </div>
                  </div>
                </>
              ) : (
                "Wants to connect with you"
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          {initialStatus === "pending" && !isOutgoing ? (
            <>
              <button
                className="btn btn-sm btn-neutral rounded-xl"
                onClick={() => changeStatus("accepted")}
              >
                Accept
              </button>
              <button
                className="btn btn-sm btn-outline rounded-xl"
                onClick={() => changeStatus("declined")}
              >
                Decline
              </button>
            </>
          ) : (
            <span className="font-bold capitalize text-primary">
              {initialStatus}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
