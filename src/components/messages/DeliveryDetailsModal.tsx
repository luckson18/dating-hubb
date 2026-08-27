import React from 'react';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  Check, 
  CheckCheck, 
  Smartphone, 
  Server, 
  KeyRound, 
  Clock, 
  Eye, 
  Sparkles,
  Timer
} from 'lucide-react';
import { Message, Conversation, MessageDeliveryStatus } from '../../types/dating';
import { audioHaptics } from '../../services/audioHaptics';

interface DeliveryDetailsModalProps {
  message: Message;
  conversation: Conversation;
  onClose: () => void;
}

export const DeliveryDetailsModal: React.FC<DeliveryDetailsModalProps> = ({
  message,
  conversation,
  onClose
}) => {
  const isMe = message.senderId === 'user-me';
  const participantName = conversation.participant.name;
  const status: MessageDeliveryStatus = message.status || (message.read ? 'read' : 'delivered');

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delivery-modal-title"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-neutral-900 border border-neutral-700 text-white rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 id="delivery-modal-title" className="text-sm sm:text-base font-bold text-white">
                Encrypted Delivery Report
              </h3>
              <p className="text-[11px] text-neutral-400 font-mono">
                End-to-End Cryptographic Verification
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              audioHaptics.triggerNavigationClick();
              onClose();
            }}
            aria-label="Close delivery details"
            className="p-1.5 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Preview Box */}
        <div className="bg-neutral-950/80 p-3.5 rounded-2xl border border-neutral-800 space-y-1.5">
          <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
            {isMe ? 'Your Sent Message' : `Message from ${participantName}`}
          </span>
          <p className="text-xs sm:text-sm text-neutral-200 line-clamp-3">
            {message.mediaType === 'voice' ? (
              <span className="italic flex items-center gap-1">
                🎙️ Voice Note: "{message.voiceTranscript || 'Voice recording'}"
              </span>
            ) : (
              message.text
            )}
          </p>
          <div className="text-[10px] font-mono text-neutral-400 flex items-center gap-1.5 pt-1">
            <Lock className="w-3 h-3 text-emerald-400" />
            <span>Cipher:</span>
            <code className="text-amber-300 truncate max-w-[240px]">
              {message.cipherPreview || 'aes-256-gcm:9f201b88e4...'}
            </code>
          </div>
        </div>

        {/* Delivery Timeline / Status Stepper */}
        <div className="space-y-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block">
            Delivery Lifecycle & Read Status
          </span>

          <div className="space-y-2.5">
            {/* Step 1: Encrypted & Sent */}
            <div className="flex items-start gap-3 p-2.5 rounded-xl bg-neutral-950/40 border border-neutral-800/80">
              <div className="w-7 h-7 rounded-xl bg-indigo-900/60 text-indigo-300 border border-indigo-500/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white">Encrypted & Sent</h4>
                  <span className="text-[10px] font-mono text-neutral-400">{message.timestamp}</span>
                </div>
                <p className="text-[11px] text-neutral-400">
                  Payload encrypted on client device with AES-256-GCM authenticated cipher.
                </p>
              </div>
            </div>

            {/* Step 2: Delivered */}
            <div className={`flex items-start gap-3 p-2.5 rounded-xl border ${
              status === 'delivered' || status === 'read'
                ? 'bg-neutral-950/40 border-neutral-800/80'
                : 'bg-neutral-950/20 border-neutral-800/40 opacity-50'
            }`}>
              <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                status === 'delivered' || status === 'read'
                  ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-500/40'
                  : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
              }`}>
                <Smartphone className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white">
                    Delivered to Device
                  </h4>
                  <span className="text-[10px] font-mono text-neutral-400">
                    {message.deliveredAt || (status === 'read' ? message.timestamp : 'Pending')}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400">
                  Received by {participantName}'s verified encrypted mobile client.
                </p>
              </div>
            </div>

            {/* Step 3: Seen / Read */}
            <div className={`flex items-start gap-3 p-2.5 rounded-xl border ${
              status === 'read'
                ? 'bg-cyan-950/40 border-cyan-500/40 ring-1 ring-cyan-500/20'
                : 'bg-neutral-950/20 border-neutral-800/40 opacity-50'
            }`}>
              <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                status === 'read'
                  ? 'bg-cyan-500 text-black font-bold shadow-[0_0_8px_rgba(6,182,212,0.6)]'
                  : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
              }`}>
                <Eye className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>Decrypted & Seen</span>
                    {status === 'read' && (
                      <span className="px-1.5 py-0.2 rounded-md bg-cyan-950 text-cyan-300 text-[9px] font-bold border border-cyan-500/40">
                        READ
                      </span>
                    )}
                  </h4>
                  <span className="text-[10px] font-mono text-cyan-300">
                    {message.readAt || (status === 'read' ? 'Seen' : 'Unread')}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-300">
                  {status === 'read'
                    ? `${participantName} opened the conversation and decrypted the message payload.`
                    : `${participantName} has not opened or read this message yet.`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Security Parameters Footer */}
        <div className="bg-neutral-950 p-3 rounded-2xl border border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-400">
          <div className="flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-mono text-neutral-300 truncate max-w-[170px]">
              {conversation.encryptionKeyFingerprint}
            </span>
          </div>
          {conversation.ephemeralMode && (
            <div className="flex items-center gap-1 text-amber-300 font-medium">
              <Timer className="w-3.5 h-3.5 text-amber-400" />
              <span>24h Ephemeral</span>
            </div>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={() => {
            audioHaptics.triggerNavigationClick();
            onClose();
          }}
          className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-2xl text-xs font-bold transition-colors border border-neutral-700 shadow-md"
        >
          Done
        </button>
      </div>
    </div>
  );
};
