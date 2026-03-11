import { statusUpdate } from "../../data/connection";

interface NotificationCardProps {
  username: string;
  avatarUrl: string;
  id: string;
  initialStatus: string;
  onUpdate: (newStatus: string) => void;
  isOutgoing: boolean;
}

export const NotificationCard = ({ username, avatarUrl, id, initialStatus, onUpdate, isOutgoing }: NotificationCardProps) => {
  const changeStatus = async (newStatus: "accepted" | "declined") => {
    try {
      await statusUpdate(id, newStatus);
      onUpdate(newStatus); // Tell ContactPage to re-filter the list
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  return (
    <div className="card w-96 bg-base-100 shadow border mb-4">
      <div className="card-body p-4">
        <div className="flex items-center gap-4">
          <div className="avatar">
            {!isOutgoing && avatarUrl && (
              <div className="w-14 rounded-full">
                <img src={avatarUrl} alt={username} />
              </div>
            )}
          </div>
          <div>
            {/* <h2 className="font-semibold">{isOutgoing ? "You" : username}</h2>
            <p className="text-sm text-gray-500">{isOutgoing ? `sent a requests to ${username}` : "wants to connect with you"}</p>  </h2>*/}
            {isOutgoing ? "" : username}

            {/* Use a div or flex container instead of a <p> tag to keep it valid */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              {isOutgoing ? (
                <>
                  <span>You sent a request to</span>
                  <span className="font-medium text-gray-800">{username}</span>
                  {/* The small inline image/avatar */}
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
              <button className="btn btn-sm btn-neutral rounded-xl" onClick={() => changeStatus("accepted")}>
                Accept
              </button>
              <button className="btn btn-sm btn-outline rounded-xl" onClick={() => changeStatus("declined")}>
                Decline
              </button>
            </>
          ) : (
            // 3. This shows instead of buttons once the state changes
            <span className="font-bold capitalize text-primary">{initialStatus}</span>
          )}
        </div>
      </div>
    </div>
  );
};
