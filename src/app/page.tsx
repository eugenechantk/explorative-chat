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
  generateId,
} from '@/lib/storage/operations';
import { Menu, X, Plus } from 'lucide-react';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { KeyboardShortcutsHelp } from '@/components/KeyboardShortcutsHelp';

export default function Home() {
  const [groups, setGroups] = useState<ConversationGroup[]>([]);
  const [activeGroup, setActiveGroup] = useState<ConversationGroup | null>(null);
  const [activeConversations, setActiveConversations] = useState<Conversation[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-black">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-80' : 'w-0'
        } transition-all duration-300 bg-black border-r border-white/10 flex flex-col overflow-hidden`}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h1 className="text-lg font-bold text-gray-100">Explorative Chat</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 hover:bg-white/5 rounded transition-colors text-gray-400 hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-2 p-4 border-b border-white/10">
          <button
            onClick={handleCreateNewGroup}
            className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2 text-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Group
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="flex items-center gap-4 px-4 py-3 bg-black/60 backdrop-blur-sm border-b border-white/10">
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-white/5 rounded transition-colors text-gray-400 hover:text-gray-200"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <div className="flex-1">
            {activeGroup && (
              <div>
                <h2 className="text-sm font-medium text-gray-200">
                  {activeGroup.name || 'Untitled Group'}
                </h2>
                <p className="text-xs text-gray-500">
                  {activeConversations.length} conversation{activeConversations.length !== 1 ? 's' : ''}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Group View */}
        <div className="flex-1 overflow-hidden">
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
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <Plus className="w-16 h-16 mb-4 opacity-50" />
              <h3 className="text-xl font-medium mb-2 text-gray-300">No Active Group</h3>
              <p className="text-sm mb-6">Create a new group to start chatting</p>
              <button
                onClick={handleCreateNewGroup}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create New Group
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
