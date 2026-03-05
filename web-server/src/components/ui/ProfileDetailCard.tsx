import type { PropsWithChildren } from "react";
import type { ApiUserProfile } from "../../data/users";
import { DAYS, SLOTS } from "../../profile/schedule";

type Props = PropsWithChildren<{
  user: ApiUserProfile;
}>;

function computeAge(birthday?: string | Date | null): number | null {
  if (!birthday) return null;
  const d = typeof birthday === "string" ? new Date(birthday) : birthday;
  if (Number.isNaN(d.getTime())) return null;

  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age -= 1;

  if (age < 0 || age > 130) return null;
  return age;
}

function availabilityMap(user: ApiUserProfile): Record<string, Set<string>> {
  const map: Record<string, Set<string>> = {};
  for (const d of DAYS) map[d.key] = new Set<string>();
  for (const entry of user.availability ?? []) {
    map[entry.day] = new Set(entry.slots ?? []);
  }
  return map;
}

export const ProfileDetailCard = ({ user, children }: Props) => {
  const hasImage = Boolean(user.profilePicture);
  const age = computeAge(user.birthday);
  const city = user.address?.city ?? null;
  const services = user.servicesOffered ?? [];
  const interests = user.interests ?? [];
  const avail = availabilityMap(user);

  return (
    <div className="card bg-base-100 shadow">
      <div className="card-body">
        <div className="flex flex-col items-center text-center">
          <div className="avatar">
            {hasImage ? (
              <div className="w-28 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                <img
                  src={user.profilePicture}
                  alt={`${user.firstName} ${user.lastName}`}
                />
              </div>
            ) : (
              <div className="placeholder w-28 rounded-full bg-base-200 ring ring-primary ring-offset-base-100 ring-offset-2 flex items-center justify-center">
                <span className="text-2xl font-semibold">
                  {(user.firstName?.[0] ?? "?").toUpperCase()}
                  {(user.lastName?.[0] ?? "?").toUpperCase()}
                </span>
              </div>
            )}
          </div>

          <h1 className="mt-4 text-2xl font-semibold">
            {user.firstName} {user.lastName}
            <span className="opacity-70">
              {" "}
              {age === null ? "(Age -)" : `(Age ${age})`}
            </span>
          </h1>

          <div className="mt-1 opacity-70">{city ? city : "City -"}</div>
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-semibold">About me</h2>
          <p className="mt-2 whitespace-pre-line opacity-80">
            {user.aboutMe ?? "No description provided."}
          </p>
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-semibold">Times available</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Day</th>
                  {SLOTS.map((s) => (
                    <th key={s.key}>{s.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DAYS.map((d) => (
                  <tr key={d.key}>
                    <td className="font-semibold">{d.label}</td>
                    {SLOTS.map((s) => {
                      const active = avail[d.key]?.has(s.key) ?? false;
                      return (
                        <td key={s.key}>
                          {active ? (
                            <span className="badge badge-primary badge-sm">
                              ✓
                            </span>
                          ) : (
                            <span className="opacity-40">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-semibold">Services</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {services.length ? (
              services.map((s) => (
                <span key={s} className="badge badge-outline">
                  {s}
                </span>
              ))
            ) : (
              <span className="opacity-60">No services listed</span>
            )}
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-semibold">Interests</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {interests.length ? (
              interests.map((i) => (
                <span key={i} className="badge badge-ghost">
                  {i}
                </span>
              ))
            ) : (
              <span className="opacity-60">No interests listed</span>
            )}
          </div>
        </div>

        <div className="card-actions mt-8 justify-between">{children}</div>
      </div>
    </div>
  );
};
