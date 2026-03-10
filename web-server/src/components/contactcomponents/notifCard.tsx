import { useState } from "react";
import { statusUpdate } from "../../data/connection";

interface NotificationCardProps {
  username: string;
  avatarUrl: string;
  id: string;
  initialStatus: string;
  onUpdate: (newStatus: string) => void;
}

export const NotificationCard = ({ username, avatarUrl, id, initialStatus, onUpdate }: NotificationCardProps) => {
  // // 1. Initialize local state with the status passed from parent
  // // const [status, setStatus] = useState(initialStatus);
  // const [status] = useState(initialStatus);

  // if (!id) return null;
  // const changeStatus = async (status: "accepted" | "declined") => {
  //   try {
  //     await statusUpdate(id, status);
  //     alert(`Request ${status} successfully!`);
  //   } catch (error) {
  //     console.error("Failed to update status:", error);
  //   }
  // };

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
            <div className="w-14 rounded-full">
              <img src={avatarUrl} alt={username} />
            </div>
          </div>
          <div>
            <h2 className="font-semibold">{username}</h2>
            <p className="text-sm text-gray-500">wants to connect with you</p>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          {initialStatus === "pending" ? (
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
