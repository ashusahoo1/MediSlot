import { ApiError } from "./ApiError.js";
// import dotenv from "dotenv";
// dotenv.config();

export const getCoordinatesFromAddress = async (address) => {
  try {
    const {
      name = "",
      street = "",
      city = "",
      state = "",
      country = "",
      postcode = ""
    } = address;

    if (!process.env.GEOAPIFY_API_KEY) {
      throw new ApiError(500, "API key not found in environment variables");
    }

    // Combine all parts into a single search text
    const fullAddress = `${name} ${street} ${city} ${state} ${postcode} ${country}`;
    
    // Step 1: Get coordinates from address
    const geoUrl = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(fullAddress)}&limit=1&format=json&apiKey=${process.env.GEOAPIFY_API_KEY}`;
    const geoResponse = await fetch(geoUrl);
    const geoData = await geoResponse.json();

    if (!geoData.results || geoData.results.length === 0) {
      throw new ApiError(500, "No location found");
    }

    const { lon, lat } = geoData.results[0];
    console.log("Coordinates of address:", lon, lat);

    // Step 2: Search healthcare hospitals within 5km radius of coordinates
    const radius = 5000; // in meters
    const placesUrl = `https://api.geoapify.com/v2/places?categories=healthcare.hospital&filter=circle:${lon},${lat},${radius}&limit=1&apiKey=${process.env.GEOAPIFY_API_KEY}`;
    const placesResponse = await fetch(placesUrl);
    const placesData = await placesResponse.json();
    console.log(placesUrl);

    if (!placesData.features || placesData.features.length === 0) {
      throw new ApiError(500, "No hospitals found nearby");
    }

    // Extract coordinates of first hospital
    const [hospitalLon, hospitalLat] = placesData.features[0].geometry.coordinates;
    return { lon: hospitalLon, lat: hospitalLat };

  } catch (error) {
    console.log("err:", error.message);
    return null;
  }
};

// const addressk = {
//   name: "sum ultimate hospital",
//   street: "kalinga nagar",
//   city: "bhubaneswar",
//   state: "odisha",
//   country: "india",
//   postcode: "751003"
// };

// (async () => {
//   const hospitalCoords = await getCoordinatesFromAddress(addressk);
//   console.log("First nearby hospital coordinates:", hospitalCoords);
// })();
