import { 
  GeoCoordinates, 
  ReverseGeocodeResult, 
  DistanceMatrixTravelEstimate, 
  DistanceMatrixMultiMode, 
  TravelMode,
  UserProfile 
} from '../types/dating';

class LocationService {
  private cachedLocation: GeoCoordinates | null = null;
  private cachedReverseGeocode: ReverseGeocodeResult | null = null;
  private travelCache: Map<string, DistanceMatrixMultiMode> = new Map();

  /**
   * Acquire live user location via HTML5 Geolocation with fallback to server-side Google Geolocation API
   */
  async getCurrentLocation(options?: { enableHighAccuracy?: boolean; timeout?: number }): Promise<GeoCoordinates> {
    const highAccuracy = options?.enableHighAccuracy ?? true;
    const timeoutMs = options?.timeout ?? 8000;

    return new Promise((resolve) => {
      if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const coords: GeoCoordinates = {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              accuracy: pos.coords.accuracy,
              source: 'gps',
            };
            this.cachedLocation = coords;
            resolve(coords);
          },
          async (err) => {
            console.warn('Browser geolocation failed or was denied, falling back to Google Geolocation API:', err.message);
            const serverCoords = await this.fetchServerGeolocation();
            this.cachedLocation = serverCoords;
            resolve(serverCoords);
          },
          { enableHighAccuracy: highAccuracy, timeout: timeoutMs, maximumAge: 60000 }
        );
      } else {
        this.fetchServerGeolocation().then((serverCoords) => {
          this.cachedLocation = serverCoords;
          resolve(serverCoords);
        });
      }
    });
  }

  /**
   * Call server-side Google Geolocation API
   */
  async fetchServerGeolocation(): Promise<GeoCoordinates> {
    try {
      const res = await fetch('/api/geolocation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ considerIp: true }),
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      return {
        lat: data.location?.lat ?? 37.7749,
        lng: data.location?.lng ?? -122.4194,
        accuracy: data.accuracy ?? 30,
        source: data.source || 'google-geolocation',
      };
    } catch (e) {
      console.warn('Server geolocation proxy error:', e);
      return {
        lat: 37.7749,
        lng: -122.4194,
        accuracy: 50,
        source: 'fallback',
      };
    }
  }

  /**
   * Reverse geocode coordinates to get structured address, city, neighborhood, and place name
   */
  async reverseGeocode(lat: number, lng: number): Promise<ReverseGeocodeResult> {
    try {
      const res = await fetch(`/api/geocode/reverse?lat=${lat}&lng=${lng}`);
      if (!res.ok) throw new Error(`Reverse geocode failed with status ${res.status}`);
      const data = (await res.json()) as ReverseGeocodeResult;
      this.cachedReverseGeocode = data;
      return data;
    } catch (err) {
      console.warn('Reverse geocoding error:', err);
      return {
        formattedAddress: `${lat.toFixed(4)}, ${lng.toFixed(4)}, San Francisco, CA`,
        displayName: 'San Francisco, CA',
        city: 'San Francisco',
        state: 'CA',
        country: 'USA',
        source: 'fallback' as any,
      };
    }
  }

  /**
   * Compute Distance Matrix using Google Routes API backend
   */
  async computeDistanceMatrix(
    origins: { lat: number; lng: number }[],
    destinations: { lat: number; lng: number }[],
    travelMode: TravelMode = 'DRIVE'
  ): Promise<DistanceMatrixTravelEstimate[]> {
    try {
      const res = await fetch('/api/routes/distance-matrix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ origins, destinations, travelMode }),
      });
      if (!res.ok) throw new Error(`Distance matrix request failed with status ${res.status}`);
      const data = await res.json();
      return data.elements || [];
    } catch (err) {
      console.warn('Compute distance matrix failed:', err);
      return [];
    }
  }

  /**
   * Get Driving, Walking, and Transit travel estimates in a single batch
   */
  async getMultiModeTravel(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number }
  ): Promise<DistanceMatrixMultiMode> {
    const key = `${origin.lat.toFixed(4)},${origin.lng.toFixed(4)}->${destination.lat.toFixed(4)},${destination.lng.toFixed(4)}`;
    if (this.travelCache.has(key)) {
      return this.travelCache.get(key)!;
    }

    try {
      const res = await fetch('/api/routes/multi-mode-travel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ origin, destination }),
      });
      if (!res.ok) throw new Error(`Multi-mode travel failed with status ${res.status}`);
      const data = (await res.json()) as DistanceMatrixMultiMode;
      this.travelCache.set(key, data);
      return data;
    } catch (err) {
      console.warn('Multi-mode travel estimation error:', err);
      // Fallback rough estimate
      const fallback: DistanceMatrixMultiMode = {
        drive: {
          originLat: origin.lat,
          originLng: origin.lng,
          destLat: destination.lat,
          destLng: destination.lng,
          distanceMeters: 4500,
          distanceKm: 4.5,
          distanceMiles: 2.8,
          distanceText: '4.5 km (2.8 mi)',
          durationSeconds: 720,
          durationMinutes: 12,
          durationText: '12 mins',
          travelMode: 'DRIVE',
        },
        walk: {
          originLat: origin.lat,
          originLng: origin.lng,
          destLat: destination.lat,
          destLng: destination.lng,
          distanceMeters: 4500,
          distanceKm: 4.5,
          distanceMiles: 2.8,
          distanceText: '4.5 km (2.8 mi)',
          durationSeconds: 3300,
          durationMinutes: 55,
          durationText: '55 mins',
          travelMode: 'WALK',
        },
        transit: {
          originLat: origin.lat,
          originLng: origin.lng,
          destLat: destination.lat,
          destLng: destination.lng,
          distanceMeters: 4500,
          distanceKm: 4.5,
          distanceMiles: 2.8,
          distanceText: '4.5 km (2.8 mi)',
          durationSeconds: 1200,
          durationMinutes: 20,
          durationText: '20 mins',
          travelMode: 'TRANSIT',
        },
      };
      return fallback;
    }
  }

  /**
   * Recalculates distances and travel metrics for an array of profiles from the user's live coordinates
   */
  async updateProfilesWithMatrix(
    userLocation: GeoCoordinates,
    profiles: UserProfile[]
  ): Promise<UserProfile[]> {
    const validProfiles = profiles.filter((p) => p.coordinates?.lat && p.coordinates?.lng);
    if (validProfiles.length === 0) return profiles;

    const destinations = validProfiles.map((p) => ({
      lat: p.coordinates!.lat,
      lng: p.coordinates!.lng,
    }));

    try {
      const estimates = await this.computeDistanceMatrix(
        [{ lat: userLocation.lat, lng: userLocation.lng }],
        destinations,
        'DRIVE'
      );

      const estimateMap = new Map<number, DistanceMatrixTravelEstimate>();
      estimates.forEach((est, idx) => {
        estimateMap.set(est.destinationIndex ?? idx, est);
      });

      return profiles.map((profile) => {
        const pIdx = validProfiles.findIndex((vp) => vp.id === profile.id);
        if (pIdx !== -1 && estimateMap.has(pIdx)) {
          const est = estimateMap.get(pIdx)!;
          return {
            ...profile,
            distanceKm: est.distanceKm,
            locationCity: `${profile.locationCity.split(',')[0]}, ${est.distanceKm} km away (${est.durationText} drive)`,
          };
        }
        return profile;
      });
    } catch (e) {
      console.warn('Batch update profile distances failed:', e);
      return profiles;
    }
  }

  getCachedLocation(): GeoCoordinates | null {
    return this.cachedLocation;
  }

  getCachedReverseGeocode(): ReverseGeocodeResult | null {
    return this.cachedReverseGeocode;
  }
}

export const locationService = new LocationService();
