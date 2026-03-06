import { Link } from "react-router";
import type { ApiUserProfile } from "../../data/users";

type Props = {
  user: ApiUserProfile;
};

export const ProfileCard = ({ user }: Props) => {
  const services = user.servicesOffered ?? [];
  const servicesPreview = services.slice(0, 3);
  const extraCount = Math.max(0, services.length - servicesPreview.length);
  const hasImage = Boolean(user.profilePicture);

  return (
    <div className="card bg-base-100 shadow h-full">
      <div className="card-body items-center text-center gap-3">
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

        <h3 className="text-lg font-semibold leading-tight min-h-13 line-clamp-2">
          {user.firstName} {user.lastName}
        </h3>

        <div className="text-sm opacity-70">{user.city ?? "City -"}</div>

        <div className="flex flex-wrap justify-center gap-2 min-h-18 content-start">
          {services.length ? (
            <>
              {servicesPreview.map((s) => (
                <span key={s} className="badge badge-outline">
                  {s}
                </span>
              ))}
              {extraCount > 0 && (
                <span className="badge badge-ghost">+{extraCount}</span>
              )}
            </>
          ) : (
            <span className="opacity-60 text-sm">No services listed</span>
          )}
        </div>

        <div className="card-actions mt-auto w-full justify-center">
          <Link to={`/details/${user._id}`} className="btn btn-primary w-full">
            View more
          </Link>
        </div>
      </div>
    </div>
  );
};
