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

    // Version 1: Original schema
    this.version(1).stores({
      conversations: 'id, groupId, createdAt, updatedAt, position',
      groups: 'id, createdAt, updatedAt',
      messages: 'id, conversationId, timestamp',
    });

    // Version 2: Renamed tables and fields (Group → Conversation, Conversation → Branch)
    this.version(2).stores({
      branches: 'id, conversationId, createdAt, updatedAt, position',
      conversations: 'id, createdAt, updatedAt',
      messages: 'id, branchId, timestamp',
      // Remove old tables
      groups: null,
    }).upgrade(async (trans) => {
      // Only migrate if there's data in the old schema
      const oldGroups = await trans.table('groups').toArray();

      // If no old data exists, skip migration (new user)
      if (oldGroups.length === 0) {
        return;
      }

      const oldConversations = await trans.table('conversations').toArray();
      const oldMessages = await trans.table('messages').toArray();

      // Migrate groups → conversations
      for (const group of oldGroups) {
        await trans.table('conversations').add({
          id: group.id,
          branchIds: group.conversationIds || [],
          name: group.name,
          tags: group.tags,
          createdAt: group.createdAt,
          updatedAt: group.updatedAt,
        });
      }

      // Migrate conversations → branches
      for (const conversation of oldConversations) {
        await trans.table('branches').add({
          id: conversation.id,
          conversationId: conversation.groupId,
          messages: conversation.messages || [],
          model: conversation.model,
          title: conversation.title,
          createdAt: conversation.createdAt,
          updatedAt: conversation.updatedAt,
          position: conversation.position,
          initialInput: conversation.initialInput,
          mentionedTexts: conversation.mentionedTexts,
        });
      }

      // Migrate messages (update conversationId → branchId)
      for (const message of oldMessages) {
        await trans.table('messages').add({
          id: message.id,
          branchId: message.conversationId,
          role: message.role,
          content: message.content,
          timestamp: message.timestamp,
          branchSourceBranchId: message.branchSourceConversationId,
          branchSourceMessageId: message.branchSourceMessageId,
          branchSelectedText: message.branchSelectedText,
        });
      }
    });
  }
}

export const db = new ExplorativeChatDB();
