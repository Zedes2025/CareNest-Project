interface NotificationCardProps {
  username: string;
  avatarUrl: string;
  mode?: "pending" | "previous";
  status: ConnectionStatus;
  // 2. Add the onAction callback to the interface
  onAction?: (action: "accept" | "decline") => void;
}

export const NotificationCard = ({ username, avatarUrl, mode = "pending", status, onAction }: NotificationCardProps) => {
  // Helper to determine the button appearance
  const isAccepted = status === "accepted";

  return (
    <div className="card w-96 bg-base-100 card-xs shadow-sm border mb-4">
      <div className="card-body p-4">
        <h2 className="card-title mb-2 text-lg">{username}</h2>

        <div className="flex items-center gap-4 mb-3">
          <div className="avatar">
            <div className="w-16 rounded-full">
              <img src={avatarUrl} alt={username} />
            </div>
          </div>

          <p className="flex-1 text-sm">{mode === "pending" ? `${username} wants to connect with you!` : `You responded to ${username}`}</p>
        </div>

        <div className="flex justify-end gap-2">
          {mode === "pending" ? (
            <>
              <button onClick={() => onAction?.("accept")} className="btn btn-sm btn-neutral rounded-xl">
                Accept
              </button>
              <button onClick={() => onAction?.("decline")} className="btn btn-sm rounded-xl">
                Decline
              </button>
            </>
          ) : (
            <button disabled className={`btn btn-sm rounded-xl ${isAccepted ? "btn-neutral" : "btn-outline"}`}>
              {isAccepted ? "Approved" : "Declined"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
