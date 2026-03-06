import { Link, useLoaderData } from "react-router";
import { getPublicUserById, type ApiUserProfile } from "../data";
import { ProfileDetailCard } from "../components/ui/ProfileDetailCard";
import { useState } from "react";
import { sendConnectionRequest } from "../data/connection";
type DetailsLoaderData = { user: ApiUserProfile | null; error?: string };

export async function detailsLoader({ params }: { params: { id?: string } }): Promise<DetailsLoaderData> {
  try {
    const id = params.id;
    if (!id) return { user: null, error: "Missing id." };
    const user = await getPublicUserById(id);
    return { user };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to load profile.";
    return { user: null, error: msg };
  }
}

export const DetailsPage = () => {
  const { user, error } = useLoaderData() as DetailsLoaderData;
  const [isSending, setIsSending] = useState(false);

  const handleConnect = async () => {
    if (!user?._id) return;

    setIsSending(true);
    try {
      // 1. Call the API function
      await sendConnectionRequest(user._id, user.profilePicture ?? "");
      // 2. Only if successful, show the modal
      const modal = document.getElementById("my_modal_5") as HTMLDialogElement;
      modal?.showModal();
    } catch (err) {
      console.error("Failed to connect:", err);
      alert("Failed to send connection request.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mx-auto w-full max-w-3xl">
        {error && (
          <div className="alert alert-error mb-6" role="alert">
            <span>{error}</span>
          </div>
        )}

        {user && (
          <ProfileDetailCard user={user}>
            <Link to="/home" className="btn btn-outline">
              Back
            </Link>
            <button className="btn bg-blue-800 text-white" disabled={isSending} onClick={handleConnect}>
              {isSending ? "Sending..." : "Connect"}
            </button>
            <dialog id="my_modal_5" className="modal modal-bottom sm:modal-middle">
              <div className="modal-box">
                <h3 className="font-bold text-center text-lg">Your Connection Request is sent to {user.firstName}</h3>
                <div className="modal-action">
                  <form method="dialog">
                    <button className="btn">Close</button>
                  </form>
                </div>
              </div>
            </dialog>
          </ProfileDetailCard>
        )}
      </div>
    </div>
  );
};
