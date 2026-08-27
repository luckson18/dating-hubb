import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  MapPin, 
  Navigation, 
  Phone, 
  User, 
  Users, 
  Send, 
  Clock, 
  Volume2, 
  Copy, 
  Check, 
  ExternalLink, 
  AlertTriangle, 
  Plus, 
  Trash2, 
  X, 
  Timer, 
  History, 
  Sparkles, 
  Share2, 
  MessageSquare, 
  Compass,
  CheckCircle2,
  RefreshCw,
  Bell
} from 'lucide-react';
import { UserProfile, TrustedContact, SafetyCheckLog, SafetyCheckUrgency, SharedLocation } from '../../types/dating';
import { 
  loadTrustedContacts, 
  saveTrustedContacts, 
  loadSafetyLogs, 
  saveSafetyLog, 
  getDeviceCurrentLocation, 
  buildGoogleMapsUrl, 
  SAFETY_MESSAGE_TEMPLATES, 
  SafetyTemplateItem, 
  executeSafetyDispatch,
  DeviceLocationResult
} from '../../utils/safetyCheckEngine';
import { audioHaptics } from '../../services/audioHaptics';
import { speechService } from '../../services/speechService';

interface SafetyCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  partner: UserProfile;
  initialLocation?: SharedLocation;
}

type SafetyTab = 'send' | 'timer' | 'contacts' | 'history';

export const SafetyCheckModal: React.FC<SafetyCheckModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  partner,
  initialLocation
}) => {
  const [activeTab, setActiveTab] = useState<SafetyTab>('send');
  const [trustedContacts, setTrustedContacts] = useState<TrustedContact[]>([]);
  const [selectedContactId, setSelectedContactId] = useState<string>('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('first-date-checkin');
  const [customNote, setCustomNote] = useState<string>('');
  const [customCheckInTime, setCustomCheckInTime] = useState<string>('in 1 hour');
  const [editableMessage, setEditableMessage] = useState<string>('');
  
  // Location detection state
  const [locationName, setLocationName] = useState<string>(initialLocation?.placeName || 'Sightglass Coffee & Roastery');
  const [address, setAddress] = useState<string>(initialLocation?.address || '270 7th St, San Francisco, CA 94103');
  const [lat, setLat] = useState<number>(initialLocation?.lat || 37.7772);
  const [lng, setLng] = useState<number>(initialLocation?.lng || -122.4082);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);
  const [isGpsLive, setIsGpsLive] = useState<boolean>(Boolean(initialLocation));

  // Dispatch feedback state
  const [isDispatching, setIsDispatching] = useState<boolean>(false);
  const [dispatchSuccess, setDispatchSuccess] = useState<boolean>(false);
  const [dispatchedLog, setDispatchedLog] = useState<SafetyCheckLog | null>(null);
  const [copiedSuccess, setCopiedSuccess] = useState<boolean>(false);
  const [logs, setLogs] = useState<SafetyCheckLog[]>([]);

  // Add contact form state
  const [isAddingContact, setIsAddingContact] = useState<boolean>(false);
  const [newContactName, setNewContactName] = useState<string>('');
  const [newContactRelation, setNewContactRelation] = useState<string>('');
  const [newContactPhone, setNewContactPhone] = useState<string>('');
  const [newContactMethod, setNewContactMethod] = useState<'sms' | 'whatsapp' | 'share'>('sms');

  // Safety Timer state
  const [timerDurationMinutes, setTimerDurationMinutes] = useState<number>(60);
  const [timerRemainingSeconds, setTimerRemainingSeconds] = useState<number | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const timerRef = useRef<any>(null);

  // Load contacts and logs on mount
  useEffect(() => {
    if (isOpen) {
      const contacts = loadTrustedContacts();
      setTrustedContacts(contacts);
      const defaultContact = contacts.find(c => c.isDefaultEmergencyContact) || contacts[0];
      if (defaultContact) {
        setSelectedContactId(defaultContact.id);
      }
      setLogs(loadSafetyLogs());
      handleFetchLiveLocation();
    }
  }, [isOpen]);

  // Handle location detection
  const handleFetchLiveLocation = async () => {
    setIsLocating(true);
    try {
      const res: DeviceLocationResult = await getDeviceCurrentLocation(partner.locationCity || 'San Francisco, CA');
      setLat(res.lat);
      setLng(res.lng);
      if (!initialLocation) {
        setLocationName(res.isSimulatedFallback ? 'Downtown SF Safe Meetup Zone' : 'Live GPS Detected Location');
        setAddress(res.address);
      }
      setLocationAccuracy(res.accuracyMeters || 15);
      setIsGpsLive(!res.isSimulatedFallback);
    } catch (err) {
      console.warn('Location detection failed', err);
    } finally {
      setIsLocating(false);
    }
  };

  // Compute live maps URL
  const currentMapsUrl = buildGoogleMapsUrl(lat, lng, locationName);

  // Selected contact and template
  const activeContact = trustedContacts.find(c => c.id === selectedContactId) || trustedContacts[0];
  const activeTemplate = SAFETY_MESSAGE_TEMPLATES.find(t => t.id === selectedTemplateId) || SAFETY_MESSAGE_TEMPLATES[0];

  // Re-generate message text when selections change
  useEffect(() => {
    if (!activeContact) return;
    const generated = activeTemplate.buildMessage({
      userName: currentUser.name,
      contactName: activeContact.name.split(' ')[0],
      partner,
      locationName,
      address,
      mapsUrl: currentMapsUrl,
      checkInTime: customCheckInTime,
      customNote: customNote.trim() || undefined
    });
    setEditableMessage(generated);
  }, [selectedContactId, selectedTemplateId, locationName, address, lat, lng, customNote, customCheckInTime, activeContact, activeTemplate]);

  // Safety countdown timer effect
  useEffect(() => {
    if (isTimerRunning && timerRemainingSeconds !== null && timerRemainingSeconds > 0) {
      timerRef.current = setInterval(() => {
        setTimerRemainingSeconds(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(timerRef.current);
            setIsTimerRunning(false);
            audioHaptics.triggerSafetyAlert();
            speechService.speak('Safety check-in timer expired. Please confirm you are safe or alert your trusted contact.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isTimerRunning, timerRemainingSeconds]);

  // Start Safety Timer
  const handleStartTimer = (mins: number) => {
    setTimerDurationMinutes(mins);
    setTimerRemainingSeconds(mins * 60);
    setIsTimerRunning(true);
    audioHaptics.triggerSuccessCheck();
    speechService.speak(`Safety check-in timer set for ${mins} minutes.`);
  };

  const handleStopTimer = () => {
    setIsTimerRunning(false);
    setTimerRemainingSeconds(null);
    clearInterval(timerRef.current);
    audioHaptics.triggerNavigationClick();
  };

  // Dispatch Action Handler
  const handleSendSafetyCheck = async (urgencyOverride?: SafetyCheckUrgency) => {
    if (!activeContact) return;
    setIsDispatching(true);
    const urgency = urgencyOverride || activeTemplate.urgency;

    try {
      if (urgency === 'urgent') {
        audioHaptics.triggerSafetyAlert();
      } else {
        audioHaptics.triggerSafetyCheckSuccess();
      }

      const result = await executeSafetyDispatch({
        contact: activeContact,
        messageText: editableMessage,
        currentUser,
        partner,
        locationName,
        address,
        lat,
        lng,
        mapsUrl: currentMapsUrl,
        urgency,
        checkInDeadline: customCheckInTime
      });

      setDispatchedLog(result.log);
      setDispatchSuccess(true);
      setLogs(loadSafetyLogs());
      speechService.speak(`Safety check dispatched to ${activeContact.name}.`);

      // Auto-start safety timer if not running
      if (!isTimerRunning) {
        setTimerRemainingSeconds(60 * 60);
        setIsTimerRunning(true);
      }
    } catch (e) {
      console.error('Dispatch error', e);
    } finally {
      setIsDispatching(false);
    }
  };

  // Copy message to clipboard
  const handleCopyMessage = () => {
    navigator.clipboard.writeText(editableMessage);
    setCopiedSuccess(true);
    audioHaptics.triggerNavigationClick();
    speechService.speak('Safety message copied to clipboard');
    setTimeout(() => setCopiedSuccess(false), 2200);
  };

  // Narrate Message
  const handleNarrateMessage = () => {
    audioHaptics.triggerNavigationClick();
    speechService.speak(editableMessage);
  };

  // Add Contact Handler
  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName.trim() || !newContactPhone.trim()) return;

    const newContact: TrustedContact = {
      id: `contact-${Date.now()}`,
      name: newContactName.trim(),
      relationship: newContactRelation.trim() || 'Friend',
      phone: newContactPhone.trim(),
      notifyMethod: newContactMethod,
      isDefaultEmergencyContact: trustedContacts.length === 0
    };

    const updated = [...trustedContacts, newContact];
    setTrustedContacts(updated);
    saveTrustedContacts(updated);
    setSelectedContactId(newContact.id);
    setIsAddingContact(false);
    setNewContactName('');
    setNewContactRelation('');
    setNewContactPhone('');
    audioHaptics.triggerSuccessCheck();
    speechService.speak(`Added ${newContact.name} to trusted contacts.`);
  };

  // Delete Contact Handler
  const handleDeleteContact = (contactId: string) => {
    const updated = trustedContacts.filter(c => c.id !== contactId);
    setTrustedContacts(updated);
    saveTrustedContacts(updated);
    if (selectedContactId === contactId && updated.length > 0) {
      setSelectedContactId(updated[0].id);
    }
    audioHaptics.triggerNavigationClick();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="safety-check-modal-title"
    >
      <div 
        className="bg-neutral-900 border border-neutral-700/80 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-neutral-100"
      >
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-800 bg-gradient-to-r from-neutral-950 via-amber-950/40 to-neutral-950 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="safety-check-modal-title" className="text-base sm:text-lg font-bold text-white flex items-center gap-1.5">
                  Meetup Safety Check
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold uppercase tracking-wider">
                  First Date Security
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Share live location & date snapshot with your trusted contacts in one tap
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                speechService.speak(`Meetup Safety Check for your date with ${partner.name}. Select a trusted contact and send your live location.`);
              }}
              title="Read instructions out loud"
              className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            >
              <Volume2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                audioHaptics.triggerNavigationClick();
                onClose();
              }}
              aria-label="Close safety check modal"
              className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-neutral-800 bg-neutral-950 px-4 pt-2 gap-2 overflow-x-auto no-scrollbar flex-shrink-0">
          <button
            onClick={() => {
              audioHaptics.triggerNavigationClick();
              setActiveTab('send');
            }}
            className={`pb-2.5 px-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'send'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Alert</span>
          </button>

          <button
            onClick={() => {
              audioHaptics.triggerNavigationClick();
              setActiveTab('timer');
            }}
            className={`pb-2.5 px-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'timer'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Timer className="w-3.5 h-3.5" />
            <span>Safety Timer {isTimerRunning && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />}</span>
          </button>

          <button
            onClick={() => {
              audioHaptics.triggerNavigationClick();
              setActiveTab('contacts');
            }}
            className={`pb-2.5 px-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'contacts'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Trusted Contacts ({trustedContacts.length})</span>
          </button>

          <button
            onClick={() => {
              audioHaptics.triggerNavigationClick();
              setActiveTab('history');
            }}
            className={`pb-2.5 px-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'history'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Safety Logs ({logs.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 custom-scrollbar">
          
          {/* TAB 1: SEND SAFETY CHECK */}
          {activeTab === 'send' && (
            <div className="space-y-5 animate-fade-in">
              
              {/* Partner Snapshot Card */}
              <div className="p-3.5 rounded-2xl bg-neutral-950/80 border border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={partner.photos[0]}
                    alt={partner.name}
                    className="w-12 h-12 rounded-xl object-cover border border-neutral-700"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-white">{partner.name}</span>
                      <span className="text-xs text-neutral-400">({partner.pronouns}, {partner.age})</span>
                      {partner.verified && (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-500/30">
                          Verified
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-400">{partner.jobTitle || 'Active Dater'} • {partner.locationCity}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1 justify-end">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Identity Logged
                  </span>
                  <span className="text-[10px] text-neutral-500">Active Chat</span>
                </div>
              </div>

              {/* Location & GPS Detection Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-neutral-950 to-neutral-900 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                      Current Location & Live Map Pin
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={handleFetchLiveLocation}
                    disabled={isLocating}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
                    <span>{isLocating ? 'Detecting GPS...' : 'Refresh GPS'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] font-medium text-neutral-400">Venue / Spot Name</label>
                    <input
                      type="text"
                      value={locationName}
                      onChange={(e) => setLocationName(e.target.value)}
                      placeholder="e.g. Sightglass Coffee"
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-medium text-neutral-400">Address / Neighborhood</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. 270 7th St, San Francisco"
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 text-xs"
                    />
                  </div>
                </div>

                {/* Map Link Preview */}
                <div className="pt-2 border-t border-neutral-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                  <span className="text-neutral-400 flex items-center gap-1.5 font-mono">
                    <span className={`w-2 h-2 rounded-full ${isGpsLive ? 'bg-emerald-400' : 'bg-amber-400'} animate-pulse`} />
                    GPS: {lat.toFixed(4)}, {lng.toFixed(4)} {locationAccuracy ? `(±${locationAccuracy}m)` : ''}
                  </span>

                  <a
                    href={currentMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-bold underline"
                  >
                    <span>Preview in Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Trusted Contact Picker */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-amber-400" />
                    <span>Select Trusted Contact</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      audioHaptics.triggerNavigationClick();
                      setActiveTab('contacts');
                      setIsAddingContact(true);
                    }}
                    className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer font-bold"
                  >
                    <Plus className="w-3 h-3" />
                    <span>New Contact</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {trustedContacts.map((contact) => {
                    const isSelected = contact.id === selectedContactId;
                    return (
                      <button
                        key={contact.id}
                        type="button"
                        onClick={() => {
                          audioHaptics.triggerNavigationClick();
                          setSelectedContactId(contact.id);
                        }}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative ${
                          isSelected
                            ? 'bg-amber-500/15 border-amber-500 text-white shadow-md shadow-amber-950/50'
                            : 'bg-neutral-950/70 border-neutral-800 text-neutral-300 hover:bg-neutral-900 hover:border-neutral-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold truncate">{contact.name}</span>
                          {contact.isDefaultEmergencyContact && (
                            <span className="text-[9px] bg-rose-500/20 text-rose-300 px-1.5 py-0.2 rounded border border-rose-500/30">
                              Primary
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-neutral-400 truncate">{contact.relationship}</p>
                        <p className="text-[10px] text-amber-300/80 font-mono mt-0.5">{contact.phone}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Template Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Choose Safety Message Template</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SAFETY_MESSAGE_TEMPLATES.map((tmpl) => {
                    const isSelected = tmpl.id === selectedTemplateId;
                    const isUrgent = tmpl.urgency === 'urgent';

                    return (
                      <button
                        key={tmpl.id}
                        type="button"
                        onClick={() => {
                          audioHaptics.triggerNavigationClick();
                          setSelectedTemplateId(tmpl.id);
                        }}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? isUrgent
                              ? 'bg-rose-950/40 border-rose-500 text-white shadow-md shadow-rose-950/50'
                              : 'bg-indigo-950/40 border-indigo-500 text-white shadow-md shadow-indigo-950/50'
                            : 'bg-neutral-950/70 border-neutral-800 text-neutral-300 hover:bg-neutral-900 hover:border-neutral-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold truncate flex items-center gap-1.5">
                            {isUrgent && <AlertTriangle className="w-3.5 h-3.5 text-rose-400 animate-pulse" />}
                            {tmpl.name}
                          </span>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                            isUrgent 
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                          }`}>
                            {tmpl.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-400 line-clamp-2">{tmpl.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Parameters (Time & Note) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-neutral-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    <span>Expected Check-In Time</span>
                  </label>
                  <input
                    type="text"
                    value={customCheckInTime}
                    onChange={(e) => setCustomCheckInTime(e.target.value)}
                    placeholder="e.g. in 1.5 hours / at 8:30 PM"
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 text-xs"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-neutral-400 flex items-center gap-1">
                    <MessageSquare className="w-3 h-3 text-amber-400" />
                    <span>Optional Private Note</span>
                  </label>
                  <input
                    type="text"
                    value={customNote}
                    onChange={(e) => setCustomNote(e.target.value)}
                    placeholder="e.g. sitting near back garden patio"
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 text-xs"
                  />
                </div>
              </div>

              {/* Editable Message Preview Box */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1">
                    <span>Message to Send</span>
                    <span className="text-[10px] text-neutral-500 font-normal">(Editable)</span>
                  </label>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleNarrateMessage}
                      title="Read message out loud"
                      className="px-2 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-cyan-300 text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>Audio Preview</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCopyMessage}
                      title="Copy pre-written message"
                      className="px-2 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      {copiedSuccess ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedSuccess ? 'Copied!' : 'Copy Text'}</span>
                    </button>
                  </div>
                </div>

                <textarea
                  rows={6}
                  value={editableMessage}
                  onChange={(e) => setEditableMessage(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-neutral-950 border border-neutral-700 text-xs text-neutral-200 focus:outline-none focus:border-amber-500 font-sans leading-relaxed custom-scrollbar"
                />
              </div>

              {/* Dispatch Confirmation Alert (If recently sent) */}
              {dispatchSuccess && dispatchedLog && (
                <div className="p-3.5 rounded-2xl bg-emerald-950/50 border border-emerald-500/50 flex items-start gap-3 animate-fade-in">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 text-xs">
                    <p className="font-bold text-emerald-300">
                      Safety Check Alert Sent to {dispatchedLog.contactName}!
                    </p>
                    <p className="text-emerald-400/80 mt-0.5">
                      Live location link & date details shared. Safety check-in timer is active.
                    </p>
                  </div>
                </div>
              )}

              {/* Dispatch Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  id="btn-dispatch-safety-primary"
                  onClick={() => handleSendSafetyCheck()}
                  disabled={isDispatching}
                  className="w-full sm:flex-1 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-black font-bold text-sm shadow-xl shadow-amber-950/60 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01]"
                >
                  <Send className="w-4 h-4" />
                  <span>Send to {activeContact?.name || 'Trusted Contact'} (SMS / Link)</span>
                </button>

                <button
                  type="button"
                  id="btn-dispatch-emergency-quick"
                  onClick={() => handleSendSafetyCheck('urgent')}
                  disabled={isDispatching}
                  className="w-full sm:w-auto py-3.5 px-4 rounded-2xl bg-gradient-to-r from-rose-700 to-red-600 hover:from-rose-600 hover:to-red-500 text-white font-bold text-xs shadow-lg shadow-rose-950/50 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <AlertTriangle className="w-4 h-4 text-amber-200" />
                  <span>Emergency Alert</span>
                </button>
              </div>

            </div>
          )}

          {/* TAB 2: SAFETY CHECK-IN TIMER */}
          {activeTab === 'timer' && (
            <div className="space-y-5 animate-fade-in">
              <div className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800 text-center space-y-3">
                <div className="w-14 h-14 mx-auto rounded-3xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner">
                  <Timer className={`w-8 h-8 ${isTimerRunning ? 'animate-spin' : ''}`} />
                </div>

                <div>
                  <h3 className="text-base font-bold text-white">Automated First Date Safety Timer</h3>
                  <p className="text-xs text-neutral-400 max-w-md mx-auto">
                    Set a countdown timer during your date. When the timer expires, the app will play a reassuring chime and prompt you to confirm your safety or send an update.
                  </p>
                </div>

                {/* Countdown Display */}
                {isTimerRunning && timerRemainingSeconds !== null ? (
                  <div className="py-4">
                    <div className="text-4xl sm:text-5xl font-mono font-bold text-amber-400 tracking-wider">
                      {Math.floor(timerRemainingSeconds / 60).toString().padStart(2, '0')}:
                      {(timerRemainingSeconds % 60).toString().padStart(2, '0')}
                    </div>
                    <p className="text-xs text-emerald-400 font-medium mt-2 flex items-center justify-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      Timer Active • Monitoring Date with {partner.name}
                    </p>

                    <div className="flex items-center justify-center gap-3 mt-4">
                      <button
                        type="button"
                        onClick={() => setTimerRemainingSeconds(prev => (prev || 0) + 15 * 60)}
                        className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-200 font-bold cursor-pointer"
                      >
                        +15 Mins
                      </button>
                      <button
                        type="button"
                        onClick={handleStopTimer}
                        className="px-4 py-1.5 rounded-xl bg-rose-600/80 hover:bg-rose-500 text-xs text-white font-bold cursor-pointer"
                      >
                        Cancel Timer
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 pt-2">
                    <label className="text-xs font-bold text-neutral-300">Select Date Duration</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[30, 45, 60, 90].map((mins) => (
                        <button
                          key={mins}
                          type="button"
                          onClick={() => handleStartTimer(mins)}
                          className="p-3 rounded-2xl bg-neutral-900 border border-neutral-700 hover:border-amber-500 text-white font-bold text-xs cursor-pointer transition-all hover:scale-105"
                        >
                          {mins} Minutes
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Safety Tips Card */}
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2 text-xs text-neutral-300">
                <h4 className="font-bold text-amber-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  First Meetup Best Practices
                </h4>
                <ul className="space-y-1.5 text-neutral-400 pl-4 list-disc">
                  <li>Always meet in a well-lit, public venue with accessible exits.</li>
                  <li>Keep your mobile phone fully charged and location permissions active.</li>
                  <li>Never feel pressured to stay; you can trigger the Discreet Emergency Alert anytime.</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 3: MANAGE TRUSTED CONTACTS */}
          {activeTab === 'contacts' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Your Emergency & Trusted Contacts</h3>
                  <p className="text-xs text-neutral-400">People who will receive your location and safety check-ins</p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddingContact(!isAddingContact)}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isAddingContact ? 'Cancel' : 'Add Contact'}</span>
                </button>
              </div>

              {/* Add Contact Drawer */}
              {isAddingContact && (
                <form onSubmit={handleAddContact} className="p-4 rounded-2xl bg-neutral-950 border border-amber-500/50 space-y-3 animate-fade-in">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Add New Trusted Contact</h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-[10px] text-neutral-400">Full Name</label>
                      <input
                        type="text"
                        required
                        value={newContactName}
                        onChange={(e) => setNewContactName(e.target.value)}
                        placeholder="e.g. Jordan Taylor"
                        className="w-full mt-1 px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-neutral-400">Relationship</label>
                      <input
                        type="text"
                        value={newContactRelation}
                        onChange={(e) => setNewContactRelation(e.target.value)}
                        placeholder="e.g. Roommate, Sister, Best Friend"
                        className="w-full mt-1 px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-neutral-400">Phone Number (with Country Code)</label>
                      <input
                        type="tel"
                        required
                        value={newContactPhone}
                        onChange={(e) => setNewContactPhone(e.target.value)}
                        placeholder="e.g. +1 (415) 555-0199"
                        className="w-full mt-1 px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-neutral-400">Notification Channel</label>
                      <select
                        value={newContactMethod}
                        onChange={(e: any) => setNewContactMethod(e.target.value)}
                        className="w-full mt-1 px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white focus:outline-none focus:border-amber-500 text-xs"
                      >
                        <option value="sms">SMS Text Message</option>
                        <option value="whatsapp">WhatsApp Message</option>
                        <option value="share">Device Share Sheet</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs cursor-pointer transition-colors shadow-md"
                  >
                    Save Trusted Contact
                  </button>
                </form>
              )}

              {/* Contacts List */}
              <div className="space-y-2">
                {trustedContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="p-3.5 rounded-2xl bg-neutral-950/80 border border-neutral-800 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-neutral-800 flex items-center justify-center text-amber-400 font-bold text-sm">
                        {contact.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{contact.name}</span>
                          <span className="text-[10px] text-neutral-400">({contact.relationship})</span>
                          {contact.isDefaultEmergencyContact && (
                            <span className="text-[9px] bg-rose-500/20 text-rose-300 px-1.5 py-0.2 rounded border border-rose-500/30">
                              Primary Contact
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-neutral-400 font-mono mt-0.5">{contact.phone}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedContactId(contact.id);
                          setActiveTab('send');
                        }}
                        className="px-2.5 py-1 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold cursor-pointer"
                      >
                        Select
                      </button>

                      {trustedContacts.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleDeleteContact(contact.id)}
                          title="Remove contact"
                          className="p-1.5 rounded-xl text-neutral-500 hover:text-rose-400 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: SAFETY LOG HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">Recent Safety Check Logs</h3>
                <span className="text-xs text-neutral-400">{logs.length} logged alerts</span>
              </div>

              {logs.length === 0 ? (
                <div className="p-8 text-center bg-neutral-950/60 rounded-2xl border border-neutral-800 text-neutral-400 text-xs">
                  No safety check messages dispatched yet. Sent alerts will be logged here for your records.
                </div>
              ) : (
                <div className="space-y-2">
                  {logs.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-2xl bg-neutral-950/80 border border-neutral-800 space-y-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                          Sent to {item.contactName} ({item.contactPhone})
                        </span>
                        <span className="text-[10px] text-neutral-400 font-mono">{item.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-neutral-400">
                        Meetup with <strong className="text-neutral-200">{item.partnerName}</strong> at <span className="text-amber-300">{item.locationName}</span>
                      </p>
                      <p className="text-[11px] text-neutral-300 font-mono bg-neutral-900/90 p-2 rounded-xl border border-neutral-800 line-clamp-3">
                        {item.messageText}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 border-t border-neutral-800 bg-neutral-950/90 flex items-center justify-between text-xs text-neutral-400 flex-shrink-0">
          <span className="flex items-center gap-1.5 font-mono text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            256-bit Encrypted Safety Vault
          </span>

          <button
            type="button"
            onClick={() => {
              audioHaptics.triggerNavigationClick();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold cursor-pointer transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
