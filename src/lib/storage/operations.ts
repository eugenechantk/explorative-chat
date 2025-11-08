/**
 * Storage operations abstraction layer
 * This layer can be swapped out for server-side database operations later
 */

import { db } from './db';
import type { Branch, Conversation, Message } from '../types';

// ========== CONVERSATION OPERATIONS ==========

export async function createConversation(conversation: Conversation): Promise<Conversation> {
  await db.conversations.add(conversation);
  return conversation;
}

export async function getConversation(conversationId: string): Promise<Conversation | undefined> {
  return await db.conversations.get(conversationId);
}

export async function getAllConversations(): Promise<Conversation[]> {
  return await db.conversations.orderBy('updatedAt').reverse().toArray();
}

export async function updateConversation(conversationId: string, updates: Partial<Conversation>): Promise<void> {
  await db.conversations.update(conversationId, { ...updates, updatedAt: Date.now() });
}

export async function deleteConversation(conversationId: string): Promise<void> {
  // Delete all branches in the conversation
  const branches = await getBranchesByConversation(conversationId);
  for (const branch of branches) {
    await deleteBranch(branch.id);
  }
  await db.conversations.delete(conversationId);
}

// ========== BRANCH OPERATIONS ==========

export async function createBranch(branch: Branch): Promise<Branch> {
  await db.branches.add(branch);
  return branch;
}

export async function getBranch(branchId: string): Promise<Branch | undefined> {
  return await db.branches.get(branchId);
}

export async function getBranchesByConversation(conversationId: string): Promise<Branch[]> {
  return await db.branches
    .where('conversationId')
    .equals(conversationId)
    .sortBy('position');
}

export async function updateBranch(branchId: string, updates: Partial<Branch>): Promise<void> {
  await db.branches.update(branchId, { ...updates, updatedAt: Date.now() });
}

export async function deleteBranch(branchId: string): Promise<void> {
  // Delete all messages in the branch
  await db.messages.where('branchId').equals(branchId).delete();
  await db.branches.delete(branchId);
}

// ========== MESSAGE OPERATIONS ==========

export async function createMessage(message: Message): Promise<Message> {
  await db.messages.add(message);
  return message;
}

export async function getMessagesByBranch(branchId: string): Promise<Message[]> {
  return await db.messages
    .where('branchId')
    .equals(branchId)
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
  conversations: Conversation[];
  branches: Branch[];
  messages: Message[];
}> {
  return {
    conversations: await db.conversations.toArray(),
    branches: await db.branches.toArray(),
    messages: await db.messages.toArray(),
  };
}

export async function importData(data: {
  conversations: Conversation[];
  branches: Branch[];
  messages: Message[];
}): Promise<void> {
  await db.conversations.bulkAdd(data.conversations);
  await db.branches.bulkAdd(data.branches);
  await db.messages.bulkAdd(data.messages);
}

export async function clearAllData(): Promise<void> {
  await db.conversations.clear();
  await db.branches.clear();
  await db.messages.clear();
}
