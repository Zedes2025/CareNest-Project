import { useEffect, useState } from "react";
import { NotificationCard } from "../components/contactcomponents/notifCard";
import { getConnection } from "../data/connection";
import { useLoaderData } from "react-router";

export async function connectionLoader({ params }: { params: { id: string } }) {
  try {
    const id = params.id;
    if (!id) return { user: null, error: "Missing id." };

    const user = await getConnection(id);
    return { user, error: null };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to load profile.";
    return { user: null, error: msg };
  }
}

export const ConnectionsPage = () => {
  const { user, error } = useLoaderData() as { user: any[] | null; error: string | null };

  if (error) return <p className="text-red-500">{error}</p>;
  if (!user) return <p>Loading...</p>;

  return (
    <div className="container mx-auto px-4 py-10">
      <section>
        <h1 className="text-2xl font-semibold">Notifications</h1>
        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-2">Pending requests</h2>

          {user.length > 0 ? (
            user.map((each) => (
              <NotificationCard
                key={each._id}
                // String interpolation to join names
                username={`${each.firstName} ${each.lastName}`}
                avatarUrl={each.profilePicture}
                mode="pending"
                status={each.status}
              />
            ))
          ) : (
            <p>No pending connection request</p>
          )}
        </div>
      </section>
    </div>
  );
};

// export const ContactPage = () => {
//   const [pending, setPending] = useState<Notification[]>([]);
//   const [previous, setPrevious] = useState<Notification[]>([]);

//   useEffect(() => {
//     /*
// to get data, we need to loop on fetch reqs with pending status and toUser==current user,
// these are the date we need for the pending notifications.
// when the user clicks on accept or decline, we need to send a fetch req to update the status of the request, and then we need to
//  move the notification from pending to previous with the action (accept or decline) that the user took.
// */

//     const data = [
//       {
//         id: "1",
//         username: "John Doe",
//         avatarUrl: "https://img.daisyui.com/images/profile/demo/yellingcat@192.webp",
//         status: "pending",
//       },
//       {
//         id: "2",
//         username: "Jane Smith",
//         avatarUrl: "https://img.daisyui.com/images/profile/demo/yellingcat@192.webp",
//         status: "pending",
//       },
//     ];
//     setPending(data);
//   }, []);

//   const handleAction = (id: string, action: string) => {
//     const card = pending.find((n) => n.id === id);

//     if (!card) return;

//     setPending(pending.filter((n) => n.id !== id));

//     setPrevious([{ ...card, status: action }, ...previous]);
//   };
