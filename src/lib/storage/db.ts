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
    });
  }
}

export const db = new ExplorativeChatDB();
