import React from 'react';
import { Check, CheckCheck, Clock, ShieldCheck, Eye, CloudOff, RefreshCw, AlertCircle } from 'lucide-react';
import { Message, MessageDeliveryStatus } from '../../types/dating';

interface MessageStatusIndicatorProps {
  message: Message;
  participantName: string;
  onClickDetails?: (message: Message) => void;
  showTextLabel?: boolean;
}

export const MessageStatusIndicator: React.FC<MessageStatusIndicatorProps> = ({
  message,
  participantName,
  onClickDetails,
  showTextLabel = false
}) => {
  const status: MessageDeliveryStatus = message.status || (message.read ? 'read' : 'delivered');

  const getStatusContent = () => {
    switch (status) {
      case 'queued':
        return {
          icon: <CloudOff className="w-3 h-3 text-amber-400 animate-pulse" />,
          label: 'Queued (Offline Draft)',
          ariaLabel: 'Message saved locally in drafts. Will automatically sync when online connection is restored.',
          color: 'text-amber-400 font-semibold'
        };
      case 'syncing':
        return {
          icon: <RefreshCw className="w-3 h-3 text-indigo-400 animate-spin" />,
          label: 'Syncing...',
          ariaLabel: 'Message is auto-syncing now...',
          color: 'text-indigo-300'
        };
      case 'failed':
        return {
          icon: <AlertCircle className="w-3 h-3 text-rose-400" />,
          label: 'Failed to send',
          ariaLabel: 'Message failed to sync. Click to retry.',
          color: 'text-rose-400 font-semibold'
        };
      case 'sending':
        return {
          icon: <Clock className="w-3 h-3 text-indigo-300 animate-spin" />,
          label: 'Encrypting...',
          ariaLabel: 'Message is encrypting and sending',
          color: 'text-indigo-300'
        };
      case 'sent':
        return {
          icon: <Check className="w-3 h-3 text-neutral-300" />,
          label: 'Sent',
          ariaLabel: 'Message sent and encrypted with AES-256-GCM',
          color: 'text-neutral-300'
        };
      case 'delivered':
        return {
          icon: <CheckCheck className="w-3 h-3 text-neutral-300" />,
          label: 'Delivered',
          ariaLabel: `Message delivered to ${participantName}'s encrypted device${message.deliveredAt ? ` at ${message.deliveredAt}` : ''}`,
          color: 'text-neutral-300'
        };
      case 'read':
      default:
        return {
          icon: <CheckCheck className="w-3.5 h-3.5 text-cyan-300 drop-shadow-[0_0_4px_rgba(56,189,248,0.6)]" />,
          label: 'Seen',
          ariaLabel: `Message seen by ${participantName}${message.readAt ? ` at ${message.readAt}` : ''}`,
          color: 'text-cyan-200'
        };
    }
  };

  const { icon, label, ariaLabel, color } = getStatusContent();

  return (
    <button
      type="button"
      onClick={(e) => {
        if (onClickDetails) {
          e.stopPropagation();
          onClickDetails(message);
        }
      }}
      aria-label={ariaLabel}
      title={ariaLabel}
      className={`inline-flex items-center gap-1 cursor-pointer hover:opacity-100 transition-all select-none rounded-md px-1 py-0.5 hover:bg-black/30 ${color}`}
    >
      {icon}
      {showTextLabel && (
        <span className="text-[10px] font-medium tracking-tight">
          {label}
        </span>
      )}
    </button>
  );
};
