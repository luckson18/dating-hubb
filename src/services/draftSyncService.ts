import { MessageDraft, StatusDraft, SyncQueueItem, Message, StatusUpdate, SharedLocation } from '../types/dating';
import { audioHaptics } from './audioHaptics';
import { speechService } from './speechService';

const MSG_DRAFTS_STORAGE_KEY = 'hubb_message_drafts_v1';
const STATUS_DRAFTS_STORAGE_KEY = 'hubb_status_drafts_v1';
const SYNC_QUEUE_STORAGE_KEY = 'hubb_sync_queue_v1';
const SIMULATED_OFFLINE_KEY = 'hubb_simulated_offline_v1';

export type SyncEventType = 
  | 'network_change'
  | 'draft_saved'
  | 'draft_deleted'
  | 'item_queued'
  | 'sync_start'
  | 'sync_progress'
  | 'sync_complete'
  | 'sync_error';

export interface SyncServiceState {
  isOnline: boolean;
  isSimulatedOffline: boolean;
  queuedCount: number;
  messageDraftsCount: number;
  statusDraftsCount: number;
  totalDraftsCount: number;
  isSyncing: boolean;
  lastSyncedAt?: number;
}

type SyncListener = (state: SyncServiceState, eventType: SyncEventType, payload?: any) => void;

class DraftSyncService {
  private isSimulatedOffline: boolean = false;
  private isSyncing: boolean = false;
  private listeners: Set<SyncListener> = new Set();
  private lastSyncedAt?: number;

  constructor() {
    // Read persisted simulated offline flag
    try {
      const storedSim = localStorage.getItem(SIMULATED_OFFLINE_KEY);
      if (storedSim !== null) {
        this.isSimulatedOffline = JSON.parse(storedSim);
      }
    } catch (e) {
      console.warn('Failed to load simulated offline state', e);
    }

    // Bind browser online / offline event listeners
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleNetworkEvent(true));
      window.addEventListener('offline', () => this.handleNetworkEvent(false));
    }
  }

  // --- Network State ---
  public isOnline(): boolean {
    if (this.isSimulatedOffline) return false;
    if (typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean') {
      return navigator.onLine;
    }
    return true;
  }

  public getIsSimulatedOffline(): boolean {
    return this.isSimulatedOffline;
  }

  public setSimulatedOffline(offline: boolean) {
    this.isSimulatedOffline = offline;
    try {
      localStorage.setItem(SIMULATED_OFFLINE_KEY, JSON.stringify(offline));
    } catch (e) {
      console.warn('Failed to persist simulated offline state', e);
    }
    
    if (offline) {
      audioHaptics.triggerErrorShake();
      speechService.speak("Offline mode simulated. Messages and status drafts will be stored locally.");
    } else {
      audioHaptics.triggerSuccessChime();
      speechService.speak("Online connection restored. Auto-syncing pending items.");
    }

    this.notify('network_change');
  }

  private handleNetworkEvent(isBrowserOnline: boolean) {
    if (isBrowserOnline && !this.isSimulatedOffline) {
      audioHaptics.triggerSuccessChime();
      speechService.speak("Network connection restored. Auto-syncing pending offline content.");
    } else if (!isBrowserOnline) {
      audioHaptics.triggerErrorShake();
      speechService.speak("Device is offline. Content will be safely saved in local drafts.");
    }
    this.notify('network_change');
  }

  // --- State Snapshot ---
  public getState(): SyncServiceState {
    const msgDrafts = this.getAllMessageDrafts();
    const statusDrafts = this.getAllStatusDrafts();
    const queue = this.getQueuedItems();

    return {
      isOnline: this.isOnline(),
      isSimulatedOffline: this.isSimulatedOffline,
      queuedCount: queue.filter(q => q.status === 'pending' || q.status === 'syncing').length,
      messageDraftsCount: msgDrafts.length,
      statusDraftsCount: statusDrafts.length,
      totalDraftsCount: msgDrafts.length + statusDrafts.length,
      isSyncing: this.isSyncing,
      lastSyncedAt: this.lastSyncedAt
    };
  }

  public subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    listener(this.getState(), 'network_change');
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(eventType: SyncEventType, payload?: any) {
    const state = this.getState();
    this.listeners.forEach(cb => {
      try {
        cb(state, eventType, payload);
      } catch (e) {
        console.error('Error in DraftSyncService listener', e);
      }
    });
  }

  // ==========================================
  // --- MESSAGE DRAFTS ---
  // ==========================================
  public getAllMessageDrafts(): MessageDraft[] {
    try {
      const data = localStorage.getItem(MSG_DRAFTS_STORAGE_KEY);
      if (!data) return [];
      const parsed: MessageDraft[] = JSON.parse(data);
      return Array.isArray(parsed) ? parsed.sort((a, b) => b.updatedAt - a.updatedAt) : [];
    } catch (e) {
      console.warn('Failed to parse message drafts', e);
      return [];
    }
  }

  public getMessageDraft(conversationId: string): MessageDraft | null {
    const drafts = this.getAllMessageDrafts();
    return drafts.find(d => d.conversationId === conversationId && !d.isQueuedForSend) || null;
  }

  public saveMessageDraft(
    conversationId: string,
    recipientId: string,
    recipientName: string,
    recipientAvatar: string,
    text: string,
    extras?: {
      isVoice?: boolean;
      voiceTranscript?: string;
      location?: SharedLocation;
    }
  ): MessageDraft | null {
    if (!text.trim() && !extras?.location && !extras?.voiceTranscript) {
      // Empty text -> delete existing active draft if any
      this.clearMessageDraft(conversationId);
      return null;
    }

    const drafts = this.getAllMessageDrafts();
    const existingIndex = drafts.findIndex(d => d.conversationId === conversationId && !d.isQueuedForSend);

    const now = Date.now();
    const draft: MessageDraft = {
      id: existingIndex >= 0 ? drafts[existingIndex].id : `draft-msg-${now}-${Math.random().toString(36).substring(2, 6)}`,
      conversationId,
      recipientId,
      recipientName,
      recipientAvatar,
      text: text.trim(),
      isVoice: extras?.isVoice,
      voiceTranscript: extras?.voiceTranscript,
      location: extras?.location,
      updatedAt: now,
      createdAt: existingIndex >= 0 ? drafts[existingIndex].createdAt : now,
      isQueuedForSend: false
    };

    if (existingIndex >= 0) {
      drafts[existingIndex] = draft;
    } else {
      drafts.unshift(draft);
    }

    this.persistMessageDrafts(drafts);
    this.notify('draft_saved', draft);
    return draft;
  }

  public clearMessageDraft(conversationId: string) {
    const drafts = this.getAllMessageDrafts();
    const filtered = drafts.filter(d => d.conversationId !== conversationId || d.isQueuedForSend);
    if (filtered.length !== drafts.length) {
      this.persistMessageDrafts(filtered);
      this.notify('draft_deleted', { conversationId });
    }
  }

  public deleteMessageDraft(draftId: string) {
    const drafts = this.getAllMessageDrafts();
    const filtered = drafts.filter(d => d.id !== draftId);
    this.persistMessageDrafts(filtered);
    this.notify('draft_deleted', { draftId });
  }

  private persistMessageDrafts(drafts: MessageDraft[]) {
    try {
      localStorage.setItem(MSG_DRAFTS_STORAGE_KEY, JSON.stringify(drafts));
    } catch (e) {
      console.error('Failed to persist message drafts', e);
    }
  }

  // ==========================================
  // --- STATUS DRAFTS ---
  // ==========================================
  public getAllStatusDrafts(): StatusDraft[] {
    try {
      const data = localStorage.getItem(STATUS_DRAFTS_STORAGE_KEY);
      if (!data) return [];
      const parsed: StatusDraft[] = JSON.parse(data);
      return Array.isArray(parsed) ? parsed.sort((a, b) => b.updatedAt - a.updatedAt) : [];
    } catch (e) {
      console.warn('Failed to parse status drafts', e);
      return [];
    }
  }

  public getLatestStatusDraft(): StatusDraft | null {
    const drafts = this.getAllStatusDrafts();
    return drafts.find(d => !d.isQueuedForPublish) || (drafts.length > 0 ? drafts[0] : null);
  }

  public saveStatusDraft(draftInput: Omit<StatusDraft, 'id' | 'updatedAt' | 'createdAt'> & { id?: string }): StatusDraft {
    const drafts = this.getAllStatusDrafts();
    const now = Date.now();
    const id = draftInput.id || `draft-status-${now}`;
    
    const existingIndex = drafts.findIndex(d => d.id === id);
    const draft: StatusDraft = {
      ...draftInput,
      id,
      updatedAt: now,
      createdAt: existingIndex >= 0 ? drafts[existingIndex].createdAt : now,
      isQueuedForPublish: draftInput.isQueuedForPublish || false
    };

    if (existingIndex >= 0) {
      drafts[existingIndex] = draft;
    } else {
      drafts.unshift(draft);
    }

    this.persistStatusDrafts(drafts);
    this.notify('draft_saved', draft);
    return draft;
  }

  public deleteStatusDraft(draftId: string) {
    const drafts = this.getAllStatusDrafts();
    const filtered = drafts.filter(d => d.id !== draftId);
    this.persistStatusDrafts(filtered);
    this.notify('draft_deleted', { draftId });
  }

  public clearAllStatusDrafts() {
    this.persistStatusDrafts([]);
    this.notify('draft_deleted', { all: true });
  }

  private persistStatusDrafts(drafts: StatusDraft[]) {
    try {
      localStorage.setItem(STATUS_DRAFTS_STORAGE_KEY, JSON.stringify(drafts));
    } catch (e) {
      console.error('Failed to persist status drafts', e);
    }
  }

  // ==========================================
  // --- OFFLINE SYNC QUEUE ---
  // ==========================================
  public getQueuedItems(): SyncQueueItem[] {
    try {
      const data = localStorage.getItem(SYNC_QUEUE_STORAGE_KEY);
      if (!data) return [];
      const parsed: SyncQueueItem[] = JSON.parse(data);
      return Array.isArray(parsed) ? parsed.sort((a, b) => a.queuedAt - b.queuedAt) : [];
    } catch (e) {
      console.warn('Failed to parse sync queue', e);
      return [];
    }
  }

  public queueMessage(
    conversationId: string,
    recipient: { id: string; name: string; avatar: string },
    message: Message
  ): SyncQueueItem {
    const queue = this.getQueuedItems();
    const now = Date.now();

    const queueItem: SyncQueueItem = {
      id: `queue-msg-${message.id}`,
      type: 'message',
      targetId: conversationId,
      payload: {
        conversationId,
        recipient,
        message: {
          ...message,
          status: 'queued'
        }
      },
      queuedAt: now,
      retryCount: 0,
      status: 'pending'
    };

    queue.push(queueItem);
    this.persistSyncQueue(queue);

    // Also mark active draft as cleared for this conversation
    this.clearMessageDraft(conversationId);

    audioHaptics.triggerMessageSent();
    this.notify('item_queued', queueItem);
    return queueItem;
  }

  public queueStatusUpdate(
    statusData: Omit<StatusUpdate, 'id' | 'createdAt' | 'likesCount'>
  ): { queueItem: SyncQueueItem; temporaryStatus: StatusUpdate } {
    const queue = this.getQueuedItems();
    const now = Date.now();
    const tempId = `status-queued-${now}`;

    const temporaryStatus: StatusUpdate = {
      ...statusData,
      id: tempId,
      createdAt: 'Queued (Offline)',
      likesCount: 0
    };

    const queueItem: SyncQueueItem = {
      id: `queue-status-${tempId}`,
      type: 'status_update',
      targetId: tempId,
      payload: {
        status: temporaryStatus
      },
      queuedAt: now,
      retryCount: 0,
      status: 'pending'
    };

    queue.push(queueItem);
    this.persistSyncQueue(queue);

    // Clear any temporary draft
    this.clearAllStatusDrafts();

    audioHaptics.triggerMessageSent();
    this.notify('item_queued', queueItem);
    return { queueItem, temporaryStatus };
  }

  public removeQueuedItem(id: string) {
    const queue = this.getQueuedItems();
    const filtered = queue.filter(q => q.id !== id);
    this.persistSyncQueue(filtered);
    this.notify('draft_deleted', { queuedId: id });
  }

  public clearEntireQueue() {
    this.persistSyncQueue([]);
    this.notify('draft_deleted', { allQueue: true });
  }

  private persistSyncQueue(queue: SyncQueueItem[]) {
    try {
      localStorage.setItem(SYNC_QUEUE_STORAGE_KEY, JSON.stringify(queue));
    } catch (e) {
      console.error('Failed to persist sync queue', e);
    }
  }

  // ==========================================
  // --- AUTO-SYNC ENGINE ---
  // ==========================================
  public async syncAllPending(
    onSyncMessage: (conversationId: string, message: Message) => void,
    onSyncStatus: (status: StatusUpdate) => void
  ): Promise<{ syncedCount: number; errors: string[] }> {
    if (this.isSyncing) return { syncedCount: 0, errors: [] };
    if (!this.isOnline()) {
      return { syncedCount: 0, errors: ['Device is currently offline'] };
    }

    const queue = this.getQueuedItems();
    const pendingItems = queue.filter(q => q.status === 'pending' || q.status === 'failed');

    if (pendingItems.length === 0) {
      return { syncedCount: 0, errors: [] };
    }

    this.isSyncing = true;
    this.notify('sync_start', { total: pendingItems.length });

    let syncedCount = 0;
    const errors: string[] = [];

    for (const item of pendingItems) {
      try {
        // Mark syncing in UI
        item.status = 'syncing';
        this.persistSyncQueue(queue);
        this.notify('sync_progress', { currentItem: item });

        // Simulate network roundtrip latency (300ms)
        await new Promise(r => setTimeout(r, 300));

        if (item.type === 'message') {
          const { conversationId, message } = item.payload;
          const syncedMsg: Message = {
            ...message,
            status: 'sent',
            timestamp: 'Just now',
            deliveredAt: undefined
          };
          onSyncMessage(conversationId, syncedMsg);
          syncedCount++;
        } else if (item.type === 'status_update') {
          const { status } = item.payload;
          const syncedStatus: StatusUpdate = {
            ...status,
            id: `status-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
            createdAt: 'Just now'
          };
          onSyncStatus(syncedStatus);
          syncedCount++;
        }

        // Remove synced item from queue
        item.status = 'synced';
      } catch (err: any) {
        item.status = 'failed';
        item.retryCount = (item.retryCount || 0) + 1;
        item.error = err?.message || 'Sync failed';
        errors.push(item.error || 'Unknown error');
      }
    }

    // Clean out successfully synced items
    const remainingQueue = queue.filter(q => q.status !== 'synced');
    this.persistSyncQueue(remainingQueue);

    this.isSyncing = false;
    this.lastSyncedAt = Date.now();

    if (syncedCount > 0) {
      audioHaptics.triggerSuccessChime();
      speechService.speak(`Auto-sync complete. ${syncedCount} item${syncedCount > 1 ? 's' : ''} sent.`);
    }

    this.notify('sync_complete', { syncedCount, errors });
    return { syncedCount, errors };
  }
}

export const draftSyncService = new DraftSyncService();
