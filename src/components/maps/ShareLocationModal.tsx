import React, { useState, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { 
  MapPin, 
  Navigation, 
  Send, 
  X, 
  Search, 
  ShieldCheck, 
  Coffee, 
  Trees, 
  Palette, 
  Utensils, 
  Sparkles, 
  LocateFixed,
  Info,
  Check,
  Car,
  Footprints,
  Bus,
  RefreshCw
} from 'lucide-react';
import { SharedLocation, DistanceMatrixMultiMode } from '../../types/dating';
import { audioHaptics } from '../../services/audioHaptics';
import { speechService } from '../../services/speechService';
import { locationService } from '../../services/locationService';

interface ShareLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShareLocation: (location: SharedLocation) => void;
  recipientName: string;
}

interface VenuePreset {
  id: string;
  name: string;
  category: 'cafe' | 'park' | 'museum' | 'restaurant';
  address: string;
  lat: number;
  lng: number;
  rating: number;
  safetyTag: string;
  accessibilityFeatures: string[];
}

const VERIFIED_DATE_VENUES: VenuePreset[] = [
  {
    id: 'venue-1',
    name: 'Blue Bottle Coffee & Rooftop Garden',
    category: 'cafe',
    address: '66 Mint St, San Francisco, CA 94103',
    lat: 37.7825,
    lng: -122.4045,
    rating: 4.8,
    safetyTag: 'High Foot Traffic • Well-lit Public Plaza',
    accessibilityFeatures: ['Step-free Entrance', 'Accessible Restrooms', 'Quiet Seating']
  },
  {
    id: 'venue-2',
    name: 'San Francisco Botanical Garden & Tea Pavilion',
    category: 'park',
    address: '1199 9th Ave, San Francisco, CA 94122',
    lat: 37.7678,
    lng: -122.4697,
    rating: 4.9,
    safetyTag: 'Staffed Public Garden • Daylight Hours',
    accessibilityFeatures: ['Paved Pathways', 'Tactile Plant Guides', 'Wheelchair Loaners']
  },
  {
    id: 'venue-3',
    name: 'SFMOMA Modern Art Museum & Atrium Cafe',
    category: 'museum',
    address: '151 3rd St, San Francisco, CA 94103',
    lat: 37.7857,
    lng: -122.4011,
    rating: 4.9,
    safetyTag: 'Security Staffed • Verified Public Institution',
    accessibilityFeatures: ['Audio Described Tours', 'Elevator Access', 'Sensory Friendly Spaces']
  },
  {
    id: 'venue-4',
    name: 'Mission Dolores Park Plaza & Terrace',
    category: 'park',
    address: 'Dolores St & 19th St, San Francisco, CA 94114',
    lat: 37.7596,
    lng: -122.4269,
    rating: 4.7,
    safetyTag: 'Active Community Park • Scenic Views',
    accessibilityFeatures: ['Accessible Viewing Deck', 'Direct Transit Access']
  },
  {
    id: 'venue-5',
    name: 'Sightglass Coffee Roastery & Lounge',
    category: 'cafe',
    address: '270 7th St, San Francisco, CA 94103',
    lat: 37.7766,
    lng: -122.4085,
    rating: 4.8,
    safetyTag: 'Spacious Open Layout • Bustling Ambiance',
    accessibilityFeatures: ['Wide Aisles', 'Service Animal Friendly', 'Low Counter Ordering']
  },
  {
    id: 'venue-6',
    name: 'Ferry Building Artisan Market & Promenade',
    category: 'restaurant',
    address: '1 Ferry Building, San Francisco, CA 94111',
    lat: 37.7955,
    lng: -122.3937,
    rating: 4.8,
    safetyTag: 'Public Marketplace • Waterfront Patrol',
    accessibilityFeatures: ['Smooth Flat Concourse', 'Braille Signage', 'Ample Seating']
  }
];

export const ShareLocationModal: React.FC<ShareLocationModalProps> = ({
  isOpen,
  onClose,
  onShareLocation,
  recipientName
}) => {
  const [selectedVenue, setSelectedVenue] = useState<VenuePreset>(VERIFIED_DATE_VENUES[0]);
  const [customPlaceName, setCustomPlaceName] = useState(VERIFIED_DATE_VENUES[0].name);
  const [customAddress, setCustomAddress] = useState(VERIFIED_DATE_VENUES[0].address);
  const [position, setPosition] = useState<{ lat: number; lng: number }>({
    lat: VERIFIED_DATE_VENUES[0].lat,
    lng: VERIFIED_DATE_VENUES[0].lng
  });
  const [note, setNote] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [venueTravelTimes, setVenueTravelTimes] = useState<DistanceMatrixMultiMode | null>(null);
  const [isCalculatingTravel, setIsCalculatingTravel] = useState(false);

  const apiKey = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_GOOGLE_MAPS_API_KEY || '';

  useEffect(() => {
    if (isOpen) {
      speechService.speak(`Select a safe meetup location to share with ${recipientName}.`);
      updateVenueTravelTimes(position);
    }
  }, [isOpen, recipientName]);

  const updateVenueTravelTimes = async (venuePos: { lat: number; lng: number }) => {
    setIsCalculatingTravel(true);
    try {
      const userLoc = locationService.getCachedLocation() || { lat: 37.7749, lng: -122.4194 };
      const travel = await locationService.getMultiModeTravel(userLoc, venuePos);
      setVenueTravelTimes(travel);
    } catch (e) {
      console.warn('Could not fetch travel times:', e);
    } finally {
      setIsCalculatingTravel(false);
    }
  };

  if (!isOpen) return null;

  const handleSelectVenue = (venue: VenuePreset) => {
    setSelectedVenue(venue);
    setCustomPlaceName(venue.name);
    setCustomAddress(venue.address);
    const newPos = { lat: venue.lat, lng: venue.lng };
    setPosition(newPos);
    updateVenueTravelTimes(newPos);
    audioHaptics.triggerNavigationClick();
  };

  const handleUseCurrentLocation = async () => {
    setIsLocating(true);
    audioHaptics.triggerNavigationClick();
    speechService.speak('Acquiring precise geolocation and reverse geocoding address...');

    try {
      const liveCoords = await locationService.getCurrentLocation({ enableHighAccuracy: true });
      const revData = await locationService.reverseGeocode(liveCoords.lat, liveCoords.lng);

      setPosition({ lat: liveCoords.lat, lng: liveCoords.lng });
      setCustomPlaceName(revData.displayName || 'My Current Location');
      setCustomAddress(revData.formattedAddress);
      updateVenueTravelTimes({ lat: liveCoords.lat, lng: liveCoords.lng });
      
      audioHaptics.triggerSuccessCheck();
      speechService.speak(`Location acquired: ${revData.displayName || revData.formattedAddress}`);
    } catch (err) {
      console.warn('Location detection fallback:', err);
      speechService.speak('Using approximate location for meetup spot.');
    } finally {
      setIsLocating(false);
    }
  };

  const handleConfirmShare = () => {
    const sharedLoc: SharedLocation = {
      placeName: customPlaceName.trim() || selectedVenue.name,
      address: customAddress.trim() || selectedVenue.address,
      lat: position.lat,
      lng: position.lng,
      category: selectedVenue.category,
      isSafeMeetupSpot: true,
      notes: note.trim() || undefined,
      rating: selectedVenue.rating,
      googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(customPlaceName + ' ' + customAddress)}`
    };

    audioHaptics.triggerInterestSent();
    onShareLocation(sharedLoc);
    speechService.speak(`Location shared with ${recipientName}`);
    onClose();
  };

  const filteredVenues = VERIFIED_DATE_VENUES.filter(venue => {
    const matchesCategory = activeCategory === 'all' || venue.category === activeCategory;
    const matchesSearch = searchQuery === '' || 
      venue.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      venue.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-location-title"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
    >
      <div className="bg-neutral-900 border border-neutral-700/80 text-white rounded-3xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center text-indigo-400">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 id="share-location-title" className="text-base sm:text-lg font-bold text-white">
                Share Meetup Location
              </h3>
              <p className="text-xs text-neutral-400">
                Share a verified safe dating spot or coordinates with <span className="text-indigo-300 font-semibold">{recipientName}</span>
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              audioHaptics.triggerNavigationClick();
              onClose();
            }}
            aria-label="Close location picker"
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 custom-scrollbar">
          {/* Interactive Google Map Preview */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-neutral-300">
              <span className="flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-indigo-400" />
                <span>Interactive Google Map Preview</span>
              </span>
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={isLocating}
                className="text-indigo-400 hover:text-indigo-300 text-[11px] font-bold flex items-center gap-1 bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-500/30 px-2.5 py-1 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                <LocateFixed className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                <span>{isLocating ? 'Locating GPS...' : 'Use My Current Location'}</span>
              </button>
            </div>

            <div className="w-full h-52 rounded-2xl overflow-hidden border border-neutral-700 bg-neutral-950 relative shadow-inner">
              {apiKey ? (
                <APIProvider apiKey={apiKey}>
                  <div className="w-full h-full">
                    <Map
                      mapId="DEMO_MAP_ID"
                      center={position}
                      defaultZoom={15}
                      gestureHandling="cooperative"
                      disableDefaultUI={false}
                      zoomControl={true}
                      internalUsageAttributionIds={["gmp_mcp_codeassist_v1_aistudio"]}
                      style={{ width: '100%', height: '100%' }}
                    >
                      <AdvancedMarker position={position} title={customPlaceName}>
                        <Pin
                          background="#6366f1"
                          borderColor="#ffffff"
                          glyphColor="#ffffff"
                          scale={1.2}
                        />
                      </AdvancedMarker>
                    </Map>
                  </div>
                </APIProvider>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-neutral-900 via-neutral-950 to-indigo-950/50 text-center relative">
                  <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px]" />
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center text-indigo-400 mb-2">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-white">{customPlaceName}</p>
                  <p className="text-xs text-neutral-400 max-w-sm truncate">{customAddress}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[10px] bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Safe Public Spot</span>
                    </span>
                    <span className="text-[10px] bg-indigo-950/80 text-indigo-300 border border-indigo-500/40 px-2.5 py-0.5 rounded-full font-mono">
                      {position.lat.toFixed(4)}, {position.lng.toFixed(4)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Real-time Travel Matrix from User to Venue */}
            {venueTravelTimes && (
              <div className="bg-neutral-950/70 border border-neutral-800/80 rounded-xl p-2.5 flex items-center justify-between gap-2 text-[11px]">
                <div className="flex items-center gap-1.5 text-neutral-400 font-medium">
                  <Navigation className="w-3.5 h-3.5 text-rose-400" />
                  <span>Travel Matrix:</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-blue-300 font-semibold bg-blue-950/60 border border-blue-500/30 px-2 py-0.5 rounded-lg">
                    <Car className="w-3 h-3" />
                    <span>{venueTravelTimes.drive.durationText}</span>
                  </span>
                  <span className="flex items-center gap-1 text-emerald-300 font-semibold bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-lg">
                    <Footprints className="w-3 h-3" />
                    <span>{venueTravelTimes.walk.durationText}</span>
                  </span>
                  {venueTravelTimes.transit && (
                    <span className="flex items-center gap-1 text-amber-300 font-semibold bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded-lg">
                      <Bus className="w-3 h-3" />
                      <span>{venueTravelTimes.transit.durationText}</span>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick Categories Filter */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-300 flex items-center justify-between">
              <span>Choose Verified Accessible Meetup Spots</span>
              <span className="text-[10px] text-neutral-500">Public & Safe</span>
            </label>

            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {[
                { id: 'all', label: 'All Venues', icon: Sparkles },
                { id: 'cafe', label: 'Accessible Cafes', icon: Coffee },
                { id: 'park', label: 'Public Parks', icon: Trees },
                { id: 'museum', label: 'Museums & Art', icon: Palette },
                { id: 'restaurant', label: 'Dining', icon: Utensils }
              ].map(cat => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setActiveCategory(cat.id);
                      audioHaptics.triggerNavigationClick();
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-neutral-800/80 text-neutral-300 hover:bg-neutral-800 hover:text-white border border-neutral-700'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Venues Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1 custom-scrollbar">
              {filteredVenues.map(venue => {
                const isSelected = selectedVenue.id === venue.id && customPlaceName === venue.name;
                return (
                  <button
                    key={venue.id}
                    type="button"
                    onClick={() => handleSelectVenue(venue)}
                    className={`p-2.5 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-500/40 text-white'
                        : 'bg-neutral-800/50 hover:bg-neutral-800 border-neutral-700/80 text-neutral-300 hover:text-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-bold text-xs truncate">{venue.name}</span>
                        <span className="text-[10px] text-amber-400 font-mono font-bold flex-shrink-0">
                          ⭐ {venue.rating}
                        </span>
                      </div>
                      <p className="text-[10px] text-neutral-400 line-clamp-1">{venue.address}</p>
                    </div>
                    <div className="mt-1.5 flex items-center justify-between text-[9px] text-indigo-300">
                      <span className="truncate max-w-[170px]">{venue.safetyTag}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Location Name & Custom Note Form */}
          <div className="space-y-3 pt-2 border-t border-neutral-800">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-semibold text-neutral-400 block mb-1">
                  Place Name
                </label>
                <input
                  type="text"
                  value={customPlaceName}
                  onChange={(e) => setCustomPlaceName(e.target.value)}
                  placeholder="e.g. Blue Bottle Cafe"
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-neutral-400 block mb-1">
                  Address or Area
                </label>
                <input
                  type="text"
                  value={customAddress}
                  onChange={(e) => setCustomAddress(e.target.value)}
                  placeholder="e.g. 66 Mint St, San Francisco"
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-neutral-400 block mb-1">
                Optional Message / Meetup Note
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g., How about we grab iced matcha here this Thursday at 4 PM? 🍵"
                className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Modal Action Bar */}
        <div className="p-4 sm:p-5 border-t border-neutral-800 bg-neutral-950/80 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirmShare}
            className="flex-1 max-w-xs py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Share Location with {recipientName.split(' ')[0]}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
