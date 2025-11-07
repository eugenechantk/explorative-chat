/**
 * Storage operations abstraction layer
 * This layer can be swapped out for server-side database operations later
 */

import { db } from './db';
import type { Conversation, ConversationGroup, Message } from '../types';

// ========== GROUP OPERATIONS ==========

export async function createGroup(group: ConversationGroup): Promise<ConversationGroup> {
  await db.groups.add(group);
  return group;
}

export async function getGroup(groupId: string): Promise<ConversationGroup | undefined> {
  return await db.groups.get(groupId);
}

export async function getAllGroups(): Promise<ConversationGroup[]> {
  return await db.groups.orderBy('updatedAt').reverse().toArray();
}

export async function updateGroup(groupId: string, updates: Partial<ConversationGroup>): Promise<void> {
  await db.groups.update(groupId, { ...updates, updatedAt: Date.now() });
}

export async function deleteGroup(groupId: string): Promise<void> {
  // Delete all conversations in the group
  const conversations = await getConversationsByGroup(groupId);
  for (const conversation of conversations) {
    await deleteConversation(conversation.id);
  }
  await db.groups.delete(groupId);
}

// ========== CONVERSATION OPERATIONS ==========

export async function createConversation(conversation: Conversation): Promise<Conversation> {
  await db.conversations.add(conversation);
  return conversation;
}

export async function getConversation(conversationId: string): Promise<Conversation | undefined> {
  return await db.conversations.get(conversationId);
}

export async function getConversationsByGroup(groupId: string): Promise<Conversation[]> {
  return await db.conversations
    .where('groupId')
    .equals(groupId)
    .sortBy('position');
}

export async function updateConversation(conversationId: string, updates: Partial<Conversation>): Promise<void> {
  await db.conversations.update(conversationId, { ...updates, updatedAt: Date.now() });
}

export async function deleteConversation(conversationId: string): Promise<void> {
  // Delete all messages in the conversation
  await db.messages.where('conversationId').equals(conversationId).delete();
  await db.conversations.delete(conversationId);
}

// ========== MESSAGE OPERATIONS ==========

export async function createMessage(message: Message): Promise<Message> {
  await db.messages.add(message);
  return message;
}

export async function getMessagesByConversation(conversationId: string): Promise<Message[]> {
  return await db.messages
    .where('conversationId')
    .equals(conversationId)
    .sortBy('timestamp');
}

export async function updateMessage(messageId: string, updates: Partial<Message>): Promise<void> {
  await db.messages.update(messageId, updates);
}

export async function deleteMessage(messageId: string): Promise<void> {
  await db.messages.delete(messageId);
}

// ========== UTILITY FUNCTIONS ==========

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export async function exportData(): Promise<{
  groups: ConversationGroup[];
  conversations: Conversation[];
  messages: Message[];
}> {
  return {
    groups: await db.groups.toArray(),
    conversations: await db.conversations.toArray(),
    messages: await db.messages.toArray(),
  };
}

export async function importData(data: {
  groups: ConversationGroup[];
  conversations: Conversation[];
  messages: Message[];
}): Promise<void> {
  await db.transaction('rw', [db.groups, db.conversations, db.messages], async () => {
    await db.groups.bulkAdd(data.groups);
    await db.conversations.bulkAdd(data.conversations);
    await db.messages.bulkAdd(data.messages);
  });
}
