import { useEffect, useState } from "react";
import { NotificationCard } from "../components/contactcomponents/notifCard";

export const ContactPage = () => {
  const [pending, setPending] = useState([]);
  const [previous, setPrevious] = useState([]);

  useEffect(() => {
    /*
to get data, we need to loop on fetch reqs with pending status and toUser==current user, 
these are the date we need for the pending notifications. 
when the user clicks on accept or decline, we need to send a fetch req to update the status of the request, and then we need to
 move the notification from pending to previous with the action (accept or decline) that the user took.
*/

    const data = [
      {
        id: 1,
        username: "John Doe",
        avatarUrl:
          "https://img.daisyui.com/images/profile/demo/yellingcat@192.webp",
      },
      {
        id: 2,
        username: "Jane Smith",
        avatarUrl:
          "https://img.daisyui.com/images/profile/demo/yellingcat@192.webp",
      },
    ];
    setPending(data);
  }, []);

  const handleAction = (id, action) => {
    const card = pending.find((n) => n.id === id);
    if (!card) return;

    if (action === "accept" || action === "decline") {
      // remove from pending
      setPending(pending.filter((n) => n.id !== id));
      // add to previous
      setPrevious([{ ...card, action }, ...previous]);
    }
    if (action === "view") {
    }
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <section>
        <h1 className="text-2xl font-semibold">Notifications</h1>

        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-2">Pending requests</h2>
          {pending.length > 0 ? (
            pending.map((notif) => (
              <NotificationCard
                key={notif.id}
                username={notif.username}
                avatarUrl={notif.avatarUrl}
                mode="pending"
                onAction={(action) => handleAction(notif.id, action)}
              />
            ))
          ) : (
            <p>No pending requests</p>
          )}
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Previous Responses</h2>
          {previous.length > 0 ? (
            previous.map((notif) => (
              <NotificationCard
                key={notif.id}
                username={notif.username}
                avatarUrl={notif.avatarUrl}
                mode="previous"
                onAction={(action) => handleAction(notif.id, action)}
              />
            ))
          ) : (
            <p>No previous responses</p>
          )}
        </div>
      </section>
    </div>
  );
};
