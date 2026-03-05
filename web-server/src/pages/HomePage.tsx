import { useEffect, useMemo, useState } from "react";
import { useLoaderData } from "react-router";
import { getPublicUsers, type ApiUserProfile } from "../data";
import { DAYS, SLOTS } from "../profile/schedule";
import { SERVICE_OPTIONS } from "../profile/profileOptions";
import { ProfileCard } from "../components/ui/ProfileCard";

type HomeLoaderData = { users: ApiUserProfile[]; error?: string };

export async function homeLoader(): Promise<HomeLoaderData> {
  try {
    const users = await getPublicUsers(); // uses auth header if enabled in data/users.ts
    return { users };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to load users.";
    return { users: [], error: msg };
  }
}

function matchesTime(user: ApiUserProfile, value: string): boolean {
  if (!value) return true;
  const [day, slot] = value.split(":");
  if (!day || !slot) return true;

  const entry = (user.availability ?? []).find((a) => a.day === day);
  return Boolean(entry?.slots?.includes(slot));
}

function matchesService(user: ApiUserProfile, service: string): boolean {
  if (!service) return true;
  return (user.servicesOffered ?? []).includes(service);
}

export const HomePage = () => {
  const data = useLoaderData() as HomeLoaderData;

  const [cityQuery, setCityQuery] = useState("");
  const [timeFilter, setTimeFilter] = useState("");
  const [serviceFilter, setServiceFilter] = useState("");

  const [page, setPage] = useState(1);
  const PAGE_SIZE = 25;

  const timeOptions = useMemo(() => {
    const opts: { value: string; label: string }[] = [
      { value: "", label: "Any time" },
    ];
    for (const d of DAYS) {
      for (const s of SLOTS) {
        opts.push({
          value: `${d.key}:${s.key}`,
          label: `${d.label} ${s.label}`,
        });
      }
    }
    return opts;
  }, []);

  const cityOptions = useMemo(() => {
    const set = new Set<string>();
    for (const u of data.users ?? []) {
      if (u.city) set.add(u.city);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [data.users]);

  const matchingCityOptions = useMemo(() => {
    const q = cityQuery.trim().toLowerCase();
    if (!q) return cityOptions;
    return cityOptions.filter((c) => c.toLowerCase().includes(q));
  }, [cityOptions, cityQuery]);

  const filtered = useMemo(() => {
    return (data.users ?? [])
      .filter((u) => {
        const q = cityQuery.trim().toLowerCase();
        if (!q) return true;
        return (u.city ?? "").toLowerCase().includes(q);
      })
      .filter((u) => matchesTime(u, timeFilter))
      .filter((u) => matchesService(u, serviceFilter));
  }, [data.users, cityQuery, timeFilter, serviceFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  useEffect(() => {
    setPage(1);
  }, [cityQuery, timeFilter, serviceFilter]);

  const pageUsers = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const canPrev = page > 1;
  const canNext = page < pageCount;

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-center text-3xl font-semibold">Placeholdertitle</h1>
        <p className="mt-3 text-center opacity-70">Placeholdertext</p>

        {data.error && (
          <div className="alert alert-error mt-6" role="alert">
            <span>{data.error}</span>
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* City filter with suggestions */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">City</span>
            </label>
            <input
              className="input input-bordered w-full"
              value={cityQuery}
              onChange={(e) => setCityQuery(e.target.value)}
              placeholder="Type a city..."
              list="city-suggestions"
            />
            <datalist id="city-suggestions">
              {matchingCityOptions.slice(0, 20).map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>

          {/* Times available */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Times available</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
            >
              {timeOptions.map((o) => (
                <option key={o.value || "any"} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {/* Services */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Services</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
            >
              <option value="">Any service</option>
              {SERVICE_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between gap-4">
          <div className="opacity-70">
            Showing <span className="font-semibold">{pageUsers.length}</span> of{" "}
            <span className="font-semibold">{filtered.length}</span> results
          </div>

          <div className="join">
            <button
              className="btn join-item"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!canPrev}
              type="button"
            >
              Prev
            </button>
            <button
              className="btn join-item btn-ghost pointer-events-none"
              type="button"
            >
              Page {page} / {pageCount}
            </button>
            <button
              className="btn join-item"
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              disabled={!canNext}
              type="button"
            >
              Next
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {pageUsers.map((u) => (
            <ProfileCard key={u._id} user={u} />
          ))}
        </div>

        {filtered.length === 0 && !data.error && (
          <div className="mt-10 text-center opacity-70">
            No profiles match your filters.
          </div>
        )}
      </div>
    </div>
  );
};

// import { useEffect, useMemo, useState } from "react";
// import { useLoaderData } from "react-router";
// import { getPublicUsers, type ApiUserProfile } from "../data";
// import { ProfileCard } from "../components/ui/ProfileCard";

// type HomeLoaderData = { users: ApiUserProfile[]; error?: string };

// export async function homeLoader(): Promise<HomeLoaderData> {
//   try {
//     const users = await getPublicUsers();
//     return { users };
//   } catch (e) {
//     const msg = e instanceof Error ? e.message : "Failed to load users.";
//     return { users: [], error: msg };
//   }
// }

// function matchesTime(user: ApiUserProfile, value: string): boolean {
//   if (!value) return true;
//   const [day, slot] = value.split(":");
//   if (!day || !slot) return true;

//   const entry = (user.availability ?? []).find((a) => a.day === day);
//   return Boolean(entry?.slots?.includes(slot));
// }

// function matchesService(user: ApiUserProfile, service: string): boolean {
//   if (!service) return true;
//   return (user.servicesOffered ?? []).includes(service);
// }

// export const HomePage = () => {
//   const data = useLoaderData() as HomeLoaderData;

//   const [cityQuery, setCityQuery] = useState(""); // backend liefert city derzeit nicht
//   const [timeFilter, setTimeFilter] = useState("");
//   const [serviceFilter, setServiceFilter] = useState("");

//   const [page, setPage] = useState(1);
//   const PAGE_SIZE = 25;

//   const timeOptions = useMemo(() => {
//     const opts: { value: string; label: string }[] = [
//       { value: "", label: "Any time" },
//     ];
//     for (const d of DAYS) {
//       for (const s of SLOTS) {
//         opts.push({
//           value: `${d.key}:${s.key}`,
//           label: `${d.label} ${s.label}`,
//         });
//       }
//     }
//     return opts;
//   }, []);

//   const filtered = useMemo(() => {
//     // City filter ist aktuell nicht möglich -> wird ignoriert, UI bleibt disabled
//     return (data.users ?? [])
//       .filter((u) => matchesTime(u, timeFilter))
//       .filter((u) => matchesService(u, serviceFilter));
//   }, [data.users, timeFilter, serviceFilter]);

//   const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

//   useEffect(() => {
//     setPage(1);
//   }, [timeFilter, serviceFilter, cityQuery]);

//   const pageUsers = useMemo(() => {
//     const start = (page - 1) * PAGE_SIZE;
//     return filtered.slice(start, start + PAGE_SIZE);
//   }, [filtered, page]);

//   const canPrev = page > 1;
//   const canNext = page < pageCount;

//   return (
//     <div className="container mx-auto px-4 py-10">
//       <div className="mx-auto max-w-6xl">
//         <h1 className="text-center text-3xl font-semibold">Placeholdertitle</h1>
//         <p className="mt-3 text-center opacity-70">Placeholdertext</p>

//         {data.error && (
//           <div className="alert alert-error mt-6" role="alert">
//             <span>{data.error}</span>
//           </div>
//         )}

//         <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
//           {/* City filter (disabled until backend delivers city) */}
//           <div className="form-control">
//             <label className="label">
//               <span className="label-text">City</span>
//             </label>
//             <input
//               className="input input-bordered w-full"
//               value={cityQuery}
//               onChange={(e) => setCityQuery(e.target.value)}
//               placeholder="City (not available yet)"
//               disabled
//             />
//           </div>

//           {/* Times available */}
//           <div className="form-control">
//             <label className="label">
//               <span className="label-text">Times available</span>
//             </label>
//             <select
//               className="select select-bordered w-full"
//               value={timeFilter}
//               onChange={(e) => setTimeFilter(e.target.value)}
//             >
//               {timeOptions.map((o) => (
//                 <option key={o.value || "any"} value={o.value}>
//                   {o.label}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* Services */}
//           <div className="form-control">
//             <label className="label">
//               <span className="label-text">Services</span>
//             </label>
//             <select
//               className="select select-bordered w-full"
//               value={serviceFilter}
//               onChange={(e) => setServiceFilter(e.target.value)}
//             >
//               <option value="">Any service</option>
//               {SERVICE_OPTIONS.map((s) => (
//                 <option key={s} value={s}>
//                   {s}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>

//         <div className="mt-6 flex items-center justify-between gap-4">
//           <div className="opacity-70">
//             Showing <span className="font-semibold">{pageUsers.length}</span> of{" "}
//             <span className="font-semibold">{filtered.length}</span> results
//           </div>

//           <div className="join">
//             <button
//               className="btn join-item"
//               onClick={() => setPage((p) => Math.max(1, p - 1))}
//               disabled={!canPrev}
//               type="button"
//             >
//               Prev
//             </button>
//             <button
//               className="btn join-item btn-ghost pointer-events-none"
//               type="button"
//             >
//               Page {page} / {pageCount}
//             </button>
//             <button
//               className="btn join-item"
//               onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
//               disabled={!canNext}
//               type="button"
//             >
//               Next
//             </button>
//           </div>
//         </div>

//         <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
//           {pageUsers.map((u) => (
//             <ProfileCard key={u._id} user={u} />
//           ))}
//         </div>

//         {filtered.length === 0 && !data.error && (
//           <div className="mt-10 text-center opacity-70">
//             No profiles match your filters.
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };
