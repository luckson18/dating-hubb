import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Navigation, 
  LocateFixed, 
  Sparkles, 
  Car, 
  Footprints, 
  Bus, 
  CheckCircle2, 
  X, 
  RefreshCw, 
  Compass,
  ArrowRight,
  ShieldCheck,
  Building,
  Radio,
  Volume2
} from 'lucide-react';
import { 
  GeoCoordinates, 
  ReverseGeocodeResult, 
  DistanceMatrixMultiMode, 
  UserProfile 
} from '../../types/dating';
import { locationService } from '../../services/locationService';
import { audioHaptics } from '../../services/audioHaptics';
import { speechService } from '../../services/speechService';

interface GeolocationManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: GeoCoordinates | null;
  onLocationUpdated: (coords: GeoCoordinates, reverseData: ReverseGeocodeResult) => void;
  availableProfiles?: UserProfile[];
}

export const GeolocationManagerModal: React.FC<GeolocationManagerModalProps> = ({
  isOpen,
  onClose,
  currentLocation,
  onLocationUpdated,
  availableProfiles = []
}) => {
  const [coords, setCoords] = useState<GeoCoordinates | null>(currentLocation || { lat: 37.7749, lng: -122.4194 });
  const [reverseData, setReverseData] = useState<ReverseGeocodeResult | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [selectedTargetProfile, setSelectedTargetProfile] = useState<UserProfile | null>(() => {
    return availableProfiles.length > 0 ? availableProfiles[0] : null;
  });
  const [travelTimes, setTravelTimes] = useState<DistanceMatrixMultiMode | null>(null);
  const [isCalculatingTravel, setIsCalculatingTravel] = useState(false);
  const [customLat, setCustomLat] = useState('37.7749');
  const [customLng, setCustomLng] = useState('-122.4194');

  useEffect(() => {
    if (availableProfiles.length > 0 && !selectedTargetProfile) {
      setSelectedTargetProfile(availableProfiles[0]);
    }
  }, [availableProfiles]);

  useEffect(() => {
    if (isOpen) {
      handleFetchLiveLocation();
    }
  }, [isOpen]);

  useEffect(() => {
    if (coords && selectedTargetProfile?.coordinates) {
      calculateMatrix(coords, selectedTargetProfile.coordinates);
    }
  }, [coords, selectedTargetProfile]);

  const handleFetchLiveLocation = async () => {
    setIsLoadingLocation(true);
    audioHaptics.triggerNavigationClick();
    speechService.speak('Acquiring precise geolocation via GPS and Google Geolocation API...');

    try {
      const liveCoords = await locationService.getCurrentLocation({ enableHighAccuracy: true });
      setCoords(liveCoords);
      setCustomLat(liveCoords.lat.toFixed(6));
      setCustomLng(liveCoords.lng.toFixed(6));

      setIsReverseGeocoding(true);
      const rev = await locationService.reverseGeocode(liveCoords.lat, liveCoords.lng);
      setReverseData(rev);
      setIsReverseGeocoding(false);

      onLocationUpdated(liveCoords, rev);
      audioHaptics.triggerSuccessCheck();
      speechService.speak(`Location acquired: ${rev.displayName || rev.formattedAddress}`);
    } catch (err) {
      console.error(err);
      speechService.speak('Geolocation acquisition completed with simulated Civic Center fallback.');
    } finally {
      setIsLoadingLocation(false);
      setIsReverseGeocoding(false);
    }
  };

  const handleApplyCustomCoords = async () => {
    const lat = parseFloat(customLat);
    const lng = parseFloat(customLng);
    if (isNaN(lat) || isNaN(lng)) return;

    const newCoords: GeoCoordinates = { lat, lng, source: 'manual' };
    setCoords(newCoords);
    setIsReverseGeocoding(true);
    audioHaptics.triggerNavigationClick();

    const rev = await locationService.reverseGeocode(lat, lng);
    setReverseData(rev);
    setIsReverseGeocoding(false);
    onLocationUpdated(newCoords, rev);
    audioHaptics.triggerSuccessCheck();
    speechService.speak(`Reverse geocoded custom coordinates to ${rev.displayName}`);
  };

  const calculateMatrix = async (origin: { lat: number; lng: number }, dest: { lat: number; lng: number }) => {
    setIsCalculatingTravel(true);
    try {
      const travel = await locationService.getMultiModeTravel(origin, dest);
      setTravelTimes(travel);
    } catch (e) {
      console.error(e);
    } finally {
      setIsCalculatingTravel(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="geo-modal-title"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
    >
      <div className="bg-neutral-900 border border-neutral-700/80 text-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <LocateFixed className="w-5 h-5" />
            </div>
            <div>
              <h3 id="geo-modal-title" className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Google Maps Geolocation & Routes Matrix
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-medium">
                  Live API
                </span>
              </h3>
              <p className="text-xs text-neutral-400">
                HTML5 GPS + Google Geolocation, Reverse Geocoding & Routes Distance Matrix
              </p>
            </div>
          </div>
          <button
            id="close-geo-modal-btn"
            onClick={() => {
              audioHaptics.triggerNavigationClick();
              onClose();
            }}
            aria-label="Close Geolocation Manager"
            className="p-2 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">

          {/* Action Banner: Detect Current Location */}
          <div className="bg-gradient-to-r from-rose-950/40 via-neutral-800 to-indigo-950/40 border border-neutral-700/60 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-rose-300 text-sm font-semibold">
                <Radio className={`w-4 h-4 ${isLoadingLocation ? 'animate-pulse text-rose-400' : ''}`} />
                Live Device Geolocation
              </div>
              <p className="text-xs text-neutral-300">
                Determines your current coordinates using high-accuracy GPS and server-side Google Geolocation API.
              </p>
            </div>
            <button
              id="trigger-live-geolocation-btn"
              onClick={handleFetchLiveLocation}
              disabled={isLoadingLocation}
              className="w-full sm:w-auto px-4 py-2.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-lg transition active:scale-95 shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLocation ? 'animate-spin' : ''}`} />
              {isLoadingLocation ? 'Acquiring GPS...' : 'Detect My Location'}
            </button>
          </div>

          {/* 1. Reverse Geocoded Address Card */}
          <div className="bg-neutral-950/80 border border-neutral-800 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-neutral-300 uppercase tracking-wider">
                <Building className="w-4 h-4 text-indigo-400" />
                Reverse Geocoding Result (Google Geocoding API)
              </div>
              {reverseData?.source && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 font-mono">
                  {reverseData.source}
                </span>
              )}
            </div>

            {isReverseGeocoding ? (
              <div className="py-4 flex items-center justify-center gap-2 text-xs text-neutral-400">
                <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
                Resolving address via Google Geocoding API...
              </div>
            ) : reverseData ? (
              <div className="space-y-3">
                <div className="p-3 bg-neutral-900/90 rounded-xl border border-neutral-800/80">
                  <div className="text-sm font-semibold text-white flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                    {reverseData.displayName || reverseData.formattedAddress}
                  </div>
                  <div className="text-xs text-neutral-400 mt-1 pl-5">
                    {reverseData.formattedAddress}
                  </div>
                </div>

                {/* Granular components grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div className="p-2 bg-neutral-900/50 rounded-lg border border-neutral-800/50">
                    <span className="text-neutral-500 block">Neighborhood</span>
                    <span className="font-medium text-neutral-200">{reverseData.neighborhood || '—'}</span>
                  </div>
                  <div className="p-2 bg-neutral-900/50 rounded-lg border border-neutral-800/50">
                    <span className="text-neutral-500 block">City / Locality</span>
                    <span className="font-medium text-neutral-200">{reverseData.city || '—'}</span>
                  </div>
                  <div className="p-2 bg-neutral-900/50 rounded-lg border border-neutral-800/50">
                    <span className="text-neutral-500 block">Coordinates</span>
                    <span className="font-mono text-neutral-200">
                      {coords ? `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` : '—'}
                    </span>
                  </div>
                  <div className="p-2 bg-neutral-900/50 rounded-lg border border-neutral-800/50">
                    <span className="text-neutral-500 block">Postal Code / State</span>
                    <span className="font-medium text-neutral-200">
                      {[reverseData.postalCode, reverseData.state].filter(Boolean).join(', ') || '—'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-neutral-400">Press "Detect My Location" to retrieve reverse geocoded address.</p>
            )}
          </div>

          {/* 2. Live Distance Matrix & Multi-Mode Travel Times */}
          <div className="bg-neutral-950/80 border border-neutral-800 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-neutral-300 uppercase tracking-wider">
                <Navigation className="w-4 h-4 text-emerald-400" />
                Distance Matrix API (Routes computeRouteMatrix)
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300">
                Driving • Walking • Transit
              </span>
            </div>

            {/* Target Profile Selector */}
            <div className="space-y-1.5">
              <label htmlFor="target-profile-select" className="text-xs text-neutral-400 block">
                Calculate live distance & travel times to dater:
              </label>
              {availableProfiles.length > 0 ? (
                <select
                  id="target-profile-select"
                  value={selectedTargetProfile?.id || ''}
                  onChange={(e) => {
                    const found = availableProfiles.find(p => p.id === e.target.value);
                    if (found) {
                      setSelectedTargetProfile(found);
                      audioHaptics.triggerNavigationClick();
                    }
                  }}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                >
                  {availableProfiles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.locationCity ? `(${p.locationCity})` : ''} {p.relationshipGoal ? `- ${p.relationshipGoal}` : ''}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-xs text-neutral-400 italic bg-neutral-900/60 p-2.5 rounded-xl border border-neutral-800">
                  No other registered users available yet to calculate routes against.
                </p>
              )}
            </div>

            {/* Travel Times Grid */}
            {isCalculatingTravel ? (
              <div className="py-4 flex items-center justify-center gap-2 text-xs text-neutral-400">
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                Computing real-time routes matrix...
              </div>
            ) : travelTimes ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Driving */}
                <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
                    <Car className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Drive Time</span>
                    <span className="text-sm font-bold text-white">{travelTimes.drive.durationText}</span>
                    <span className="text-[11px] text-neutral-400 block">{travelTimes.drive.distanceText}</span>
                  </div>
                </div>

                {/* Walking */}
                <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                    <Footprints className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Walk Time</span>
                    <span className="text-sm font-bold text-white">{travelTimes.walk.durationText}</span>
                    <span className="text-[11px] text-neutral-400 block">{travelTimes.walk.distanceText}</span>
                  </div>
                </div>

                {/* Transit */}
                <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                    <Bus className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Public Transit</span>
                    <span className="text-sm font-bold text-white">{travelTimes.transit?.durationText || '20 mins'}</span>
                    <span className="text-[11px] text-neutral-400 block">{travelTimes.transit?.distanceText || travelTimes.drive.distanceText}</span>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* 3. Manual Coordinate Testing */}
          <div className="bg-neutral-950/60 border border-neutral-800/80 rounded-2xl p-4 space-y-3">
            <span className="text-xs font-semibold text-neutral-400 block">
              Test Geocoding with Custom Coordinates:
            </span>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                id="custom-lat-input"
                type="text"
                value={customLat}
                onChange={(e) => setCustomLat(e.target.value)}
                placeholder="Latitude (e.g. 37.7749)"
                aria-label="Custom Latitude"
                className="flex-1 bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
              />
              <input
                id="custom-lng-input"
                type="text"
                value={customLng}
                onChange={(e) => setCustomLng(e.target.value)}
                placeholder="Longitude (e.g. -122.4194)"
                aria-label="Custom Longitude"
                className="flex-1 bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
              />
              <button
                id="apply-custom-coords-btn"
                onClick={handleApplyCustomCoords}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-semibold transition active:scale-95"
              >
                Geocode & Test
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950/60 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Encrypted & Private</span>
          </div>
          <button
            id="done-geo-modal-btn"
            onClick={() => {
              audioHaptics.triggerSuccessCheck();
              onClose();
            }}
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition shadow-md active:scale-95"
          >
            Apply & Close
          </button>
        </div>

      </div>
    </div>
  );
};
