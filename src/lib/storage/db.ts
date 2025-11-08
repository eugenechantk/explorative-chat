/**
 * IndexedDB storage layer using Dexie
 * Designed to be easily replaceable with a server-side database later
 */

import Dexie, { type EntityTable } from 'dexie';
import type { Branch, Conversation, Message } from '../types';

class ExplorativeChatDB extends Dexie {
  branches!: EntityTable<Branch, 'id'>;
  conversations!: EntityTable<Conversation, 'id'>;
  messages!: EntityTable<Message, 'id'>;

  constructor() {
    super('ExplorativeChatDB');

    // Version 3: Clean schema without migration conflicts
    // (Skipping v1 and v2 to avoid table name conflicts from previous versions)
    this.version(3).stores({
      branches: 'id, conversationId, createdAt, updatedAt, position',
      conversations: 'id, createdAt, updatedAt',
      messages: 'id, branchId, timestamp',
    }).upgrade(async (trans) => {
      // Ensure all conversations have branchIds array
      const conversations = await trans.table('conversations').toArray();
      for (const conversation of conversations) {
        if (!conversation.branchIds) {
          await trans.table('conversations').update(conversation.id, {
            branchIds: [],
          });
        }
      }
    });
  }
}

// Check if IndexedDB is available (fails in Safari private mode and some mobile browsers)
function isIndexedDBAvailable(): boolean {
  try {
    if (typeof window === 'undefined') return false;
    if (!window.indexedDB) return false;

    // Try to open a test database
    const request = window.indexedDB.open('__test__');
    request.onerror = () => false;
    return true;
  } catch (e) {
    return false;
  }
}

export const db = new ExplorativeChatDB();

// Export availability checker
export const isStorageAvailable = isIndexedDBAvailable;
