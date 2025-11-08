'use client';

import { useState, useEffect, useRef } from 'react';
import type { Branch, Conversation, BranchContext } from '@/lib/types';
import { ConversationPanel } from './ConversationPanel';
import {
  createBranch,
  deleteBranch,
  updateBranch,
  updateConversation,
  generateId,
} from '@/lib/storage/operations';

interface GroupViewProps {
  group: Conversation;
  conversations: Branch[];
  onGroupUpdate?: (group: Conversation, conversations: Branch[]) => void;
  onConversationUpdated?: () => void;
}

export function GroupView({ group, conversations: initialBranches, onGroupUpdate, onConversationUpdated }: GroupViewProps) {
  const [branches, setBranches] = useState<Branch[]>(initialBranches);
  const [activeBranchId, setActiveBranchId] = useState<string | null>(
    initialBranches[0]?.id || null
  );
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const panelRefsMap = useRef<Map<string, HTMLDivElement>>(new Map());
  const prevBranchesLengthRef = useRef<number>(initialBranches.length);

  // Sync branches from props when they change
  useEffect(() => {
    setBranches(initialBranches);
  }, [initialBranches]);

  // Notify parent of updates when branches change
  useEffect(() => {
    if (branches !== initialBranches) {
      onGroupUpdate?.(group, branches);
    }
  }, [branches]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-scroll to newest branch when a new branch is added (not on initial load)
  useEffect(() => {
    const prevLength = prevBranchesLengthRef.current;
    const currentLength = branches.length;

    // Only scroll if length increased (new branch added) and we have multiple branches
    if (currentLength > prevLength && currentLength > 1) {
      const lastBranch = branches[branches.length - 1];
      const lastPanelElement = panelRefsMap.current.get(lastBranch.id);

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

    // Update the ref for next comparison
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
      return;
    }

    // Don't allow closing the first branch (position 0)
    const branchToClose = branches.find(c => c.id === branchId);
    if (branchToClose?.position === 0) {
      return;
    }

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
  };

  const handleBranch = async (branchContext: BranchContext) => {
    // Create a new branch with prepopulated input
    const newBranch: Branch = {
      id: generateId(),
      conversationId: group.id,
      messages: [],
      model: 'anthropic/claude-3.5-sonnet',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      position: branches.length,
      mentionedTexts: branchContext.selectedText ? [branchContext.selectedText] : [],
    };

    await createBranch(newBranch);

    // Keep existing branch objects to preserve their state
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

  const handleBranchToExistingBranch = async (branchId: string, selectedText: string) => {
    // Find the target branch
    const targetBranch = branches.find(c => c.id === branchId);
    if (!targetBranch) return;

    // Append the new selected text to existing mentionedTexts array
    const existingMentions = targetBranch.mentionedTexts || [];
    const newMentionedTexts = [...existingMentions, selectedText];

    // Update the branch with the new mentioned texts array
    await updateBranch(branchId, { mentionedTexts: newMentionedTexts });

    // Update local state to trigger re-render
    const updatedBranches = branches.map(c =>
      c.id === branchId ? { ...c, mentionedTexts: newMentionedTexts } : c
    );

    setBranches(updatedBranches);
    setActiveBranchId(branchId);
  };


  if (branches.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-black">
        <p className="text-zinc-500 text-sm font-mono">NO BRANCHES IN THIS CONVERSATION</p>
      </div>
    );
  }

  if (branches.length === 1) {
    // Single branch - no need for resizable panels
    return (
      <div className="h-full">
        <ConversationPanel
          conversation={branches[0]}
          onBranch={handleBranch}
          onBranchToConversation={handleBranchToExistingBranch}
          availableConversations={branches}
          isActive={true}
          onConversationUpdated={onConversationUpdated}
        />
      </div>
    );
  }

  // Multiple branches - horizontal scroll layout
  return (
    <div
      ref={scrollContainerRef}
      className="h-full overflow-x-auto overflow-y-hidden scroll-smooth snap-x snap-proximity lg:snap-none"
    >
      <div className="h-full flex">
        {branches.map((branch) => (
          <div
            key={branch.id}
            ref={(el) => {
              if (el) {
                panelRefsMap.current.set(branch.id, el);
              } else {
                panelRefsMap.current.delete(branch.id);
              }
            }}
            onClick={() => setActiveBranchId(branch.id)}
            className="h-full w-screen md:w-[720px] flex-shrink-0 snap-start lg:snap-align-none"
          >
            <ConversationPanel
              conversation={branch}
              onClose={branch.position === 0 ? undefined : () => handleCloseBranch(branch.id)}
              onBranch={handleBranch}
              onBranchToConversation={handleBranchToExistingBranch}
              availableConversations={branches}
              isActive={activeBranchId === branch.id}
              onConversationUpdated={onConversationUpdated}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
