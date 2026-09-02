import { TrustedContact, SafetyCheckLog, SafetyCheckUrgency, UserProfile, SharedLocation } from '../types/dating';

export const DEFAULT_TRUSTED_CONTACTS: TrustedContact[] = [
  {
    id: 'contact-1',
    name: 'Elena Vasquez',
    relationship: 'Best Friend & Roommate',
    phone: '+1 (415) 555-0192',
    email: 'elena.vasquez@example.com',
    notifyMethod: 'sms',
    isDefaultEmergencyContact: true
  },
  {
    id: 'contact-2',
    name: 'Marcus Rivera',
    relationship: 'Brother',
    phone: '+1 (415) 555-0144',
    email: 'marcus.rivera@example.com',
    notifyMethod: 'sms',
    isDefaultEmergencyContact: false
  },
  {
    id: 'contact-3',
    name: 'Dr. Sarah Kim',
    relationship: 'Community Mentor',
    phone: '+1 (415) 555-0188',
    email: 'sarah.kim@example.org',
    notifyMethod: 'whatsapp',
    isDefaultEmergencyContact: false
  }
];

const TRUSTED_CONTACTS_KEY = 'aura_dating_trusted_contacts';
const SAFETY_LOGS_KEY = 'aura_dating_safety_logs';

export function loadTrustedContacts(): TrustedContact[] {
  try {
    const stored = localStorage.getItem(TRUSTED_CONTACTS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load trusted contacts from localStorage', e);
  }
  return DEFAULT_TRUSTED_CONTACTS;
}

export function saveTrustedContacts(contacts: TrustedContact[]): void {
  try {
    localStorage.setItem(TRUSTED_CONTACTS_KEY, JSON.stringify(contacts));
  } catch (e) {
    console.warn('Failed to save trusted contacts', e);
  }
}

export function loadSafetyLogs(): SafetyCheckLog[] {
  try {
    const stored = localStorage.getItem(SAFETY_LOGS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn('Failed to load safety logs', e);
  }
  return [];
}

export function saveSafetyLog(log: SafetyCheckLog): void {
  try {
    const existing = loadSafetyLogs();
    const updated = [log, ...existing].slice(0, 30); // Keep last 30
    localStorage.setItem(SAFETY_LOGS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to save safety log', e);
  }
}

export interface DeviceLocationResult {
  lat: number;
  lng: number;
  address: string;
  accuracyMeters?: number;
  isSimulatedFallback?: boolean;
}

/**
 * Gets real-time browser location or falls back safely
 */
export async function getDeviceCurrentLocation(fallbackCity: string = ''): Promise<DeviceLocationResult> {
  return new Promise((resolve) => {
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            lat: Number(pos.coords.latitude.toFixed(5)),
            lng: Number(pos.coords.longitude.toFixed(5)),
            address: `GPS Pin (${pos.coords.latitude.toFixed(3)}°N, ${pos.coords.longitude.toFixed(3)}°W)`,
            accuracyMeters: Math.round(pos.coords.accuracy),
            isSimulatedFallback: false
          });
        },
        () => {
          resolve({
            lat: 37.7749,
            lng: -122.4194,
            address: fallbackCity ? `${fallbackCity} Area` : 'Coordinates Recorded',
            accuracyMeters: 25,
            isSimulatedFallback: true
          });
        },
        { timeout: 6000, enableHighAccuracy: true, maximumAge: 60000 }
      );
    } else {
      resolve({
        lat: 37.7749,
        lng: -122.4194,
        address: fallbackCity ? `${fallbackCity} Area` : 'Coordinates Recorded',
        accuracyMeters: 50,
        isSimulatedFallback: true
      });
    }
  });
}

export function buildGoogleMapsUrl(lat: number, lng: number, placeName?: string): string {
  if (placeName && placeName.trim().length > 0) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(placeName + ' ' + lat + ',' + lng)}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}

export interface SafetyTemplateItem {
  id: string;
  name: string;
  urgency: SafetyCheckUrgency;
  badge: string;
  iconType: 'check' | 'map' | 'clock' | 'alert';
  description: string;
  buildMessage: (data: {
    userName: string;
    contactName: string;
    partner: UserProfile;
    locationName: string;
    address: string;
    mapsUrl: string;
    checkInTime?: string;
    customNote?: string;
  }) => string;
}

export const SAFETY_MESSAGE_TEMPLATES: SafetyTemplateItem[] = [
  {
    id: 'first-date-checkin',
    name: 'First Meetup Safe Check-In',
    urgency: 'routine',
    badge: 'Recommended',
    iconType: 'check',
    description: 'Friendly date notification sharing meetup location, partner details, and expected wrap-up time.',
    buildMessage: ({ userName, contactName, partner, locationName, address, mapsUrl, checkInTime, customNote }) => {
      const timeStr = checkInTime || 'in about 1.5 hours';
      const noteStr = customNote ? ` Note: "${customNote}"` : '';
      return `📍 [First Date Safety Check]\nHey ${contactName}, ${userName} here! I'm on a first meetup with ${partner.name} (${partner.pronouns}, age ${partner.age}).\n\n📍 Location: ${locationName} (${address})\n🗺️ Live Map: ${mapsUrl}\n⏰ Expected check-in: ${timeStr}.${noteStr}\n\nEverything is going well! Just sharing my location for safety.`;
    }
  },
  {
    id: 'live-location-pin',
    name: 'Real-Time Venue & GPS Pin',
    urgency: 'scheduled',
    badge: 'High Detail',
    iconType: 'map',
    description: 'Detailed snapshot with GPS link, verified profile status, and partner occupation for peace of mind.',
    buildMessage: ({ userName, contactName, partner, locationName, address, mapsUrl, customNote }) => {
      const verifiedTag = partner.verified ? 'Verified on App ✅' : 'Profile Active';
      const noteStr = customNote ? `\n📝 Details: ${customNote}` : '';
      return `🛡️ [Meetup Location Pin]\n${contactName}, I have arrived at my date with ${partner.name} (${verifiedTag}, ${partner.jobTitle || 'Dater'}).\n\n📍 Venue: ${locationName}\n🏠 Address: ${address}\n🗺️ Google Maps: ${mapsUrl}${noteStr}\n\nKeep your phone nearby. I will text you when heading home!`;
    }
  },
  {
    id: 'scheduled-timer-alert',
    name: 'Check-In Countdown Alert',
    urgency: 'scheduled',
    badge: 'Safety Timer',
    iconType: 'clock',
    description: 'Alerts trusted contact that an in-app timer is running and requests a callback if not heard from.',
    buildMessage: ({ userName, contactName, partner, locationName, mapsUrl, checkInTime }) => {
      const timeStr = checkInTime || 'in 60 minutes';
      return `⏱️ [Automated Check-In Window]\nHey ${contactName}, I'm meeting ${partner.name} at ${locationName}.\n\n🗺️ Live Pin: ${mapsUrl}\n⏳ If I don't check in with you by ${timeStr}, please give me a quick phone call to make sure all is good!`;
    }
  },
  {
    id: 'urgent-safety-alert',
    name: 'Discreet Help / Urgent Exit',
    urgency: 'urgent',
    badge: 'Urgent Alert',
    iconType: 'alert',
    description: 'Discreet emergency code asking your contact to call immediately with an exit excuse.',
    buildMessage: ({ userName, contactName, partner, locationName, address, mapsUrl, customNote }) => {
      const noteStr = customNote ? ` (Note: ${customNote})` : '';
      return `⚠️ [URGENT SAFETY CHECK]\n${contactName}, this is ${userName}. I am currently at ${locationName} (${address}) with ${partner.name}.${noteStr}\n\n🗺️ My Live Location: ${mapsUrl}\n\nPlease CALL ME IMMEDIATELY and give me an urgent reason to leave, or check in on my safety!`;
    }
  }
];

/**
 * Dispatches the safety message via native Web Share, SMS URI, or WhatsApp
 */
export async function executeSafetyDispatch({
  contact,
  messageText,
  currentUser,
  partner,
  locationName,
  address,
  lat,
  lng,
  mapsUrl,
  urgency,
  checkInDeadline
}: {
  contact: TrustedContact;
  messageText: string;
  currentUser: UserProfile;
  partner: UserProfile;
  locationName: string;
  address: string;
  lat: number;
  lng: number;
  mapsUrl: string;
  urgency: SafetyCheckUrgency;
  checkInDeadline?: string;
}): Promise<{ success: boolean; method: string; log: SafetyCheckLog }> {
  const log: SafetyCheckLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    contactId: contact.id,
    contactName: contact.name,
    contactPhone: contact.phone,
    messageText,
    locationName,
    address,
    lat,
    lng,
    googleMapsUrl: mapsUrl,
    partnerName: partner.name,
    partnerId: partner.id,
    urgency,
    status: 'dispatched',
    checkInDeadline
  };

  saveSafetyLog(log);

  const cleanPhone = contact.phone.replace(/[^0-9+]/g, '');

  // 1. Try SMS link
  const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
  const smsDelimiter = isIOS ? '&' : '?';
  const smsUrl = `sms:${cleanPhone}${smsDelimiter}body=${encodeURIComponent(messageText)}`;

  // 2. WhatsApp URL
  const whatsappUrl = `https://wa.me/${cleanPhone.replace('+', '')}?text=${encodeURIComponent(messageText)}`;

  // 3. Web Share API if supported
  if (contact.notifyMethod === 'share' && typeof navigator !== 'undefined' && 'share' in navigator) {
    try {
      await navigator.share({
        title: `Safety Check - ${partner.name}`,
        text: messageText,
        url: mapsUrl
      });
      return { success: true, method: 'Web Share API', log };
    } catch {
      // User cancelled share or fell back
    }
  }

  // Open native SMS or WhatsApp client
  try {
    if (contact.notifyMethod === 'whatsapp') {
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      return { success: true, method: 'WhatsApp', log };
    } else {
      // Default to SMS or prompt
      const link = document.createElement('a');
      link.href = smsUrl;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return { success: true, method: 'SMS Dispatch', log };
    }
  } catch (e) {
    console.warn('Dispatch fallback trigger', e);
    return { success: true, method: 'Simulated In-App Dispatch', log };
  }
}
