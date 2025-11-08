'use client';

import { useState, useEffect, useRef } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import type { Conversation, ConversationGroup, BranchContext } from '@/lib/types';
import { ConversationPanel } from './ConversationPanel';
import {
  createConversation,
  deleteConversation,
  updateConversation,
  updateGroup,
  generateId,
} from '@/lib/storage/operations';

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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const panelRefsMap = useRef<Map<string, HTMLDivElement>>(new Map());

  // Sync conversations from props when they change
  useEffect(() => {
    setConversations(initialConversations);
  }, [initialConversations]);

  // Notify parent of updates when conversations change
  useEffect(() => {
    if (conversations !== initialConversations) {
      onGroupUpdate?.(group, conversations);
    }
  }, [conversations]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-scroll to newest conversation when conversations length increases
  useEffect(() => {
    if (conversations.length > 1) {
      const lastConversation = conversations[conversations.length - 1];
      const lastPanelElement = panelRefsMap.current.get(lastConversation.id);

      if (lastPanelElement) {
        // Use requestAnimationFrame to ensure DOM has been painted
        requestAnimationFrame(() => {
          // Add delay to ensure panel layout is complete
          setTimeout(() => {
            lastPanelElement.scrollIntoView({
              behavior: 'smooth',
              block: 'nearest',
              inline: 'start'
            });
          }, 100);
        });
      }
    }
  }, [conversations.length]);

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
    // Create a new conversation with prepopulated input
    const newConversation: Conversation = {
      id: generateId(),
      groupId: group.id,
      messages: [],
      model: 'anthropic/claude-3.5-sonnet',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      position: conversations.length,
      mentionedTexts: branchContext.selectedText ? [branchContext.selectedText] : [],
    };

    await createConversation(newConversation);

    // Keep existing conversation objects to preserve their state
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

  const handleBranchToExistingConversation = async (conversationId: string, selectedText: string) => {
    // Find the target conversation
    const targetConversation = conversations.find(c => c.id === conversationId);
    if (!targetConversation) return;

    // Append the new selected text to existing mentionedTexts array
    const existingMentions = targetConversation.mentionedTexts || [];
    const newMentionedTexts = [...existingMentions, selectedText];

    // Update the conversation with the new mentioned texts array
    await updateConversation(conversationId, { mentionedTexts: newMentionedTexts });

    // Update local state to trigger re-render
    const updatedConversations = conversations.map(c =>
      c.id === conversationId ? { ...c, mentionedTexts: newMentionedTexts } : c
    );

    setConversations(updatedConversations);
    setActiveConversationId(conversationId);
  };


  if (conversations.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-black">
        <p className="text-zinc-500 text-sm font-mono">NO CONVERSATIONS IN THIS GROUP</p>
      </div>
    );
  }

  if (conversations.length === 1) {
    // Single conversation - no need for resizable panels
    return (
      <div className="h-full">
        <ConversationPanel
          conversation={conversations[0]}
          onBranch={handleBranch}
          onBranchToConversation={handleBranchToExistingConversation}
          availableConversations={conversations}
          isActive={true}
        />
      </div>
    );
  }

  // Multiple conversations - use resizable panels
  return (
    <div
      ref={scrollContainerRef}
      className="h-full flex snap-x snap-mandatory overflow-x-auto overflow-y-hidden scroll-smooth md:snap-none"
      style={{ minWidth: `${conversations.length * 600}px` }}
    >
      <PanelGroup direction="horizontal" className="h-full">
        {conversations.map((conversation, index) => (
          <div
            key={conversation.id}
            ref={(el) => {
              if (el) {
                panelRefsMap.current.set(conversation.id, el);
              } else {
                panelRefsMap.current.delete(conversation.id);
              }
            }}
            className="snap-center md:snap-align-none h-full"
          >
            <Panel
              defaultSize={100 / conversations.length}
              minSize={20}
              onClick={() => setActiveConversationId(conversation.id)}
              className="w-screen md:w-auto h-full"
              style={{ minWidth: '100vw' }}
            >
              <ConversationPanel
                conversation={conversation}
                onClose={() => handleCloseConversation(conversation.id)}
                onBranch={handleBranch}
                onBranchToConversation={handleBranchToExistingConversation}
                availableConversations={conversations}
                isActive={activeConversationId === conversation.id}
              />
            </Panel>
            {index < conversations.length - 1 && (
              <PanelResizeHandle className="w-1 bg-zinc-800 hover:bg-zinc-700 transition-colors hidden md:block" />
            )}
          </div>
        ))}
      </PanelGroup>
    </div>
  );
}
