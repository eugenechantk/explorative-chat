/**
 * Storage operations abstraction layer
 * This layer can be swapped out for server-side database operations later
 */

import { db } from './db';
import type { Branch, Conversation, Message } from '../types';

// ========== CONVERSATION OPERATIONS ==========

export async function createConversation(conversation: Conversation): Promise<Conversation> {
  const conversations = await db.getConversations();
  conversations.push(conversation);
  await db.setConversations(conversations);
  return conversation;
}

export async function getConversation(conversationId: string): Promise<Conversation | undefined> {
  const conversations = await db.getConversations();
  return conversations.find(c => c.id === conversationId);
}

export async function getAllConversations(): Promise<Conversation[]> {
  const conversations = await db.getConversations();
  return conversations.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function updateConversation(conversationId: string, updates: Partial<Conversation>): Promise<void> {
  const conversations = await db.getConversations();
  const index = conversations.findIndex(c => c.id === conversationId);
  if (index !== -1) {
    conversations[index] = { ...conversations[index], ...updates, updatedAt: Date.now() };
    await db.setConversations(conversations);
  }
}

export async function deleteConversation(conversationId: string): Promise<void> {
  // Delete all branches in the conversation
  const branches = await getBranchesByConversation(conversationId);
  for (const branch of branches) {
    await deleteBranch(branch.id);
  }

  const conversations = await db.getConversations();
  const filtered = conversations.filter(c => c.id !== conversationId);
  await db.setConversations(filtered);
}

// ========== BRANCH OPERATIONS ==========

export async function createBranch(branch: Branch): Promise<Branch> {
  const branches = await db.getBranches();
  branches.push(branch);
  await db.setBranches(branches);
  return branch;
}

export async function getBranch(branchId: string): Promise<Branch | undefined> {
  const branches = await db.getBranches();
  return branches.find(b => b.id === branchId);
}

export async function getBranchesByConversation(conversationId: string): Promise<Branch[]> {
  const branches = await db.getBranches();
  return branches
    .filter(b => b.conversationId === conversationId)
    .sort((a, b) => a.position - b.position);
}

export async function updateBranch(branchId: string, updates: Partial<Branch>): Promise<void> {
  const branches = await db.getBranches();
  const index = branches.findIndex(b => b.id === branchId);
  if (index !== -1) {
    branches[index] = { ...branches[index], ...updates, updatedAt: Date.now() };
    await db.setBranches(branches);
  }
}

export async function deleteBranch(branchId: string): Promise<void> {
  // Delete all messages in the branch
  const messages = await db.getMessages();
  const filteredMessages = messages.filter(m => m.branchId !== branchId);
  await db.setMessages(filteredMessages);

  const branches = await db.getBranches();
  const filtered = branches.filter(b => b.id !== branchId);
  await db.setBranches(filtered);
}

// ========== MESSAGE OPERATIONS ==========

export async function createMessage(message: Message): Promise<Message> {
  const messages = await db.getMessages();
  messages.push(message);
  await db.setMessages(messages);
  return message;
}

export async function getMessagesByBranch(branchId: string): Promise<Message[]> {
  const messages = await db.getMessages();
  return messages
    .filter(m => m.branchId === branchId)
    .sort((a, b) => a.timestamp - b.timestamp);
}

export async function updateMessage(messageId: string, updates: Partial<Message>): Promise<void> {
  const messages = await db.getMessages();
  const index = messages.findIndex(m => m.id === messageId);
  if (index !== -1) {
    messages[index] = { ...messages[index], ...updates };
    await db.setMessages(messages);
  }
}

export async function deleteMessage(messageId: string): Promise<void> {
  const messages = await db.getMessages();
  const filtered = messages.filter(m => m.id !== messageId);
  await db.setMessages(filtered);
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
    conversations: await db.getConversations(),
    branches: await db.getBranches(),
    messages: await db.getMessages(),
  };
}

export async function importData(data: {
  conversations: Conversation[];
  branches: Branch[];
  messages: Message[];
}): Promise<void> {
  await db.setConversations(data.conversations);
  await db.setBranches(data.branches);
  await db.setMessages(data.messages);
}

export async function clearAllData(): Promise<void> {
  await db.clearAll();
}
