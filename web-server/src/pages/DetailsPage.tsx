import { Link, useLoaderData } from "react-router";
import { getPublicUserById, type ApiUserProfile } from "../data";
import { ProfileDetailCard } from "../components/ui/ProfileDetailCard";
import { useState } from "react";
import { sendConnectionRequest } from "../data/connection";
import { useMyCoordinates } from "../hooks/useMyCoordinates";
import { getDistanceKmRounded } from "../utils/distance";

type DetailsLoaderData = { user: ApiUserProfile | null; error?: string };

export async function detailsLoader({
  params,
}: {
  params: { id?: string };
}): Promise<DetailsLoaderData> {
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
  const myCoords = useMyCoordinates();

  const otherLat = user?.latitude ?? null;
  const otherLon = user?.longitude ?? null;

  const distanceKm =
    user &&
    myCoords &&
    typeof otherLat === "number" &&
    typeof otherLon === "number"
      ? getDistanceKmRounded(myCoords.lat, myCoords.lon, otherLat, otherLon)
      : null;

  const handleConnect = async () => {
    if (!user?._id) return;
    setIsSending(true);
    try {
      // 1. Call the API function
      await sendConnectionRequest(user._id);
      // 2. Only if successful, show the modal
      const modal = document.getElementById("my_modal_5") as HTMLDialogElement;
      modal?.showModal();
    } catch (error) {
      const msg =
        error instanceof Error
          ? error.message
          : "Failed to send connection request.";
      alert(msg);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mx-auto max-w-4xl rounded-2xl bg-[#E6D9B5] border border-[#B39474] p-12">
        <div className="mx-auto w-full max-w-3xl">
          {error && (
            <div className="alert alert-error mb-6" role="alert">
              <span>{error}</span>
            </div>
          )}

          {user && (
            <ProfileDetailCard user={user} distanceKm={distanceKm}>
              <Link to="/home" className="btn btn-outline">
                Back
              </Link>
              <button
                className="btn btn-primary"
                disabled={isSending}
                onClick={handleConnect}
              >
                {isSending ? "Sent" : "Connect"}
              </button>
              <dialog
                id="my_modal_5"
                className="modal modal-bottom sm:modal-middle"
              >
                <div className="modal-box">
                  <h3 className="font-bold text-center text-lg">
                    Your Connection Request is sent to {user.firstName}
                  </h3>
                  <div className="modal-action">
                    <form method="dialog">
                      <button className="btn btn-primary">Close</button>
                    </form>
                  </div>
                </div>
              </dialog>
            </ProfileDetailCard>
          )}
        </div>
      </div>
    </div>
  );
};
