/**
 * IndexedDB storage layer using Dexie
 * Designed to be easily replaceable with a server-side database later
 */

import Dexie, { type EntityTable } from 'dexie';
import type { Conversation, ConversationGroup, Message } from '../types';

class ExplorativeChatDB extends Dexie {
  conversations!: EntityTable<Conversation, 'id'>;
  groups!: EntityTable<ConversationGroup, 'id'>;
  messages!: EntityTable<Message, 'id'>;

  constructor() {
    super('ExplorativeChatDB');

    this.version(1).stores({
      conversations: 'id, groupId, createdAt, updatedAt, position',
      groups: 'id, createdAt, updatedAt',
      messages: 'id, conversationId, timestamp',
    });
  }
}

export const db = new ExplorativeChatDB();
