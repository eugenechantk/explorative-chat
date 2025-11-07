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
import { Menu, X, Plus, Settings, Key } from 'lucide-react';
import { getStoredApiKey, storeApiKey } from '@/lib/openrouter/client';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { KeyboardShortcutsHelp } from '@/components/KeyboardShortcutsHelp';

export default function Home() {
  const [groups, setGroups] = useState<ConversationGroup[]>([]);
  const [activeGroup, setActiveGroup] = useState<ConversationGroup | null>(null);
  const [activeConversations, setActiveConversations] = useState<Conversation[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Load groups on mount
  useEffect(() => {
    loadGroups();
    const storedKey = getStoredApiKey();
    if (storedKey) {
      setApiKey(storedKey);
    } else {
      setShowApiKeyModal(true);
    }
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

  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      storeApiKey(apiKey.trim());
      setShowApiKeyModal(false);
    } else {
      alert('Please enter a valid API key');
    }
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
          if (showApiKeyModal && getStoredApiKey()) setShowApiKeyModal(false);
        },
      },
    ],
    !showApiKeyModal && !showShortcutsHelp // Only enable when modals are closed
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-80' : 'w-0'
        } transition-all duration-300 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">Explorative Chat</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-2 p-4 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={handleCreateNewGroup}
            className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            New Group
          </button>
          <button
            onClick={() => setShowApiKeyModal(true)}
            className="px-3 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg"
            title="API Settings"
          >
            <Key className="w-4 h-4" />
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
        <div className="flex items-center gap-4 px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <div className="flex-1">
            {activeGroup && (
              <div>
                <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100">
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
              <h3 className="text-xl font-medium mb-2">No Active Group</h3>
              <p className="text-sm mb-6">Create a new group to start chatting</p>
              <button
                onClick={handleCreateNewGroup}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Create New Group
              </button>
            </div>
          )}
        </div>
      </div>

      {/* API Key Modal */}
      {showApiKeyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">OpenRouter API Key</h3>
              {getStoredApiKey() && (
                <button
                  onClick={() => setShowApiKeyModal(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Enter your OpenRouter API key to use the chat. Get one at{' '}
              <a
                href="https://openrouter.ai/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                openrouter.ai/keys
              </a>
            </p>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-or-v1-..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            />
            <button
              onClick={handleSaveApiKey}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              Save API Key
            </button>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Help */}
      <KeyboardShortcutsHelp isOpen={showShortcutsHelp} onClose={() => setShowShortcutsHelp(false)} />
    </div>
  );
}
