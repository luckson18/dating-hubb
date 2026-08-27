import React, { useState } from 'react';
import { X, HeartCrack, MessageSquare, Check, ShieldAlert } from 'lucide-react';
import { DatingRequest } from '../../types/dating';
import { audioHaptics } from '../../services/audioHaptics';
import { speechService } from '../../services/speechService';

interface DeclineRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: DatingRequest;
  onConfirmDecline: (requestId: string, reasonNote?: string) => void;
}

const COURTEOUS_DECLINE_TEMPLATES = [
  "Thank you for the thoughtful invite! My calendar is currently super full, but I appreciate you reaching out.",
  "Thanks for asking! I'd feel more comfortable chatting a bit more here on hubb before meeting in person.",
  "I don't think we're quite the right match for dating, but I truly appreciate your kind invitation and wish you the best!",
  "I'm not able to make this date work, but thank you for thinking of me!"
];

export const DeclineRequestModal: React.FC<DeclineRequestModalProps> = ({
  isOpen,
  onClose,
  request,
  onConfirmDecline,
}) => {
  if (!isOpen) return null;

  const [selectedTemplate, setSelectedTemplate] = useState<string>(COURTEOUS_DECLINE_TEMPLATES[0]);
  const [customNote, setCustomNote] = useState('');
  const [useCustom, setUseCustom] = useState(false);

  const handleDecline = () => {
    const finalReason = useCustom && customNote.trim() ? customNote.trim() : selectedTemplate;
    audioHaptics.triggerRecallInterest();
    speechService.speak(`Date invitation from ${request.senderName} declined respectfully.`);
    onConfirmDecline(request.id, finalReason);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="decline-modal-title"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
    >
      <div 
        id="decline-dating-request-modal"
        className="bg-neutral-900 border border-neutral-700 text-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-800 bg-neutral-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-300">
              <HeartCrack className="w-5 h-5 text-neutral-400" />
            </div>
            <div>
              <h3 id="decline-modal-title" className="text-base font-bold text-white">
                Decline Date Invitation
              </h3>
              <p className="text-xs text-neutral-400">
                Send a polite, no-pressure note to {request.senderName}
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

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 text-xs sm:text-sm">
          <div className="bg-neutral-950 p-3.5 rounded-2xl border border-neutral-800 flex items-center gap-3">
            <img
              src={request.senderAvatar}
              alt={request.senderName}
              className="w-10 h-10 rounded-full object-cover border border-neutral-700"
              referrerPolicy="no-referrer"
            />
            <div>
              <p className="font-bold text-white text-xs">{request.senderName}’s Invitation</p>
              <p className="text-[11px] text-neutral-400">{request.title} • {request.proposedDateTime}</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="font-bold text-neutral-300">Select a Courteous Pre-written Note:</label>
            <div className="space-y-2">
              {COURTEOUS_DECLINE_TEMPLATES.map((tmpl, idx) => {
                const isSelected = !useCustom && selectedTemplate === tmpl;
                return (
                  <div
                    key={idx}
                    onClick={() => {
                      setSelectedTemplate(tmpl);
                      setUseCustom(false);
                      audioHaptics.triggerNavigationClick();
                    }}
                    className={`p-3 rounded-2xl border text-xs leading-relaxed cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-neutral-800 border-indigo-500 text-white font-medium ring-1 ring-indigo-500/50'
                        : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    "{tmpl}"
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-neutral-300">Or Write Custom Note:</label>
              <button
                type="button"
                onClick={() => setUseCustom(!useCustom)}
                className="text-xs text-indigo-400 hover:underline"
              >
                {useCustom ? "Use Templates" : "Write Custom"}
              </button>
            </div>
            {useCustom && (
              <textarea
                rows={2}
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="Write your custom polite response..."
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-indigo-500 rounded-2xl p-3 text-white text-xs outline-none resize-none"
              />
            )}
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-xs cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDecline}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer shadow-lg shadow-rose-950/40 transition-colors"
            >
              Confirm Decline
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
