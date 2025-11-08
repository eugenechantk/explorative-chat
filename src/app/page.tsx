'use client';

import { useState, useEffect } from 'react';
import type { ConversationGroup, Conversation } from '@/lib/types';
import { GroupView } from '@/components/GroupView';
import { GroupsList } from '@/components/GroupsList';
import {
  createGroup,
  createConversation,
  getAllGroups,
  getConversationsByGroup,
  deleteGroup,
  updateGroup,
  generateId,
} from '@/lib/storage/operations';
import { Menu, X, Plus } from 'lucide-react';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { KeyboardShortcutsHelp } from '@/components/KeyboardShortcutsHelp';

export default function Home() {
  const [groups, setGroups] = useState<ConversationGroup[]>([]);
  const [activeGroup, setActiveGroup] = useState<ConversationGroup | null>(null);
  const [activeConversations, setActiveConversations] = useState<Conversation[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Start closed for mobile-first approach
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Set sidebar open on desktop on mount
  useEffect(() => {
    const checkIfDesktop = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      }
    };
    checkIfDesktop();
    window.addEventListener('resize', checkIfDesktop);
    return () => window.removeEventListener('resize', checkIfDesktop);
  }, []);

  // Load groups on mount
  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    setIsLoading(true);
    const allGroups = await getAllGroups();
    setGroups(allGroups);

    if (allGroups.length > 0 && !activeGroup) {
      await selectGroup(allGroups[0]);
    }

    setIsLoading(false);
  };

  const selectGroup = async (group: ConversationGroup) => {
    const conversations = await getConversationsByGroup(group.id);
    setActiveGroup(group);
    setActiveConversations(conversations);
  };

  const handleCreateNewGroup = async () => {
    const newGroup: ConversationGroup = {
      id: generateId(),
      conversationIds: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await createGroup(newGroup);

    // Create initial conversation
    const initialConversation: Conversation = {
      id: generateId(),
      groupId: newGroup.id,
      messages: [],
      model: 'anthropic/claude-3.5-sonnet',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      position: 0,
    };

    await createConversation(initialConversation);

    newGroup.conversationIds = [initialConversation.id];

    setActiveGroup(newGroup);
    setActiveConversations([initialConversation]);
    await loadGroups();
  };

  const handleDeleteGroup = async (groupId: string) => {
    await deleteGroup(groupId);

    if (activeGroup?.id === groupId) {
      setActiveGroup(null);
      setActiveConversations([]);
    }

    await loadGroups();
  };

  const handleAddConversation = async () => {
    if (!activeGroup) return;

    const newConversation: Conversation = {
      id: generateId(),
      groupId: activeGroup.id,
      messages: [],
      model: 'anthropic/claude-3.5-sonnet',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      position: activeConversations.length,
    };

    await createConversation(newConversation);

    const updatedConversations = [...activeConversations, newConversation];
    const updatedGroup = {
      ...activeGroup,
      conversationIds: [...activeGroup.conversationIds, newConversation.id],
      updatedAt: Date.now(),
    };

    await updateGroup(activeGroup.id, updatedGroup);

    setActiveConversations(updatedConversations);
    setActiveGroup(updatedGroup);
    await loadGroups();
  };

  // Keyboard shortcuts
  useKeyboardShortcuts(
    [
      {
        key: 't',
        metaKey: true,
        description: 'New group',
        action: handleCreateNewGroup,
      },
      {
        key: 'n',
        metaKey: true,
        description: 'New conversation',
        action: () => {
          // This will be handled by the GroupView component
          // We could emit an event or use a ref here
        },
      },
      {
        key: '?',
        description: 'Show keyboard shortcuts',
        action: () => setShowShortcutsHelp(true),
      },
      {
        key: 'Escape',
        description: 'Close dialog',
        action: () => {
          if (showShortcutsHelp) setShowShortcutsHelp(false);
        },
      },
    ],
    !showShortcutsHelp // Only enable when modals are closed
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-zinc-800 border-t-transparent animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-400 text-sm font-mono">LOADING...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-black" style={{ height: '100dvh' }}>
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-72 md:w-72' : 'w-0'
        } transition-all duration-300 bg-black border-r border-zinc-800 flex flex-col overflow-hidden fixed md:relative z-30 h-full`}
      >
        <div className="flex items-center justify-between px-3 h-12 border-b border-zinc-800">
          <h1 className="text-sm font-bold text-white font-mono tracking-tight">EXPLORATIVE CHAT</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-colors text-zinc-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="border-b border-zinc-800">
          <button
            onClick={handleCreateNewGroup}
            className="w-full px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border-b border-zinc-800 flex items-center justify-center gap-2 text-white text-sm font-mono transition-colors"
          >
            <Plus className="w-4 h-4" />
            NEW GROUP
          </button>
        </div>

        <div className="flex-1 overflow-hidden">
          <GroupsList
            groups={groups}
            activeGroupId={activeGroup?.id}
            onSelectGroup={selectGroup}
            onDeleteGroup={handleDeleteGroup}
          />
        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 h-full flex flex-col overflow-hidden bg-black w-full md:w-auto">
        {/* Top Bar */}
        <div className="flex items-center gap-2 md:gap-4 px-3 bg-zinc-950 border-b border-zinc-800 flex-shrink-0">
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-colors text-zinc-500"
            >
              <Menu className="w-4 h-4" />
            </button>
          )}
          <div className="flex-1 py-3">
            {activeGroup && (
              <div>
                <h2 className="text-sm font-medium text-white font-mono">
                  {activeGroup.name || 'UNTITLED GROUP'}
                </h2>
                <p className="text-xs text-zinc-600 font-mono">
                  {activeConversations.length} CONVERSATION{activeConversations.length !== 1 ? 'S' : ''}
                </p>
              </div>
            )}
          </div>
          {activeGroup && activeConversations.length > 0 && (
            <button
              onClick={handleAddConversation}
              className="px-3 md:px-4 h-full hover:bg-zinc-900 border-l border-zinc-800 text-white flex items-center gap-1 md:gap-2 text-xs md:text-sm font-mono transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">NEW BRANCH</span>
              <span className="sm:hidden">NEW</span>
            </button>
          )}
        </div>

        {/* Group View */}
        <div className="flex-1 min-h-0 overflow-x-auto overflow-y-hidden">
          {activeGroup && activeConversations.length > 0 ? (
            <GroupView
              group={activeGroup}
              conversations={activeConversations}
              onGroupUpdate={(updatedGroup, updatedConversations) => {
                setActiveGroup(updatedGroup);
                setActiveConversations(updatedConversations);
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full bg-black">
              <Plus className="w-16 h-16 mb-4 text-zinc-700" />
              <h3 className="text-base font-bold mb-2 text-white font-mono">NO ACTIVE GROUP</h3>
              <p className="text-sm mb-6 text-zinc-500 font-mono">CREATE A NEW GROUP TO START CHATTING</p>
              <button
                onClick={handleCreateNewGroup}
                className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white flex items-center gap-2 text-sm font-mono transition-colors"
              >
                <Plus className="w-4 h-4" />
                CREATE NEW GROUP
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Keyboard Shortcuts Help */}
      <KeyboardShortcutsHelp isOpen={showShortcutsHelp} onClose={() => setShowShortcutsHelp(false)} />
    </div>
  );
}
