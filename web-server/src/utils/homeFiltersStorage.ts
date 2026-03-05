export type HomeFiltersState = {
  cityQuery: string;
  dayFilter: string;
  slotFilter: string;
  serviceFilter: string;
  page: number;
};

const KEY = "carenest.homeFilters.v1";

export function loadHomeFilters(): HomeFiltersState | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;

    const obj = JSON.parse(raw) as Partial<HomeFiltersState>;

    const page =
      typeof obj.page === "number" && Number.isFinite(obj.page) && obj.page >= 1
        ? Math.floor(obj.page)
        : 1;

    return {
      cityQuery: typeof obj.cityQuery === "string" ? obj.cityQuery : "",
      dayFilter: typeof obj.dayFilter === "string" ? obj.dayFilter : "",
      slotFilter: typeof obj.slotFilter === "string" ? obj.slotFilter : "",
      serviceFilter:
        typeof obj.serviceFilter === "string" ? obj.serviceFilter : "",
      page,
    };
  } catch {
    return null;
  }
}

export function saveHomeFilters(state: HomeFiltersState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // leave empty
  }
}

export function clearHomeFilters() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // leave empty
  }
}
