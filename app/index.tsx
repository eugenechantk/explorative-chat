import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Conversation, Branch } from '../src/lib/types';
import {
  createConversation,
  createBranch,
  getAllConversations,
  getBranchesByConversation,
  deleteConversation,
  generateId,
} from '../src/lib/storage/operations';
import { isStorageAvailable } from '../src/lib/storage/db';

export default function Home() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [activeBranches, setActiveBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      const allConversations = await getAllConversations();
      setConversations(allConversations);

      if (allConversations.length > 0 && !activeConversation) {
        await selectConversation(allConversations[0]);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      Alert.alert('Error', 'Failed to load conversations');
    } finally {
      setIsLoading(false);
    }
  };

  const selectConversation = async (conversation: Conversation) => {
    try {
      const branches = await getBranchesByConversation(conversation.id);
      setActiveConversation(conversation);
      setActiveBranches(branches);
    } catch (error) {
      console.error('Error loading branches:', error);
      Alert.alert('Error', 'Failed to load conversation');
    }
  };

  const handleCreateConversation = async () => {
    if (isCreating) return;

    try {
      setIsCreating(true);

      const conversationId = generateId();
      const branchId = generateId();

      const newConversation: Conversation = {
        id: conversationId,
        branchIds: [branchId],
        name: 'New Conversation',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const newBranch: Branch = {
        id: branchId,
        conversationId,
        messages: [],
        model: 'anthropic/claude-3.5-sonnet',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        position: 0,
      };

      await createConversation(newConversation);
      await createBranch(newBranch);
      await loadConversations();
      await selectConversation(newConversation);
    } catch (error) {
      console.error('Error creating conversation:', error);
      Alert.alert('Error', 'Failed to create conversation');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      await deleteConversation(conversationId);
      await loadConversations();
      if (activeConversation?.id === conversationId) {
        setActiveConversation(null);
        setActiveBranches([]);
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      Alert.alert('Error', 'Failed to delete conversation');
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-black items-center justify-center">
        <ActivityIndicator size="large" color="#ffffff" />
        <Text className="text-white mt-4 font-mono text-sm">LOADING...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar style="light" />

      {/* Header */}
      <View className="border-b border-zinc-800 bg-zinc-950 px-3 py-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-white font-mono text-base font-bold">EXPLORATIVE CHAT</Text>
          <TouchableOpacity
            onPress={handleCreateConversation}
            disabled={isCreating}
            className="px-3 py-2 bg-zinc-900 border border-zinc-700 flex-row items-center"
          >
            {isCreating ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <Text className="text-white font-mono text-sm">+</Text>
                <Text className="text-white font-mono text-sm ml-2">NEW</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View className="flex-1 flex-row">
        {/* Sidebar */}
        <View className="w-72 border-r border-zinc-800 bg-black">
          <ScrollView>
            {conversations.length === 0 ? (
              <View className="p-4 items-center">
                <Text className="text-zinc-600 font-mono text-xs text-center">
                  NO CONVERSATIONS
                </Text>
                <Text className="text-zinc-700 font-mono text-xs text-center mt-2">
                  CREATE ONE TO START
                </Text>
              </View>
            ) : (
              conversations.map((conversation) => (
                <TouchableOpacity
                  key={conversation.id}
                  onPress={() => selectConversation(conversation)}
                  onLongPress={() => {
                    Alert.alert(
                      'Delete Conversation',
                      'Are you sure you want to delete this conversation?',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: 'Delete',
                          style: 'destructive',
                          onPress: () => handleDeleteConversation(conversation.id),
                        },
                      ]
                    );
                  }}
                  className={`px-3 py-3 border-b border-zinc-800 ${
                    activeConversation?.id === conversation.id ? 'bg-zinc-900' : ''
                  }`}
                >
                  <Text
                    className="text-white font-mono text-sm"
                    numberOfLines={1}
                  >
                    {conversation.name || 'Untitled'}
                  </Text>
                  <Text className="text-zinc-600 font-mono text-xs mt-1">
                    {conversation.branchIds.length} {conversation.branchIds.length === 1 ? 'branch' : 'branches'}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>

        {/* Main Content */}
        <View className="flex-1 bg-black">
          {activeConversation ? (
            <View className="flex-1 items-center justify-center">
              <Text className="text-zinc-600 font-mono text-sm">
                CONVERSATION: {activeConversation.name}
              </Text>
              <Text className="text-zinc-700 font-mono text-xs mt-2">
                {activeBranches.length} {activeBranches.length === 1 ? 'branch' : 'branches'} loaded
              </Text>
              <Text className="text-zinc-800 font-mono text-xs mt-4 text-center px-4">
                Full chat UI components are being migrated to React Native.{'\n'}
                This is a minimal working version demonstrating the core structure.
              </Text>
            </View>
          ) : (
            <View className="flex-1 items-center justify-center">
              <Text className="text-zinc-600 font-mono text-sm">NO ACTIVE CONVERSATION</Text>
              <Text className="text-zinc-700 font-mono text-xs mt-2">
                CREATE OR SELECT ONE TO START
              </Text>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
