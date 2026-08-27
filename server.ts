import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// API Route: AI-powered Smart Opener generator
app.post('/api/smart-opener', async (req, res) => {
  try {
    const { currentUser, targetUser, tone, customVibe } = req.body;

    if (!currentUser || !targetUser) {
      return res.status(400).json({ error: 'Missing user profiles' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(200).json({
        fallback: true,
        message: 'No GEMINI_API_KEY configured on server, fallback triggered',
      });
    }

    // Shared interests
    const myInterests = (currentUser.hobbies || []).concat(currentUser.accessibilityBadges || []);
    const theirInterests = (targetUser.hobbies || []).concat(targetUser.accessibilityBadges || []);
    const sharedInterests = (currentUser.hobbies || []).filter((h: string) =>
      (targetUser.hobbies || []).some((th: string) => th.toLowerCase() === h.toLowerCase())
    );

    const prompt = `
You are an expert, empathetic, inclusive dating coach & icebreaker generator for the accessible dating app "hubb".
Generate 4 distinct, engaging, authentic, and charming "Smart Opener" ice-breaker messages from User A to User B based on their profile details, shared passions, and communication preferences.

User A (Sender):
- Name: ${currentUser.name}
- Pronouns: ${currentUser.pronouns || 'They/Them'}
- Bio: ${currentUser.bio || ''}
- Hobbies: ${(currentUser.hobbies || []).join(', ')}
- Job: ${currentUser.jobTitle || ''}
- Goals: ${currentUser.relationshipGoal || ''}
- Accessibility/Badges: ${(currentUser.accessibilityBadges || []).join(', ')}

User B (Recipient / Matched Profile):
- Name: ${targetUser.name}
- Age: ${targetUser.age}
- Pronouns: ${targetUser.pronouns || ''}
- Bio: ${targetUser.bio || ''}
- Location: ${targetUser.locationCity || ''}
- Job: ${targetUser.jobTitle || ''} (${targetUser.companyOrField || ''})
- Education: ${targetUser.education || ''}
- Hobbies: ${(targetUser.hobbies || []).join(', ')}
- Lifestyle: ${JSON.stringify(targetUser.lifestyle || {})}
- Relationship Goal: ${targetUser.relationshipGoal || ''}
- Accessibility/Badges: ${(targetUser.accessibilityBadges || []).join(', ')}
- Photo/Visual Description: ${targetUser.photoDescription || ''}
- Video Bio Transcript: ${targetUser.videoBio?.transcript || ''}

Shared Interests: ${sharedInterests.join(', ') || 'General connection'}
Requested Tone: ${tone || 'authentic & warm'}
Additional Custom Vibe/Request: ${customVibe || 'none'}

Guidelines:
1. Make openers feel natural, thoughtful, respectful, and not robotic or generic. Avoid cliché pick-up lines like "did it hurt when you fell from heaven".
2. Specifically anchor each message to real details from User B's profile (e.g., their pottery passion, their dog, their favorite tea spot, their sign language, their career, or mutual hobbies).
3. Produce 4 diverse categories:
   - Category 1: 'shared_interest' (Anchor on mutual passion/hobbies)
   - Category 2: 'curious_question' (A genuine, open-ended question about something specific in their bio or video transcript)
   - Category 3: 'playful_warm' (Lighthearted, authentic, clever vibe)
   - Category 4: 'accessible_activity' (A low-pressure, sensory-friendly invite or activity question)
4. Keep each opener under 2-3 sentences max.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sharedInterests: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Mutual interests identified between the two users',
            },
            openers: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  category: {
                    type: Type.STRING,
                    description: 'shared_interest | curious_question | playful_warm | accessible_activity',
                  },
                  categoryLabel: { type: Type.STRING, description: 'Display name for category' },
                  tone: { type: Type.STRING, description: 'warm | witty | thoughtful | casual | curious' },
                  openerText: { type: Type.STRING, description: 'The exact icebreaker message ready to send' },
                  whyItWorks: {
                    type: Type.STRING,
                    description: 'Brief 1-sentence explanation of what makes this opener effective and personal',
                  },
                  highlightedKeywords: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: '1-3 key profile hook keywords used in this opener',
                  },
                },
                required: ['id', 'category', 'categoryLabel', 'tone', 'openerText', 'whyItWorks', 'highlightedKeywords'],
              },
            },
          },
          required: ['sharedInterests', 'openers'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      targetUserId: targetUser.id,
      targetUserName: targetUser.name,
      sharedInterests: parsed.sharedInterests || sharedInterests,
      openers: parsed.openers || [],
      isAiGenerated: true,
    });
  } catch (err: unknown) {
    console.error('Gemini Smart Opener error:', err);
    return res.status(500).json({
      error: 'Failed to generate AI Smart Openers',
      details: err instanceof Error ? err.message : String(err),
    });
  }
});

// Helper to get Google Maps API Key
function getGoogleMapsApiKey(): string {
  return (
    process.env.GOOGLE_MAPS_API_KEY ||
    process.env.VITE_GOOGLE_MAPS_API_KEY ||
    process.env.MAPS_API_KEY ||
    ''
  );
}

// ============================================================================
// 1. Google Geolocation API Proxy Endpoint
// ============================================================================
app.post('/api/geolocation', async (req, res) => {
  try {
    const apiKey = getGoogleMapsApiKey();
    const payload = req.body || {};

    if (!apiKey) {
      // Fallback default coordinates (San Francisco City Center)
      return res.json({
        location: { lat: 37.7749, lng: -122.4194 },
        accuracy: 30,
        source: 'simulated_fallback',
        message: 'No GOOGLE_MAPS_API_KEY configured. Providing simulated Civic Center coordinates.',
      });
    }

    const response = await fetch(
      `https://www.googleapis.com/geolocation/v1/geolocate?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Maps-Solution-ID': 'gmp_mcp_codeassist_v1_aistudio',
        },
        body: JSON.stringify({
          considerIp: payload.considerIp ?? true,
          wifiAccessPoints: payload.wifiAccessPoints,
          cellTowers: payload.cellTowers,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.warn('Google Geolocation API returned non-OK status:', response.status, errorText);
      return res.json({
        location: { lat: 37.7749, lng: -122.4194 },
        accuracy: 50,
        source: 'error_fallback',
        apiError: errorText,
      });
    }

    const data = (await response.json()) as {
      location?: { lat: number; lng: number };
      accuracy?: number;
    };

    return res.json({
      location: data.location || { lat: 37.7749, lng: -122.4194 },
      accuracy: data.accuracy || 20,
      source: 'google-geolocation',
    });
  } catch (err: unknown) {
    console.error('Geolocation endpoint error:', err);
    return res.status(500).json({
      location: { lat: 37.7749, lng: -122.4194 },
      accuracy: 100,
      source: 'catch_fallback',
      error: err instanceof Error ? err.message : String(err),
    });
  }
});

// ============================================================================
// 2. Google Geocoding (Reverse Geocoding) API Proxy Endpoint
// ============================================================================
app.get('/api/geocode/reverse', async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ error: 'Valid "lat" and "lng" query parameters are required.' });
    }

    const apiKey = getGoogleMapsApiKey();

    if (!apiKey) {
      // Fallback location formatting
      return res.json({
        formattedAddress: `${lat.toFixed(4)}, ${lng.toFixed(4)}, San Francisco, CA 94103, USA`,
        displayName: 'San Francisco, CA',
        neighborhood: 'Market / Civic Center',
        city: 'San Francisco',
        state: 'CA',
        country: 'USA',
        postalCode: '94103',
        source: 'offline_fallback',
      });
    }

    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}&solution_channel=gmp_mcp_codeassist_v1_aistudio`;
    const response = await fetch(url, {
      headers: {
        'X-Goog-Maps-Solution-ID': 'gmp_mcp_codeassist_v1_aistudio',
      },
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn('Geocoding API error:', response.status, errText);
      return res.json({
        formattedAddress: `${lat.toFixed(4)}, ${lng.toFixed(4)}, San Francisco, CA`,
        displayName: 'San Francisco, CA',
        city: 'San Francisco',
        source: 'api_error_fallback',
      });
    }

    const data = (await response.json()) as any;
    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      return res.json({
        formattedAddress: `${lat.toFixed(4)}, ${lng.toFixed(4)}, San Francisco, CA`,
        displayName: 'San Francisco, CA',
        city: 'San Francisco',
        source: 'zero_results_fallback',
        status: data.status,
      });
    }

    const first = data.results[0];
    const components = first.address_components || [];

    const getComponent = (type: string, useShort = false) => {
      const comp = components.find((c: any) => c.types.includes(type));
      return comp ? (useShort ? comp.short_name : comp.long_name) : undefined;
    };

    const streetNumber = getComponent('street_number');
    const route = getComponent('route');
    const neighborhood = getComponent('neighborhood') || getComponent('sublocality') || getComponent('sublocality_level_1');
    const city = getComponent('locality') || getComponent('postal_town') || getComponent('administrative_area_level_2');
    const state = getComponent('administrative_area_level_1', true);
    const country = getComponent('country', true);
    const postalCode = getComponent('postal_code');

    let displayName = city ? `${city}${state ? `, ${state}` : ''}` : first.formatted_address;
    if (neighborhood && city) {
      displayName = `${neighborhood}, ${city}`;
    }

    return res.json({
      formattedAddress: first.formatted_address,
      displayName,
      streetNumber,
      route,
      neighborhood,
      city,
      state,
      country,
      postalCode,
      placeId: first.place_id,
      plusCode: first.plus_code?.global_code,
      types: first.types,
      source: 'google-geocoding',
    });
  } catch (err: unknown) {
    console.error('Reverse geocode error:', err);
    return res.status(500).json({
      error: 'Failed to reverse geocode coordinates',
      details: err instanceof Error ? err.message : String(err),
    });
  }
});

// Also support POST for reverse geocoding
app.post('/api/geocode/reverse', async (req, res) => {
  const { lat, lng } = req.body || {};
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return res.status(400).json({ error: 'lat and lng must be numbers' });
  }
  req.query.lat = String(lat);
  req.query.lng = String(lng);
  // Forward to GET handler logic directly
  try {
    const apiKey = getGoogleMapsApiKey();
    if (!apiKey) {
      return res.json({
        formattedAddress: `${lat.toFixed(4)}, ${lng.toFixed(4)}, San Francisco, CA 94103, USA`,
        displayName: 'San Francisco, CA',
        neighborhood: 'Market / Civic Center',
        city: 'San Francisco',
        state: 'CA',
        country: 'USA',
        postalCode: '94103',
        source: 'offline_fallback',
      });
    }

    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}&solution_channel=gmp_mcp_codeassist_v1_aistudio`;
    const response = await fetch(url, {
      headers: {
        'X-Goog-Maps-Solution-ID': 'gmp_mcp_codeassist_v1_aistudio',
      },
    });

    const data = (await response.json()) as any;
    if (data.status === 'OK' && data.results?.[0]) {
      const first = data.results[0];
      const components = first.address_components || [];
      const getComponent = (type: string, useShort = false) => {
        const comp = components.find((c: any) => c.types.includes(type));
        return comp ? (useShort ? comp.short_name : comp.long_name) : undefined;
      };

      const neighborhood = getComponent('neighborhood') || getComponent('sublocality');
      const city = getComponent('locality') || getComponent('postal_town');
      const state = getComponent('administrative_area_level_1', true);

      return res.json({
        formattedAddress: first.formatted_address,
        displayName: neighborhood && city ? `${neighborhood}, ${city}` : (city ? `${city}, ${state || ''}` : first.formatted_address),
        neighborhood,
        city,
        state,
        country: getComponent('country', true),
        postalCode: getComponent('postal_code'),
        placeId: first.place_id,
        source: 'google-geocoding',
      });
    }

    return res.json({
      formattedAddress: `${lat.toFixed(4)}, ${lng.toFixed(4)}, San Francisco, CA`,
      displayName: 'San Francisco, CA',
      city: 'San Francisco',
      source: 'fallback',
    });
  } catch (err: unknown) {
    return res.status(500).json({ error: String(err) });
  }
});

// ============================================================================
// 3. Google Routes API (Modern Distance Matrix: computeRouteMatrix)
// ============================================================================
// Haversine formula calculation for road distance estimation & speed models
function calculateFallbackDistanceMatrix(
  origin: { lat: number; lng: number },
  dest: { lat: number; lng: number },
  travelMode: 'DRIVE' | 'WALK' | 'TRANSIT' | 'BICYCLE' = 'DRIVE'
) {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (origin.lat * Math.PI) / 180;
  const φ2 = (dest.lat * Math.PI) / 180;
  const Δφ = ((dest.lat - origin.lat) * Math.PI) / 180;
  const Δλ = ((dest.lng - origin.lng) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightDistanceMeters = R * c;

  // Urban road factor (~1.25x straight-line distance)
  const distanceMeters = Math.round(straightDistanceMeters * 1.25);
  const distanceKm = Number((distanceMeters / 1000).toFixed(1));
  const distanceMiles = Number((distanceMeters / 1609.34).toFixed(1));

  // Mode speeds (meters per second)
  let speedMps = 9.72; // Drive: ~35 km/h in city
  if (travelMode === 'WALK') speedMps = 1.35; // Walk: ~4.8 km/h
  else if (travelMode === 'TRANSIT') speedMps = 6.1; // Transit: ~22 km/h
  else if (travelMode === 'BICYCLE') speedMps = 4.2; // Bicycle: ~15 km/h

  const durationSeconds = Math.max(60, Math.round(distanceMeters / speedMps));
  const durationMinutes = Math.max(1, Math.round(durationSeconds / 60));

  let durationText = `${durationMinutes} mins`;
  if (durationMinutes >= 60) {
    const hrs = Math.floor(durationMinutes / 60);
    const mins = durationMinutes % 60;
    durationText = `${hrs} hr ${mins > 0 ? `${mins} min` : ''}`;
  }

  return {
    originLat: origin.lat,
    originLng: origin.lng,
    destLat: dest.lat,
    destLng: dest.lng,
    distanceMeters,
    distanceKm,
    distanceMiles,
    distanceText: `${distanceKm} km (${distanceMiles} mi)`,
    durationSeconds,
    durationMinutes,
    durationText,
    travelMode,
    condition: 'ROUTE_EXISTS',
    status: 'OK',
    source: 'haversine_model',
  };
}

app.post('/api/routes/distance-matrix', async (req, res) => {
  try {
    const { origins, destinations, travelMode = 'DRIVE' } = req.body;

    if (!Array.isArray(origins) || !Array.isArray(destinations) || origins.length === 0 || destinations.length === 0) {
      return res.status(400).json({ error: 'Origins and destinations must be non-empty arrays with lat/lng.' });
    }

    const apiKey = getGoogleMapsApiKey();

    if (!apiKey) {
      // Return high-accuracy Haversine matrix calculation
      const matrix = origins.map((origin) =>
        destinations.map((dest) =>
          calculateFallbackDistanceMatrix(origin, dest, travelMode)
        )
      );

      return res.json({
        matrix,
        elements: matrix.flat(),
        source: 'haversine_road_model',
        travelMode,
      });
    }

    // Call Google Routes API computeRouteMatrix endpoint
    const routesPayload: Record<string, any> = {
      origins: origins.map((o: { lat: number; lng: number }) => ({
        waypoint: {
          location: {
            latLng: {
              latitude: o.lat,
              longitude: o.lng,
            },
          },
        },
      })),
      destinations: destinations.map((d: { lat: number; lng: number }) => ({
        waypoint: {
          location: {
            latLng: {
              latitude: d.lat,
              longitude: d.lng,
            },
          },
        },
      })),
      travelMode: travelMode === 'WALK' ? 'WALK' : travelMode === 'BICYCLE' ? 'BICYCLE' : travelMode === 'TRANSIT' ? 'TRANSIT' : 'DRIVE',
    };

    if (travelMode === 'DRIVE') {
      routesPayload.routingPreference = 'TRAFFIC_UNAWARE';
    }

    const routesResponse = await fetch(
      'https://routes.googleapis.com/distanceMatrix/v2:computeRouteMatrix',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'originIndex,destinationIndex,status,condition,distanceMeters,duration',
          'X-Goog-Maps-Solution-ID': 'gmp_mcp_codeassist_v1_aistudio',
        },
        body: JSON.stringify(routesPayload),
      }
    );

    if (!routesResponse.ok) {
      console.info(`[Routes API] computeRouteMatrix status ${routesResponse.status}, falling back to precision road matrix`);

      // Gracefully fall back to local road matrix calculation
      const fallbackMatrix = origins.map((origin) =>
        destinations.map((dest) =>
          calculateFallbackDistanceMatrix(origin, dest, travelMode)
        )
      );

      return res.json({
        matrix: fallbackMatrix,
        elements: fallbackMatrix.flat(),
        source: 'haversine_road_model',
        travelMode,
      });
    }

    const rawElements = (await routesResponse.json()) as any[];
    
    // Parse Google Routes Matrix stream output into clean formatted elements
    const elements = rawElements.map((el: any) => {
      const oIdx = el.originIndex ?? 0;
      const dIdx = el.destinationIndex ?? 0;
      const origin = origins[oIdx] || origins[0];
      const dest = destinations[dIdx] || destinations[0];

      const distanceMeters = el.distanceMeters ?? 0;
      const durationSeconds = el.duration ? parseInt(el.duration.replace('s', ''), 10) : 0;
      const distanceKm = Number((distanceMeters / 1000).toFixed(1));
      const distanceMiles = Number((distanceMeters / 1609.34).toFixed(1));
      const durationMinutes = Math.max(1, Math.round(durationSeconds / 60));

      let durationText = `${durationMinutes} mins`;
      if (durationMinutes >= 60) {
        const hrs = Math.floor(durationMinutes / 60);
        const mins = durationMinutes % 60;
        durationText = `${hrs} hr ${mins > 0 ? `${mins} min` : ''}`;
      }

      return {
        originIndex: oIdx,
        destinationIndex: dIdx,
        originLat: origin.lat,
        originLng: origin.lng,
        destLat: dest.lat,
        destLng: dest.lng,
        distanceMeters,
        distanceKm,
        distanceMiles,
        distanceText: `${distanceKm} km (${distanceMiles} mi)`,
        durationSeconds,
        durationMinutes,
        durationText,
        travelMode,
        condition: el.condition || 'ROUTE_EXISTS',
        status: el.status?.code === 0 || !el.status ? 'OK' : 'ERROR',
        source: 'google-routes-matrix',
      };
    });

    return res.json({
      elements,
      travelMode,
      source: 'google-routes-matrix',
    });
  } catch (err: unknown) {
    console.error('Distance Matrix route error:', err);
    return res.status(500).json({
      error: 'Failed to compute distance matrix',
      details: err instanceof Error ? err.message : String(err),
    });
  }
});

// ============================================================================
// 4. Multi-Mode Travel Estimator (Driving + Walking + Transit in one request)
// ============================================================================
app.post('/api/routes/multi-mode-travel', async (req, res) => {
  try {
    const { origin, destination } = req.body;
    if (!origin?.lat || !origin?.lng || !destination?.lat || !destination?.lng) {
      return res.status(400).json({ error: 'Origin and destination lat/lng are required.' });
    }

    const driveEstimate = calculateFallbackDistanceMatrix(origin, destination, 'DRIVE');
    const walkEstimate = calculateFallbackDistanceMatrix(origin, destination, 'WALK');
    const transitEstimate = calculateFallbackDistanceMatrix(origin, destination, 'TRANSIT');

    const apiKey = getGoogleMapsApiKey();
    if (!apiKey) {
      return res.json({
        drive: driveEstimate,
        walk: walkEstimate,
        transit: transitEstimate,
        source: 'haversine_multimode',
      });
    }

    // Try driving matrix via Google Routes API
    try {
      const routesPayload = {
        origins: [{ waypoint: { location: { latLng: { latitude: origin.lat, longitude: origin.lng } } } }],
        destinations: [{ waypoint: { location: { latLng: { latitude: destination.lat, longitude: destination.lng } } } }],
        travelMode: 'DRIVE',
        routingPreference: 'TRAFFIC_UNAWARE',
      };

      const resp = await fetch('https://routes.googleapis.com/distanceMatrix/v2:computeRouteMatrix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'originIndex,destinationIndex,distanceMeters,duration',
          'X-Goog-Maps-Solution-ID': 'gmp_mcp_codeassist_v1_aistudio',
        },
        body: JSON.stringify(routesPayload),
      });

      if (resp.ok) {
        const raw = (await resp.json()) as any[];
        if (raw?.[0]) {
          const el = raw[0];
          const distM = el.distanceMeters ?? driveEstimate.distanceMeters;
          const durS = el.duration ? parseInt(el.duration.replace('s', ''), 10) : driveEstimate.durationSeconds;
          const distKm = Number((distM / 1000).toFixed(1));
          const durM = Math.max(1, Math.round(durS / 60));

          driveEstimate.distanceMeters = distM;
          driveEstimate.distanceKm = distKm;
          driveEstimate.distanceMiles = Number((distM / 1609.34).toFixed(1));
          driveEstimate.distanceText = `${distKm} km (${driveEstimate.distanceMiles} mi)`;
          driveEstimate.durationSeconds = durS;
          driveEstimate.durationMinutes = durM;
          driveEstimate.durationText = `${durM} mins`;
          driveEstimate.source = 'google-routes-matrix';
        }
      }
    } catch {
      // use fallback for driving
    }

    return res.json({
      drive: driveEstimate,
      walk: walkEstimate,
      transit: transitEstimate,
      source: 'computed_multimode',
    });
  } catch (err: unknown) {
    return res.status(500).json({ error: String(err) });
  }
});


// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'hubb-dating-api' });
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`hubb dating app server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
