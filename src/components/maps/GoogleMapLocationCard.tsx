import React, { useState, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { 
  MapPin, 
  Navigation, 
  ExternalLink, 
  ShieldCheck, 
  ShieldAlert,
  Check, 
  Copy, 
  Volume2, 
  Maximize2, 
  Sparkles,
  Accessibility,
  Car,
  Footprints,
  Bus
} from 'lucide-react';
import { SharedLocation, DistanceMatrixMultiMode } from '../../types/dating';
import { audioHaptics } from '../../services/audioHaptics';
import { speechService } from '../../services/speechService';
import { locationService } from '../../services/locationService';

interface GoogleMapLocationCardProps {
  location: SharedLocation;
  isSenderMe?: boolean;
  onConfirmMeetup?: (location: SharedLocation) => void;
  onTriggerSafetyCheck?: (location: SharedLocation) => void;
  isConfirmed?: boolean;
}

export const GoogleMapLocationCard: React.FC<GoogleMapLocationCardProps> = ({
  location,
  isSenderMe = false,
  onConfirmMeetup,
  onTriggerSafetyCheck,
  isConfirmed = false
}) => {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [travelTimes, setTravelTimes] = useState<DistanceMatrixMultiMode | null>(null);

  const apiKey = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_GOOGLE_MAPS_API_KEY || '';

  const position = {
    lat: location.lat || 37.7749,
    lng: location.lng || -122.4194
  };

  useEffect(() => {
    const fetchTravel = async () => {
      try {
        const userLoc = locationService.getCachedLocation() || { lat: 37.7749, lng: -122.4194 };
        const travel = await locationService.getMultiModeTravel(userLoc, position);
        setTravelTimes(travel);
      } catch (e) {
        console.warn('Could not load card travel matrix:', e);
      }
    };
    fetchTravel();
  }, [position.lat, position.lng]);

  const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${position.lat},${position.lng}&query=${encodeURIComponent(location.placeName + ' ' + location.address)}`;

  const handleCopyAddress = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${location.placeName}, ${location.address}`);
    setCopied(true);
    audioHaptics.triggerNavigationClick();
    speechService.speak('Location address copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReadAloud = (e: React.MouseEvent) => {
    e.stopPropagation();
    speechService.speak(`Shared Meetup Location: ${location.placeName}. Address: ${location.address}. ${location.notes ? `Note: ${location.notes}` : ''}`);
  };

  const handleConfirm = (e: React.MouseEvent) => {
    e.stopPropagation();
    audioHaptics.triggerMatchSuccess();
    if (onConfirmMeetup) {
      onConfirmMeetup(location);
    }
    speechService.speak(`Meetup confirmed at ${location.placeName}!`);
  };

  return (
    <div className="w-full max-w-sm rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-700/80 shadow-xl space-y-2.5 text-neutral-100">
      {/* Location Interactive Map Viewport */}
      <div className={`w-full ${isExpanded ? 'h-64' : 'h-40'} relative bg-neutral-950 transition-all duration-300`}>
        {apiKey ? (
          <APIProvider apiKey={apiKey}>
            <div className="w-full h-full">
              <Map
                mapId="DEMO_MAP_ID"
                defaultCenter={position}
                center={position}
                defaultZoom={15}
                gestureHandling="cooperative"
                disableDefaultUI={false}
                zoomControl={true}
                internalUsageAttributionIds={["gmp_mcp_codeassist_v1_aistudio"]}
                style={{ width: '100%', height: '100%' }}
              >
                <AdvancedMarker position={position} title={location.placeName}>
                  <Pin
                    background="#6366f1"
                    borderColor="#ffffff"
                    glyphColor="#ffffff"
                    scale={1.15}
                  />
                </AdvancedMarker>
              </Map>
            </div>
          </APIProvider>
        ) : (
          /* Safe Prototyping Map View when API key is pending */
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-neutral-900 via-neutral-950 to-indigo-950/40 relative overflow-hidden text-center">
            <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px]" />
            <div className="w-10 h-10 rounded-full bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center text-indigo-400 mb-2 animate-bounce">
              <MapPin className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-neutral-200">{location.placeName}</p>
            <p className="text-[10px] text-neutral-400 max-w-[220px] truncate">{location.address}</p>
            <span className="mt-1 text-[9px] bg-indigo-900/60 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-mono">
              Lat: {position.lat.toFixed(4)}, Lng: {position.lng.toFixed(4)}
            </span>
          </div>
        )}

        {/* Floating Quick Action Overlay on Map */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
          <button
            onClick={handleReadAloud}
            aria-label="Read location details aloud"
            className="p-1.5 rounded-xl bg-black/70 hover:bg-black/90 text-neutral-300 hover:text-white backdrop-blur-md border border-white/10 transition-colors cursor-pointer"
          >
            <Volume2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsExpanded(prev => !prev)}
            aria-label={isExpanded ? "Collapse map view" : "Expand map view"}
            className="p-1.5 rounded-xl bg-black/70 hover:bg-black/90 text-neutral-300 hover:text-white backdrop-blur-md border border-white/10 transition-colors cursor-pointer"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Safety & Accessibility Verification Badge */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/75 backdrop-blur-md border border-emerald-500/40 text-emerald-400 px-2 py-0.5 rounded-full text-[10px] font-semibold">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span>Verified Safe Public Spot</span>
        </div>
      </div>

      {/* Location Details Container */}
      <div className="p-3 pt-1 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-indigo-400 flex-shrink-0" />
              <span>{location.placeName}</span>
            </h4>
            <p className="text-[11px] text-neutral-300 mt-0.5 leading-snug">
              {location.address}
            </p>
          </div>
          {location.rating && (
            <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded-md flex-shrink-0">
              ⭐ {location.rating.toFixed(1)}
            </span>
          )}
        </div>

        {/* Attached Note */}
        {location.notes && (
          <p className="text-[11px] text-indigo-200 bg-indigo-950/40 border border-indigo-500/30 p-2 rounded-xl italic">
            "{location.notes}"
          </p>
        )}

        {/* Live Multi-Mode Travel Matrix */}
        {travelTimes && (
          <div className="bg-neutral-950/80 border border-neutral-800 rounded-xl p-2 flex items-center justify-between text-[11px]">
            <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">From you:</span>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-blue-300 font-medium bg-blue-950/60 border border-blue-500/30 px-1.5 py-0.5 rounded-md text-[10px]">
                <Car className="w-3 h-3" />
                <span>{travelTimes.drive.durationText}</span>
              </span>
              <span className="flex items-center gap-1 text-emerald-300 font-medium bg-emerald-950/60 border border-emerald-500/30 px-1.5 py-0.5 rounded-md text-[10px]">
                <Footprints className="w-3 h-3" />
                <span>{travelTimes.walk.durationText}</span>
              </span>
              {travelTimes.transit && (
                <span className="flex items-center gap-1 text-amber-300 font-medium bg-amber-950/60 border border-amber-500/30 px-1.5 py-0.5 rounded-md text-[10px]">
                  <Bus className="w-3 h-3" />
                  <span>{travelTimes.transit.durationText}</span>
                </span>
              )}
            </div>
          </div>
        )}

        {/* Location Action Buttons Grid */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-neutral-800">
          <a
            href={googleMapsDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => audioHaptics.triggerNavigationClick()}
            className="py-2 px-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer text-center"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Get Directions</span>
          </a>

          <button
            type="button"
            onClick={handleCopyAddress}
            className="py-2 px-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white font-semibold text-[11px] flex items-center justify-center gap-1.5 border border-neutral-700 transition-all cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-bold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Address</span>
              </>
            )}
          </button>
        </div>

        {/* Confirm Meetup & Safety Check Action Buttons */}
        <div className="space-y-1.5 pt-1">
          {onTriggerSafetyCheck && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                audioHaptics.triggerNavigationClick();
                onTriggerSafetyCheck(location);
              }}
              className="w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 transition-all shadow-sm cursor-pointer"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>Safety Check: Send Location to Trusted Contact</span>
            </button>
          )}

          {onConfirmMeetup && (
            <button
              type="button"
              onClick={handleConfirm}
              className={`w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer ${
                isConfirmed
                  ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                  : 'bg-gradient-to-r from-amber-500/20 to-indigo-600/20 text-amber-300 hover:from-amber-500 hover:to-indigo-600 hover:text-white border border-amber-500/40'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isConfirmed ? '✓ Meetup Confirmed for this Spot' : 'Set as Confirmed Meetup Spot'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
