import React from 'react';
import { MapPin, LocateFixed, Compass, Car, Footprints, ChevronRight, Sparkles } from 'lucide-react';
import { GeoCoordinates, ReverseGeocodeResult } from '../../types/dating';
import { audioHaptics } from '../../services/audioHaptics';

interface LiveLocationStatusBarProps {
  currentLocation: GeoCoordinates | null;
  reverseData: ReverseGeocodeResult | null;
  onOpenGeoModal: () => void;
}

export const LiveLocationStatusBar: React.FC<LiveLocationStatusBarProps> = ({
  currentLocation,
  reverseData,
  onOpenGeoModal
}) => {
  const cityName = reverseData?.displayName || reverseData?.city || 'San Francisco, CA';
  const neighborhood = reverseData?.neighborhood;

  return (
    <div className="w-full bg-neutral-900/90 backdrop-blur-md border-b border-neutral-800/80 px-3 sm:px-4 py-2 text-xs text-neutral-300 flex items-center justify-between gap-2 z-20">
      <div className="flex items-center gap-2 overflow-hidden">
        <div className="w-6 h-6 rounded-lg bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
          <MapPin className="w-3.5 h-3.5" />
        </div>
        <div className="truncate">
          <span className="text-neutral-400">Dating Near: </span>
          <span className="font-semibold text-white">
            {neighborhood ? `${neighborhood}, ` : ''}{cityName}
          </span>
          {currentLocation && (
            <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 font-mono hidden md:inline">
              GPS Active
            </span>
          )}
        </div>
      </div>

      <button
        id="open-geolocation-status-btn"
        onClick={() => {
          audioHaptics.triggerNavigationClick();
          onOpenGeoModal();
        }}
        className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 hover:text-white border border-neutral-700/60 text-[11px] font-medium flex items-center gap-1.5 transition shrink-0 active:scale-95 text-rose-300"
      >
        <LocateFixed className="w-3 h-3 text-rose-400" />
        <span>Location & Travel Matrix</span>
        <ChevronRight className="w-3 h-3 opacity-60" />
      </button>
    </div>
  );
};
