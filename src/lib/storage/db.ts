/**
 * AsyncStorage storage layer for React Native
 * Designed to be easily replaceable with a server-side database later
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Branch, Conversation, Message } from '../types';

const STORAGE_KEYS = {
  CONVERSATIONS: '@explorative-chat:conversations',
  BRANCHES: '@explorative-chat:branches',
  MESSAGES: '@explorative-chat:messages',
};

// Check if AsyncStorage is available
function isAsyncStorageAvailable(): boolean {
  try {
    return AsyncStorage !== undefined;
  } catch (e) {
    return false;
  }
}

// Storage class to match the IndexedDB interface
class ExplorativeChatStorage {
  async getConversations(): Promise<Conversation[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading conversations:', error);
      return [];
    }
  }

  async setConversations(conversations: Conversation[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
    } catch (error) {
      console.error('Error saving conversations:', error);
      throw error;
    }
  }

  async getBranches(): Promise<Branch[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.BRANCHES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading branches:', error);
      return [];
    }
  }

  async setBranches(branches: Branch[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.BRANCHES, JSON.stringify(branches));
    } catch (error) {
      console.error('Error saving branches:', error);
      throw error;
    }
  }

  async getMessages(): Promise<Message[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.MESSAGES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading messages:', error);
      return [];
    }
  }

  async setMessages(messages: Message[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
    } catch (error) {
      console.error('Error saving messages:', error);
      throw error;
    }
  }

  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.CONVERSATIONS,
        STORAGE_KEYS.BRANCHES,
        STORAGE_KEYS.MESSAGES,
      ]);
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  }
}

export const db = new ExplorativeChatStorage();

// Export availability checker
export const isStorageAvailable = isAsyncStorageAvailable;
