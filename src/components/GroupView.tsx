'use client';

import { useState, useEffect } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import type { Conversation, ConversationGroup, BranchContext } from '@/lib/types';
import { ConversationPanel } from './ConversationPanel';
import {
  createConversation,
  deleteConversation,
  updateConversation,
  updateGroup,
  generateId,
  createMessage,
} from '@/lib/storage/operations';
import { Plus } from 'lucide-react';

interface GroupViewProps {
  group: ConversationGroup;
  conversations: Conversation[];
  onGroupUpdate?: (group: ConversationGroup, conversations: Conversation[]) => void;
}

export function GroupView({ group, conversations: initialConversations, onGroupUpdate }: GroupViewProps) {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(
    initialConversations[0]?.id || null
  );

  // Notify parent of updates
  useEffect(() => {
    onGroupUpdate?.(group, conversations);
  }, [group, conversations, onGroupUpdate]);

  const handleAddConversation = async () => {
    const newConversation: Conversation = {
      id: generateId(),
      groupId: group.id,
      messages: [],
      model: 'anthropic/claude-3.5-sonnet',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      position: conversations.length,
    };

    await createConversation(newConversation);

    const updatedConversations = [...conversations, newConversation];
    const updatedGroup = {
      ...group,
      conversationIds: [...group.conversationIds, newConversation.id],
      updatedAt: Date.now(),
    };

    await updateGroup(group.id, updatedGroup);

    setConversations(updatedConversations);
    setActiveConversationId(newConversation.id);
  };

  const handleCloseConversation = async (conversationId: string) => {
    // Don't allow closing the last conversation
    if (conversations.length === 1) {
      return;
    }

    await deleteConversation(conversationId);

    const updatedConversations = conversations
      .filter((c) => c.id !== conversationId)
      .map((c, index) => ({ ...c, position: index }));

    // Update positions in storage
    for (const conv of updatedConversations) {
      await updateConversation(conv.id, { position: conv.position });
    }

    const updatedGroup = {
      ...group,
      conversationIds: updatedConversations.map((c) => c.id),
      updatedAt: Date.now(),
    };

    await updateGroup(group.id, updatedGroup);

    setConversations(updatedConversations);

    // Update active conversation if needed
    if (activeConversationId === conversationId) {
      setActiveConversationId(updatedConversations[0]?.id || null);
    }
  };

  const handleBranch = async (branchContext: BranchContext) => {
    // Create a new conversation with the branched content
    const newConversation: Conversation = {
      id: generateId(),
      groupId: group.id,
      messages: [],
      model: 'anthropic/claude-3.5-sonnet',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      position: conversations.length,
    };

    await createConversation(newConversation);

    // Create initial message with branch context
    if (branchContext.selectedText) {
      const initialMessage = {
        id: generateId(),
        conversationId: newConversation.id,
        role: 'user' as const,
        content: branchContext.selectedText,
        timestamp: Date.now(),
        branchSourceConversationId: branchContext.sourceConversationId,
        branchSourceMessageId: branchContext.sourceMessageId,
        branchSelectedText: branchContext.selectedText,
      };

      await createMessage(initialMessage);
      newConversation.messages = [initialMessage];
      await updateConversation(newConversation.id, { messages: [initialMessage] });
    }

    const updatedConversations = [...conversations, newConversation];
    const updatedGroup = {
      ...group,
      conversationIds: [...group.conversationIds, newConversation.id],
      updatedAt: Date.now(),
    };

    await updateGroup(group.id, updatedGroup);

    setConversations(updatedConversations);
    setActiveConversationId(newConversation.id);
  };

  const handleMessagesUpdate = async (conversationId: string, messages: any[]) => {
    const updatedConversations = conversations.map((c) =>
      c.id === conversationId ? { ...c, messages, updatedAt: Date.now() } : c
    );
    setConversations(updatedConversations);
  };

  if (conversations.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <button
          onClick={handleAddConversation}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Start New Conversation
        </button>
      </div>
    );
  }

  if (conversations.length === 1) {
    // Single conversation - no need for resizable panels
    return (
      <div className="h-full flex flex-col">
        <div className="flex justify-end p-2 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={handleAddConversation}
            className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            New Conversation
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          <ConversationPanel
            conversation={conversations[0]}
            onBranch={handleBranch}
            onMessagesUpdate={(messages) => handleMessagesUpdate(conversations[0].id, messages)}
            isActive={true}
          />
        </div>
      </div>
    );
  }

  // Multiple conversations - use resizable panels
  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-end p-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={handleAddConversation}
          className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          New Conversation
        </button>
      </div>
      <div className="flex-1 overflow-hidden">
        <PanelGroup direction="horizontal">
          {conversations.map((conversation, index) => (
            <div key={conversation.id}>
              <Panel
                defaultSize={100 / conversations.length}
                minSize={20}
                onClick={() => setActiveConversationId(conversation.id)}
              >
                <ConversationPanel
                  conversation={conversation}
                  onClose={() => handleCloseConversation(conversation.id)}
                  onBranch={handleBranch}
                  onMessagesUpdate={(messages) => handleMessagesUpdate(conversation.id, messages)}
                  isActive={activeConversationId === conversation.id}
                />
              </Panel>
              {index < conversations.length - 1 && (
                <PanelResizeHandle className="w-1 bg-gray-200 dark:bg-gray-700 hover:bg-blue-500 transition-colors" />
              )}
            </div>
          ))}
        </PanelGroup>
      </div>
    </div>
  );
}
