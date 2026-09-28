/**
 * Reverse Geocoding Utility for Voltix Nepal
 * Translates GPS coordinates (lat, lng) to human-readable Nepal place names, areas, and addresses.
 */

export interface ReverseGeocodeResult {
  placeName: string;
  area: string;
  city: string;
  fullAddress: string;
  road?: string;
  postcode?: string;
}

export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<ReverseGeocodeResult> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
    const response = await fetch(url, {
      headers: {
        'Accept-Language': 'en',
      },
    });

    if (!response.ok) {
      throw new Error(`Reverse geocode failed with HTTP ${response.status}`);
    }

    const data = await response.json();
    const addr = data.address || {};

    // Determine the most specific neighborhood or place name
    const specificPlace =
      addr.suburb ||
      addr.neighbourhood ||
      addr.residential ||
      addr.quarter ||
      addr.village ||
      addr.hamlet ||
      addr.road ||
      addr.amenity ||
      addr.shop ||
      addr.building ||
      '';

    const city =
      addr.city ||
      addr.town ||
      addr.municipality ||
      addr.county ||
      'Kathmandu';

    const road = addr.road || addr.pedestrian || '';

    // Create a concise place title (e.g. "Sundhara, Kathmandu")
    let placeName = '';
    if (specificPlace && specificPlace !== city) {
      placeName = `${specificPlace}, ${city}`;
    } else if (road) {
      placeName = `${road}, ${city}`;
    } else {
      placeName = `${city}`;
    }

    // Clean full address for street field
    let fullAddress = data.display_name || placeName;
    // Remove trailing country/postcode redundancy for clearer input if needed
    const parts = fullAddress.split(',').map((p: string) => p.trim());
    if (parts.length > 4) {
      // Pick key street/neighborhood parts
      fullAddress = parts.slice(0, 4).join(', ');
    }

    return {
      placeName,
      area: specificPlace || road || 'Kathmandu',
      city,
      fullAddress,
      road,
      postcode: addr.postcode,
    };
  } catch (error) {
    console.warn('Reverse geocoding warning:', error);
    // Fallback based on coordinates within Kathmandu Valley bounds
    let detectedArea = 'Kathmandu Valley';
    if (lat >= 27.68 && lat <= 27.73 && lng >= 85.29 && lng <= 85.34) {
      detectedArea = 'Central Kathmandu';
    } else if (lat >= 27.65 && lat < 27.68 && lng >= 85.29 && lng <= 85.34) {
      detectedArea = 'Lalitpur (Patan)';
    } else if (lng > 85.36) {
      detectedArea = 'Bhaktapur';
    }

    return {
      placeName: `${detectedArea} (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
      area: detectedArea,
      city: 'Kathmandu',
      fullAddress: `${detectedArea}, GPS: ${lat.toFixed(5)}, ${lng.toFixed(5)}`,
    };
  }
}
