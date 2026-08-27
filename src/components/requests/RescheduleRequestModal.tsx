import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, Check, Sparkles } from 'lucide-react';
import { DatingRequest, AlternativeDateProposal } from '../../types/dating';
import { ACCESSIBLE_VENUE_DATABASE, AccessibleVenue } from '../../utils/dateNightEngine';
import { audioHaptics } from '../../services/audioHaptics';
import { speechService } from '../../services/speechService';

interface RescheduleRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: DatingRequest;
  currentUserId: string;
  onConfirmAlternative: (requestId: string, alternative: AlternativeDateProposal) => void;
}

const ALTERNATIVE_TIMES = [
  'Tomorrow • 4:00 PM',
  'This Friday • 7:00 PM',
  'This Saturday • 2:00 PM',
  'Sunday • 11:30 AM',
  'Next Tuesday • 6:30 PM'
];

export const RescheduleRequestModal: React.FC<RescheduleRequestModalProps> = ({
  isOpen,
  onClose,
  request,
  currentUserId,
  onConfirmAlternative
}) => {
  if (!isOpen) return null;

  const [proposedDateTime, setProposedDateTime] = useState<string>(ALTERNATIVE_TIMES[1]);
  const [customDateTime, setCustomDateTime] = useState('');
  const [changeVenue, setChangeVenue] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState<AccessibleVenue>(ACCESSIBLE_VENUE_DATABASE[1]);
  const [note, setNote] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalDateTime = customDateTime.trim() || proposedDateTime;
    const finalVenueName = changeVenue ? selectedVenue.name : request.venueName;
    const finalVenueAddress = changeVenue ? selectedVenue.address : request.venueAddress;

    const altProposal: AlternativeDateProposal = {
      proposedDateTime: finalDateTime,
      venueName: finalVenueName,
      venueAddress: finalVenueAddress,
      note: note.trim() || `I'd love to meet up, but could we do ${finalDateTime}${changeVenue ? ` at ${finalVenueName}` : ''} instead?`,
      proposedByUserId: currentUserId
    };

    audioHaptics.triggerSuccessCheck();
    speechService.speak(`Alternative date proposed to ${request.senderName} for ${finalDateTime}.`);
    onConfirmAlternative(request.id, altProposal);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="reschedule-modal-title"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
    >
      <div 
        id="reschedule-dating-request-modal"
        className="bg-neutral-900 border border-neutral-700 text-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col"
      >
        <div className="p-4 sm:p-5 border-b border-neutral-800 bg-neutral-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 id="reschedule-modal-title" className="text-base font-bold text-white">
                Propose Alternative Time or Venue
              </h3>
              <p className="text-xs text-neutral-400">
                Reschedule with {request.senderName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 text-xs sm:text-sm">
          {/* Current Request Summary */}
          <div className="bg-neutral-950 p-3 rounded-2xl border border-neutral-800">
            <p className="text-neutral-400 text-[11px]">Original Invitation:</p>
            <p className="font-bold text-white text-xs">{request.venueName}</p>
            <p className="text-neutral-300 text-xs mt-0.5">{request.proposedDateTime}</p>
          </div>

          {/* New Proposed Date & Time */}
          <div className="space-y-2">
            <label className="font-bold text-neutral-300 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Suggest a Different Date / Time:</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {ALTERNATIVE_TIMES.map(t => {
                const isSelected = proposedDateTime === t && !customDateTime;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setProposedDateTime(t);
                      setCustomDateTime('');
                      audioHaptics.triggerNavigationClick();
                    }}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500 text-black border-amber-400 font-bold'
                        : 'bg-neutral-950/60 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
            <input
              type="text"
              placeholder="Or custom time (e.g. Next Saturday at 4 PM)..."
              value={customDateTime}
              onChange={(e) => setCustomDateTime(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 rounded-2xl px-3.5 py-2 text-white text-xs outline-none"
            />
          </div>

          {/* Optional Venue Change Toggle */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-neutral-300">Also Suggest a Different Spot?</label>
              <button
                type="button"
                onClick={() => setChangeVenue(!changeVenue)}
                className="text-xs text-indigo-400 hover:underline cursor-pointer"
              >
                {changeVenue ? "Keep Original Venue" : "Change Venue"}
              </button>
            </div>

            {changeVenue && (
              <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                {ACCESSIBLE_VENUE_DATABASE.slice(0, 4).map(v => {
                  const isSel = selectedVenue.id === v.id;
                  return (
                    <div
                      key={v.id}
                      onClick={() => {
                        setSelectedVenue(v);
                        audioHaptics.triggerNavigationClick();
                      }}
                      className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer ${
                        isSel ? 'bg-neutral-950 border-amber-500 text-white' : 'bg-neutral-950/50 border-neutral-800 text-neutral-300'
                      }`}
                    >
                      <div>
                        <p className="font-bold text-xs">{v.name}</p>
                        <p className="text-[10px] text-neutral-400">{v.neighborhood} • {v.categoryLabel}</p>
                      </div>
                      {isSel && <Check className="w-4 h-4 text-amber-400" />}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Note */}
          <div className="space-y-1.5">
            <label className="font-bold text-neutral-300">Message to {request.senderName}:</label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="I'd love to meet up, but could we try this day/time instead?"
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 rounded-2xl p-3 text-white text-xs outline-none resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs cursor-pointer shadow-lg shadow-amber-950/40"
            >
              Send Reschedule Proposal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
