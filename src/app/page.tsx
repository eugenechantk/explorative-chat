'use client';

import { useState, useEffect } from 'react';
import type { Conversation, Branch } from '@/lib/types';
import { GroupView } from '@/components/GroupView';
import { GroupsList } from '@/components/GroupsList';
import {
  createConversation,
  createBranch,
  getAllConversations,
  getBranchesByConversation,
  deleteConversation,
  updateConversation,
  generateId,
} from '@/lib/storage/operations';
import { isStorageAvailable } from '@/lib/storage/db';
import { Menu, X, Plus } from 'lucide-react';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { KeyboardShortcutsHelp } from '@/components/KeyboardShortcutsHelp';

export default function Home() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [activeBranches, setActiveBranches] = useState<Branch[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Start closed for mobile-first approach
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

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

  // Load conversations on mount
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
      console.error('Error selecting conversation:', error);
    }
  };

  const handleCreateNewConversation = async () => {
    // Prevent double-taps on mobile
    if (isCreating) return;

    // Check if storage is available (fails in Safari private mode)
    if (!isStorageAvailable()) {
      setCreateError('Storage not available. Please disable private browsing mode.');
      alert('Storage not available. Please disable private browsing mode or check browser settings.');
      return;
    }

    try {
      setIsCreating(true);
      setCreateError(null);
      console.log('[CREATE] Starting conversation creation...');

      const newConversation: Conversation = {
        id: generateId(),
        branchIds: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      console.log('[CREATE] Generated conversation object:', newConversation);

      console.log('[CREATE] Step 1: Creating conversation in DB...');
      await createConversation(newConversation);
      console.log('[CREATE] Step 1: SUCCESS - Conversation created');

      // Create initial branch
      const initialBranch: Branch = {
        id: generateId(),
        conversationId: newConversation.id,
        messages: [],
        model: 'anthropic/claude-3.5-sonnet',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        position: 0,
      };
      console.log('[CREATE] Generated branch object:', initialBranch);

      console.log('[CREATE] Step 2: Creating initial branch in DB...');
      await createBranch(initialBranch);
      console.log('[CREATE] Step 2: SUCCESS - Branch created');

      // Update conversation with branch ID in database
      console.log('[CREATE] Step 3: Updating conversation with branchIds...');
      await updateConversation(newConversation.id, { branchIds: [initialBranch.id] });
      console.log('[CREATE] Step 3: SUCCESS - Conversation updated');

      // Update local state
      newConversation.branchIds = [initialBranch.id];

      console.log('[CREATE] Step 4: Setting state...');
      setActiveConversation(newConversation);
      setActiveBranches([initialBranch]);
      console.log('[CREATE] Step 4: SUCCESS - State set');

      console.log('[CREATE] Step 5: Reloading conversations...');
      await loadConversations();
      console.log('[CREATE] Step 5: SUCCESS - Conversations reloaded');

      console.log('[CREATE] COMPLETE - All steps succeeded');
      setIsCreating(false);
    } catch (error) {
      console.error('[CREATE] ERROR occurred:', error);
      console.error('[CREATE] Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });

      const errorMessage = error instanceof Error ? error.message : String(error);
      setCreateError(errorMessage);
      setIsCreating(false);

      // Also show alert for visibility
      alert(`Error creating conversation: ${errorMessage}`);
    }
  };

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      await deleteConversation(conversationId);

      if (activeConversation?.id === conversationId) {
        setActiveConversation(null);
        setActiveBranches([]);
      }

      await loadConversations();
    } catch (error) {
      console.error('Error deleting conversation:', error);
      alert('Error deleting conversation. Please try again.');
    }
  };

  const handleAddBranch = async () => {
    if (!activeConversation) return;

    try {
      const newBranch: Branch = {
      id: generateId(),
      conversationId: activeConversation.id,
      messages: [],
      model: 'anthropic/claude-3.5-sonnet',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      position: activeBranches.length,
    };

    await createBranch(newBranch);

    const updatedBranches = [...activeBranches, newBranch];
    const updatedConversation = {
      ...activeConversation,
      branchIds: [...(activeConversation.branchIds || []), newBranch.id],
      updatedAt: Date.now(),
    };

      await updateConversation(activeConversation.id, updatedConversation);

      setActiveBranches(updatedBranches);
      setActiveConversation(updatedConversation);
      await loadConversations();
    } catch (error) {
      console.error('Error adding branch:', error);
      alert('Error adding branch. Please try again.');
    }
  };

  // Keyboard shortcuts
  useKeyboardShortcuts(
    [
      {
        key: 't',
        metaKey: true,
        description: 'New conversation',
        action: handleCreateNewConversation,
      },
      {
        key: 'n',
        metaKey: true,
        description: 'New branch',
        action: () => {
          // This will be handled by the GroupView component
          // We could emit an event or use a ref here
        },
      },
      {
        key: '/',
        metaKey: true,
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
            onClick={handleCreateNewConversation}
            disabled={isCreating}
            className="w-full px-3 py-2 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed border-b border-zinc-800 flex items-center justify-center gap-2 text-white text-sm font-mono transition-colors"
          >
            {isCreating ? (
              <>
                <div className="w-4 h-4 border-2 border-zinc-600 border-t-transparent animate-spin"></div>
                CREATING...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                NEW CONVERSATION
              </>
            )}
          </button>
        </div>

        <div className="flex-1 overflow-hidden">
          <GroupsList
            groups={conversations}
            activeGroupId={activeConversation?.id}
            onSelectGroup={selectConversation}
            onDeleteGroup={handleDeleteConversation}
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
            {activeConversation && (
              <div>
                <h2 className="text-sm font-medium text-white font-mono">
                  {activeConversation.name || 'UNTITLED CONVERSATION'}
                </h2>
                <p className="text-xs text-zinc-600 font-mono">
                  {activeBranches.length} BRANCH{activeBranches.length !== 1 ? 'ES' : ''}
                </p>
              </div>
            )}
          </div>
          {activeConversation && activeBranches.length > 0 && (
            <button
              onClick={handleAddBranch}
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
          {activeConversation && activeBranches.length > 0 ? (
            <GroupView
              group={activeConversation}
              conversations={activeBranches}
              onGroupUpdate={(updatedConversation, updatedBranches) => {
                setActiveConversation(updatedConversation);
                setActiveBranches(updatedBranches);
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full bg-black px-4">
              <Plus className="w-16 h-16 mb-4 text-zinc-700" />
              <h3 className="text-base font-bold mb-2 text-white font-mono">NO ACTIVE CONVERSATION</h3>
              <p className="text-sm mb-6 text-zinc-500 font-mono text-center">CREATE A NEW CONVERSATION TO START CHATTING</p>

              {createError && (
                <div className="mb-4 p-3 bg-red-950 border border-red-800 text-red-200 text-xs font-mono max-w-md text-center">
                  ERROR: {createError}
                </div>
              )}

              <button
                onClick={handleCreateNewConversation}
                disabled={isCreating}
                className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed border border-zinc-700 text-white flex items-center gap-2 text-sm font-mono transition-colors min-w-[200px] justify-center"
              >
                {isCreating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-zinc-600 border-t-transparent animate-spin"></div>
                    CREATING...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    CREATE NEW CONVERSATION
                  </>
                )}
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
