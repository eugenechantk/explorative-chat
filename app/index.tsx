import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Conversation, Branch } from '../src/lib/types';
import { GroupView } from '../src/components/GroupView.native';
import {
  createConversation,
  createBranch,
  getAllConversations,
  getBranchesByConversation,
  deleteConversation,
  generateId,
} from '../src/lib/storage/operations';
import { isStorageAvailable } from '../src/lib/storage/db';
import { Menu, X, Plus } from 'lucide-react-native';

export default function Home() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [activeBranches, setActiveBranches] = useState<Branch[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

      if (activeConversation) {
        const updatedActive = allConversations.find(c => c.id === activeConversation.id);
        if (updatedActive) {
          setActiveConversation(updatedActive);
        }
      } else if (allConversations.length > 0) {
        await selectConversation(allConversations[0]);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      Alert.alert('Error', 'Failed to load conversations');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshConversationTitle = async (conversationId: string) => {
    try {
      await loadConversations();
    } catch (error) {
      console.error('Error refreshing conversation title:', error);
    }
  };

  const selectConversation = async (conversation: Conversation) => {
    try {
      const branches = await getBranchesByConversation(conversation.id);
      setActiveConversation(conversation);
      setActiveBranches(branches);
      setSidebarOpen(false);
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
    Alert.alert(
      'Delete Conversation',
      'Are you sure you want to delete this conversation and all its branches?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
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
          },
        },
      ]
    );
  };

  const handleGroupUpdate = async (group: Conversation, branches: Branch[]) => {
    setActiveBranches(branches);
    await loadConversations();
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
          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              onPress={() => setSidebarOpen(!sidebarOpen)}
              className="p-2"
            >
              <Menu size={20} color="#ffffff" />
            </TouchableOpacity>
            <Text className="text-white font-mono text-base font-bold">
              {activeConversation?.name || 'EXPLORATIVE CHAT'}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleCreateConversation}
            disabled={isCreating}
            className="px-3 py-2 bg-zinc-900 border border-zinc-700 flex-row items-center"
          >
            {isCreating ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <Plus size={14} color="#ffffff" />
                <Text className="text-white font-mono text-sm ml-2">NEW</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View className="flex-1 flex-row">
        {/* Sidebar Modal (Mobile) */}
        <Modal
          visible={sidebarOpen}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setSidebarOpen(false)}
        >
          <View className="flex-1 flex-row">
            <View className="flex-1 bg-black border-r border-zinc-800">
              {/* Sidebar Header */}
              <View className="border-b border-zinc-800 bg-zinc-950 px-3 py-3 flex-row items-center justify-between">
                <Text className="text-white font-mono text-sm font-bold">CONVERSATIONS</Text>
                <TouchableOpacity onPress={() => setSidebarOpen(false)}>
                  <X size={20} color="#ffffff" />
                </TouchableOpacity>
              </View>

              {/* Conversation List */}
              <ScrollView className="flex-1">
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
                      onLongPress={() => handleDeleteConversation(conversation.id)}
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

            {/* Backdrop */}
            <TouchableOpacity
              className="flex-1 bg-black opacity-50"
              onPress={() => setSidebarOpen(false)}
              activeOpacity={1}
            />
          </View>
        </Modal>

        {/* Main Content */}
        <View className="flex-1 bg-black">
          {activeConversation ? (
            <GroupView
              group={activeConversation}
              conversations={activeBranches}
              onGroupUpdate={handleGroupUpdate}
              onConversationUpdated={() => refreshConversationTitle(activeConversation.id)}
            />
          ) : (
            <View className="flex-1 items-center justify-center px-4">
              <Text className="text-zinc-600 font-mono text-sm text-center">
                NO ACTIVE CONVERSATION
              </Text>
              <Text className="text-zinc-700 font-mono text-xs mt-2 text-center">
                CREATE OR SELECT ONE TO START
              </Text>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
