import { useEffect, useMemo, useState } from "react";
import { useLoaderData } from "react-router";

import { getPublicUsers, type ApiUserProfile } from "../data";
import { DAYS, SLOTS } from "../profile/schedule";
import { SERVICE_OPTIONS } from "../profile/profileOptions";
import { ProfileCard } from "../components/ui/ProfileCard";
import { useAuth } from "../contexts/AuthContext";

import {
  loadHomeFilters,
  saveHomeFilters,
  clearHomeFilters,
  type HomeFiltersState,
} from "../utils/homeFiltersStorage";

type HomeLoaderData = { users: ApiUserProfile[]; error?: string };

export async function homeLoader(): Promise<HomeLoaderData> {
  try {
    const users = await getPublicUsers();
    return { users };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to load users.";
    return { users: [], error: msg };
  }
}

function matchesAvailability(
  user: ApiUserProfile,
  day: string,
  slot: string,
): boolean {
  const availability = user.availability ?? [];

  if (!day && !slot) return true;

  if (day && !slot) {
    const entry = availability.find((a) => a.day === day);
    return (entry?.slots?.length ?? 0) > 0;
  }

  if (!day && slot) {
    return availability.some((a) => (a.slots ?? []).includes(slot));
  }

  const entry = availability.find((a) => a.day === day);
  return Boolean(entry?.slots?.includes(slot));
}

function matchesService(user: ApiUserProfile, service: string): boolean {
  if (!service) return true;
  return (user.servicesOffered ?? []).includes(service);
}

export const HomePage = () => {
  const data = useLoaderData() as HomeLoaderData;
  const { user } = useAuth();
  const myId = user?._id;

  // Load initial filters once from localStorage
  const initial = useMemo(() => loadHomeFilters(), []);

  const [cityQuery, setCityQuery] = useState(initial?.cityQuery ?? "");
  const [dayFilter, setDayFilter] = useState(initial?.dayFilter ?? "");
  const [slotFilter, setSlotFilter] = useState(initial?.slotFilter ?? "");
  const [serviceFilter, setServiceFilter] = useState(
    initial?.serviceFilter ?? "",
  );
  const [page, setPage] = useState(initial?.page ?? 1);

  const PAGE_SIZE = 25;

  // Persist filters in localStorage on every change
  useEffect(() => {
    const state: HomeFiltersState = {
      cityQuery,
      dayFilter,
      slotFilter,
      serviceFilter,
      page,
    };
    saveHomeFilters(state);
  }, [cityQuery, dayFilter, slotFilter, serviceFilter, page]);

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
      .filter((u) => (myId ? u._id !== myId : true))
      .filter((u) => {
        const q = cityQuery.trim().toLowerCase();
        if (!q) return true;
        return (u.city ?? "").toLowerCase().includes(q);
      })
      .filter((u) => matchesAvailability(u, dayFilter, slotFilter))
      .filter((u) => matchesService(u, serviceFilter));
  }, [data.users, myId, cityQuery, dayFilter, slotFilter, serviceFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);

  const pageUsers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  const canPrev = currentPage > 1;
  const canNext = currentPage < pageCount;

  function resetFilters() {
    clearHomeFilters();
    setCityQuery("");
    setDayFilter("");
    setSlotFilter("");
    setServiceFilter("");
    setPage(1);
  }

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
          {/* City */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">City</span>
            </label>
            <input
              className="input input-bordered w-full"
              value={cityQuery}
              onChange={(e) => {
                setCityQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Type a city..."
              list="city-suggestions"
            />
            <datalist id="city-suggestions">
              {matchingCityOptions.slice(0, 20).map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>

          {/* Times available: two fields */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Times available</span>
            </label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <select
                className="select select-bordered w-full"
                value={dayFilter}
                onChange={(e) => {
                  setDayFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">Any day</option>
                {DAYS.map((d) => (
                  <option key={d.key} value={d.key}>
                    {d.label}
                  </option>
                ))}
              </select>

              <select
                className="select select-bordered w-full"
                value={slotFilter}
                onChange={(e) => {
                  setSlotFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">Any time</option>
                {SLOTS.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Services */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Services</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={serviceFilter}
              onChange={(e) => {
                setServiceFilter(e.target.value);
                setPage(1);
              }}
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

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="opacity-70">
            Showing <span className="font-semibold">{pageUsers.length}</span> of{" "}
            <span className="font-semibold">{filtered.length}</span> results
          </div>

          <div className="flex items-center gap-3">
            <button
              className="btn btn-outline"
              type="button"
              onClick={resetFilters}
            >
              Reset filters
            </button>

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
                Page {currentPage} / {pageCount}
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
