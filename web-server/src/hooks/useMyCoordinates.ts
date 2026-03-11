import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getMyProfileById } from "../data/users";

type Coords = { lat: number; lon: number };

let cached: { userId: string; coords: Coords } | null = null;

export function useMyCoordinates() {
  const { signedIn, user } = useAuth();
  const [coords, setCoords] = useState<Coords | null>(null);

  useEffect(() => {
    if (!signedIn || !user?._id) return;

    if (cached?.userId === user._id) {
      setCoords(cached.coords);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const me = await getMyProfileById(user._id);
        const lat = me.address?.latitude ?? null;
        const lon = me.address?.longitude ?? null;

        if (typeof lat === "number" && typeof lon === "number") {
          const c = { lat, lon };
          cached = { userId: user._id, coords: c };
          if (!cancelled) setCoords(c);
        } else {
          if (!cancelled) setCoords(null);
        }
      } catch {
        if (!cancelled) setCoords(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [signedIn, user?._id]);

  return coords;
}
