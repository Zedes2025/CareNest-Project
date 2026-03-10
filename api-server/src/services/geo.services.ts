interface Address {
  //interface for user address
  hausnr: string;
  street: string;
  plz: string;
  city: string;
  country: string;
}

interface GeoapifyResponse {
  // interface for geoapify geocoding API response
  features?: Array<{
    geometry: {
      coordinates: [number, number];
    };
  }>;
}
const GEOAPIFY_KEY = process.env.Geo_API_KEY;
if (!GEOAPIFY_KEY) throw new Error("Geoapify API key is missing");

export async function getCoordinatesFromAddress( //function to get lat/lng from address, using geoapify geocoding API
  addr: Address,
): Promise<{ lat: number; lon: number } | null> {
  const searchText = `${addr.street} ${addr.hausnr}, ${addr.plz} ${addr.city}, ${addr.country}`;

  try {
    const response = await fetch(
      // fetch from geoapify geocoding API
      `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(searchText)}&apiKey=${GEOAPIFY_KEY}`,
    );

    if (!response.ok)
      throw new Error("Network response from geopify was not ok");

    const data = (await response.json()) as GeoapifyResponse;

    if (
      data.features &&
      data.features.length > 0 &&
      data.features[0]?.geometry
    ) {
      const [lon, lat] = data.features[0].geometry.coordinates;

      return { lat, lon };
    }

    return null; // Address not found
  } catch (error) {
    console.error("Geocoding error:", error);

    return null;
  }
}

// using google map:
// import { Client } from "@googlemaps/google-maps-services-js";

// const mapsClient = new Client({}); // <- this is the client

// export async function getCoordinates(address: string) {
//   try {
//     const apiKey = process.env.GOOGLE_MAPS_API_KEY;
//     if (!apiKey) {
//       throw new Error("GOOGLE_MAPS_API_KEY environment variable is not set");
//     }

//     const response = await mapsClient.geocode({
//       params: {
//         address,
//         key: apiKey,
//       },
//     });

//     const location = response.data.results[0]?.geometry.location;

//     if (!location) throw new Error("Address not found");

//     return { lat: location.lat, lng: location.lng };
//   } catch (err) {
//     console.error("GeoService error:", err);
//     throw new Error("Failed to get coordinates");
//   }
// }
