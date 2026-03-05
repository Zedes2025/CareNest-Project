import { Link, useLoaderData } from "react-router";
import { getPublicUserById, type ApiUserProfile } from "../data";
import { ProfileDetailCard } from "../components/ui/ProfileDetailCard";

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

            <Link to="/contact" className="btn btn-primary">
              Connect
            </Link>
          </ProfileDetailCard>
        )}
      </div>
    </div>
  );
};
