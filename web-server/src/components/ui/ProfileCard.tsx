import { Link, useLocation } from "react-router";
import type { ApiUserProfile } from "../../data/users";

type Props = {
  user: ApiUserProfile;
};

export const ProfileCard = ({ user }: Props) => {
  const location = useLocation();
  const services = user.servicesOffered ?? [];
  const servicesPreview = services.slice(0, 3);
  const extraCount = Math.max(0, services.length - servicesPreview.length);

  const hasImage = Boolean(user.profilePicture);

  return (
    <div className="card bg-base-100 shadow">
      <div className="card-body items-center text-center">
        <div className="avatar">
          {hasImage ? (
            <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
              <img
                src={user.profilePicture}
                alt={`${user.firstName} ${user.lastName}`}
              />
            </div>
          ) : (
            <div className="placeholder w-24 rounded-full bg-base-200 ring ring-primary ring-offset-base-100 ring-offset-2 flex items-center justify-center">
              <span className="text-xl font-semibold">
                {(user.firstName?.[0] ?? "?").toUpperCase()}
                {(user.lastName?.[0] ?? "?").toUpperCase()}
              </span>
            </div>
          )}
        </div>

        <h3 className="mt-3 text-lg font-semibold">
          {user.firstName} {user.lastName}
        </h3>

        <div className="mt-1 text-sm opacity-70">{user.city ?? "City -"}</div>

        <div className="mt-2 flex flex-wrap justify-center gap-2">
          {servicesPreview.map((s) => (
            <span key={s} className="badge badge-outline">
              {s}
            </span>
          ))}
          {extraCount > 0 && (
            <span className="badge badge-ghost">+{extraCount}</span>
          )}
          {services.length === 0 && (
            <span className="opacity-60 text-sm">No services listed</span>
          )}
        </div>

        <div className="card-actions mt-4 w-full justify-center">
          <Link
            to={`/details/${user._id}${location.search}`}
            className="btn btn-primary w-full"
          >
            View more
          </Link>
        </div>
      </div>
    </div>
  );
};
