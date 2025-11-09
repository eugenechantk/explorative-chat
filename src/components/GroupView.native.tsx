import { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, Dimensions, TouchableOpacity, Alert } from 'react-native';
import type { Branch, Conversation } from '@/lib/types';
import { ConversationPanel } from './ConversationPanel.native';
import {
  createBranch,
  deleteBranch,
  updateBranch,
  updateConversation,
  generateId,
} from '@/lib/storage/operations';
import { Plus } from 'lucide-react-native';

interface GroupViewProps {
  group: Conversation;
  conversations: Branch[];
  onGroupUpdate?: (group: Conversation, conversations: Branch[]) => void;
  onConversationUpdated?: () => void;
}

export function GroupView({
  group,
  conversations: initialBranches,
  onGroupUpdate,
  onConversationUpdated
}: GroupViewProps) {
  const [branches, setBranches] = useState<Branch[]>(initialBranches);
  const [activeBranchId, setActiveBranchId] = useState<string | null>(
    initialBranches[0]?.id || null
  );
  const scrollViewRef = useRef<ScrollView>(null);
  const prevBranchesLengthRef = useRef<number>(initialBranches.length);
  const { width: screenWidth } = Dimensions.get('window');

  // Sync branches from props
  useEffect(() => {
    setBranches(initialBranches);
  }, [initialBranches]);

  // Notify parent of updates
  useEffect(() => {
    if (branches !== initialBranches) {
      onGroupUpdate?.(group, branches);
    }
  }, [branches]);

  // Auto-scroll to newest branch
  useEffect(() => {
    const prevLength = prevBranchesLengthRef.current;
    const currentLength = branches.length;

    if (currentLength > prevLength && currentLength > 1) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }

    prevBranchesLengthRef.current = currentLength;
  }, [branches.length]);

  const handleAddBranch = async () => {
    const newBranch: Branch = {
      id: generateId(),
      conversationId: group.id,
      messages: [],
      model: 'anthropic/claude-3.5-sonnet',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      position: branches.length,
    };

    await createBranch(newBranch);

    const updatedBranches = [...branches, newBranch];
    const updatedConversation = {
      ...group,
      branchIds: [...(group.branchIds || []), newBranch.id],
      updatedAt: Date.now(),
    };

    await updateConversation(group.id, updatedConversation);

    setBranches(updatedBranches);
    setActiveBranchId(newBranch.id);
  };

  const handleCloseBranch = async (branchId: string) => {
    // Don't allow closing the last branch
    if (branches.length === 1) {
      Alert.alert('Cannot Close', 'You cannot close the last branch');
      return;
    }

    // Don't allow closing the first branch (position 0)
    const branchToClose = branches.find(c => c.id === branchId);
    if (branchToClose?.position === 0) {
      Alert.alert('Cannot Close', 'You cannot close the primary branch');
      return;
    }

    Alert.alert(
      'Close Branch',
      'Are you sure you want to close this branch?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Close',
          style: 'destructive',
          onPress: async () => {
            await deleteBranch(branchId);

            const updatedBranches = branches
              .filter((c) => c.id !== branchId)
              .map((c, index) => ({ ...c, position: index }));

            // Update positions in storage
            for (const branch of updatedBranches) {
              await updateBranch(branch.id, { position: branch.position });
            }

            const updatedConversation = {
              ...group,
              branchIds: updatedBranches.map((c) => c.id),
              updatedAt: Date.now(),
            };

            await updateConversation(group.id, updatedConversation);

            setBranches(updatedBranches);

            // Update active branch if needed
            if (activeBranchId === branchId) {
              setActiveBranchId(updatedBranches[0]?.id || null);
            }
          },
        },
      ]
    );
  };

  if (branches.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <Text className="text-zinc-500 text-sm font-mono">NO BRANCHES IN THIS CONVERSATION</Text>
      </View>
    );
  }

  if (branches.length === 1) {
    // Single branch - full screen
    return (
      <View className="flex-1">
        <ConversationPanel
          conversation={branches[0]}
          isActive={true}
          onConversationUpdated={onConversationUpdated}
        />
      </View>
    );
  }

  // Multiple branches - horizontal scroll
  return (
    <View className="flex-1">
      {/* Add Branch Button - Fixed at top */}
      <View className="bg-zinc-950 border-b border-zinc-800 px-3 py-2">
        <TouchableOpacity
          onPress={handleAddBranch}
          className="flex-row items-center"
        >
          <Plus size={16} color="#ffffff" />
          <Text className="text-white font-mono text-sm ml-2">NEW BRANCH</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
      >
        {branches.map((branch, index) => (
          <View
            key={branch.id}
            style={{ width: screenWidth }}
          >
            <ConversationPanel
              conversation={branch}
              onClose={branch.position === 0 ? undefined : () => handleCloseBranch(branch.id)}
              isActive={activeBranchId === branch.id}
              onConversationUpdated={onConversationUpdated}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
