function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

export function getDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// anonymisiert: ganze km, nie 0 km anzeigen
export function getDistanceKmRounded(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const km = getDistanceKm(lat1, lon1, lat2, lon2);
  return Math.max(1, Math.round(km));
}
