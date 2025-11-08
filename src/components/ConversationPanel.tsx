'use client';

import { useState, useEffect, useRef } from 'react';
import type { Branch, Message, BranchContext } from '@/lib/types';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { BranchButton } from './BranchButton';
import { OpenRouterClient, POPULAR_MODELS } from '@/lib/openrouter/client';
import { createMessage, updateBranch, generateId, getConversation, updateConversation } from '@/lib/storage/operations';
import { generateConversationTitle } from '@/lib/openrouter/generateTitle';
import { X, Settings, Plus } from 'lucide-react';

interface ConversationPanelProps {
  conversation: Branch;
  onClose?: () => void;
  onBranch?: (branchContext: BranchContext) => void;
  onBranchToConversation?: (branchId: string, selectedText: string) => void;
  availableConversations?: Branch[];
  isActive?: boolean;
  onConversationUpdated?: () => void;
}

export function ConversationPanel({
  conversation,
  onClose,
  onBranch,
  onBranchToConversation,
  availableConversations = [],
  isActive = false,
  onConversationUpdated,
}: ConversationPanelProps) {
  const [messages, setMessages] = useState<Message[]>(conversation.messages || []);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [selectedModel, setSelectedModel] = useState(conversation.model || POPULAR_MODELS[0].id);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [branchSelection, setBranchSelection] = useState<{ message: Message; text: string } | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const prevBranchIdRef = useRef(conversation.id);

  // Sync messages from branch prop changes
  useEffect(() => {
    // If branch ID changed, always sync (switching to different branch)
    if (prevBranchIdRef.current !== conversation.id) {
      setMessages(conversation.messages || []);
      prevBranchIdRef.current = conversation.id;
    }
    // Otherwise, only update if prop has more messages (e.g., loaded from storage)
    // Never overwrite with fewer messages to prevent data loss
    else if (conversation.messages && conversation.messages.length > messages.length) {
      setMessages(conversation.messages);
    }
  }, [conversation.id, conversation.messages]); // eslint-disable-line react-hooks/exhaustive-deps

  // Track text selection for branching
  useEffect(() => {
    const handleSelectionChange = () => {
      // Use requestAnimationFrame to ensure selection is stable
      requestAnimationFrame(() => {
        const selection = window.getSelection();
        const selectedText = selection?.toString().trim();

        if (selectedText) {
          // Find which message contains the selection
          const anchorNode = selection?.anchorNode;
          if (anchorNode) {
            let messageElement: HTMLElement | null = anchorNode.parentElement;

            // Walk up the DOM to find the message container
            while (messageElement && !messageElement.hasAttribute('data-message-id')) {
              messageElement = messageElement.parentElement;
            }

            if (messageElement) {
              const messageId = messageElement.getAttribute('data-message-id');
              const message = messages.find(m => m.id === messageId);
              if (message) {
                setBranchSelection({ message, text: selectedText });
              }
            }
          }
        } else if (!selectedText && branchSelection) {
          // Clear selection when text is deselected
          setBranchSelection(null);
        }
      });
    };

    const handleMouseDown = (e: MouseEvent) => {
      // Only clear if clicking outside the branch button
      const target = e.target as HTMLElement;
      if (!target.closest('[data-branch-button]') && branchSelection) {
        const selection = window.getSelection();
        const selectedText = selection?.toString().trim();
        if (!selectedText) {
          setBranchSelection(null);
        }
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [branchSelection, messages]);

  const handleSendMessage = async (content: string, mentionedTexts?: string[]) => {
    // Combine mentioned texts and user content into a single prompt
    let fullContent = content;
    if (mentionedTexts && mentionedTexts.length > 0) {
      const referencesSection = mentionedTexts
        .map((text, index) => `[Reference ${index + 1}]\n${text}`)
        .join('\n\n');
      fullContent = `${referencesSection}\n\n---\n\n${content}`;
    }

    // Create user message
    const userMessage: Message = {
      id: generateId(),
      branchId: conversation.id,
      role: 'user',
      content: fullContent,
      timestamp: Date.now(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    // Save user message to storage
    await createMessage(userMessage);
    // Clear mentionedTexts after sending
    await updateBranch(conversation.id, { messages: updatedMessages, mentionedTexts: [] });

    // Generate conversation title immediately after first user message in first branch
    if (updatedMessages.length === 1 && conversation.position === 0) {
      const conversationData = await getConversation(conversation.conversationId);
      console.log('[TITLE] Checking after first user message:', conversationData);

      if (conversationData && !conversationData.name) {
        console.log('[TITLE] Generating title from user message immediately...');
        // Generate title in the background (don't await)
        generateConversationTitle(userMessage.content, '').then((title) => {
          console.log('[TITLE] Generated title:', title);
          return updateConversation(conversation.conversationId, { name: title });
        }).then(() => {
          console.log('[TITLE] Title updated in database, notifying parent...');
          // Notify parent component to refresh
          if (onConversationUpdated) {
            onConversationUpdated();
          }
        }).catch((err) => {
          console.error('[TITLE] Error generating/updating title:', err);
        });
      }
    }

    // Start streaming assistant response
    setIsStreaming(true);
    setStreamingContent('');

    const client = new OpenRouterClient();
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      let fullResponse = '';

      const openRouterMessages = updatedMessages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      for await (const chunk of client.streamChat(selectedModel, openRouterMessages, abortController.signal)) {
        fullResponse += chunk;
        setStreamingContent(fullResponse);
      }

      // Create assistant message
      const assistantMessage: Message = {
        id: generateId(),
        branchId: conversation.id,
        role: 'assistant',
        content: fullResponse,
        timestamp: Date.now(),
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);

      // Save assistant message to storage
      await createMessage(assistantMessage);
      await updateBranch(conversation.id, { messages: finalMessages });
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Request aborted');
      } else {
        console.error('Error streaming chat:', error);
        alert('Error communicating with the API. Please make sure your API key is set in .env.local and try again.');
      }
    } finally {
      setIsStreaming(false);
      setStreamingContent('');
      abortControllerRef.current = null;
    }
  };

  const handleBranch = () => {
    if (onBranch && branchSelection) {
      const branchContext: BranchContext = {
        sourceBranchId: conversation.id,
        sourceMessageId: branchSelection.message.id,
        selectedText: branchSelection.text,
      };
      onBranch(branchContext);
      setBranchSelection(null);
    }
  };

  const handleBranchToExistingBranch = (branchId: string) => {
    if (onBranchToConversation && branchSelection) {
      onBranchToConversation(branchId, branchSelection.text);
      setBranchSelection(null);
    }
  };

  const handleModelChange = async (newModel: string) => {
    setSelectedModel(newModel);
    await updateBranch(conversation.id, { model: newModel });
    setShowModelSelector(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return (
    <div className="flex flex-col h-full bg-black border-r border-zinc-800">
      {/* Header */}
      <div className="h-11 md:h-12 flex items-center justify-between px-3 border-b border-zinc-800 bg-zinc-950 flex-shrink-0">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <h2 className="text-xs md:text-sm font-medium text-white truncate font-mono line-clamp-1">
            {conversation.title || `BRANCH ${conversation.position + 1}`}
          </h2>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowModelSelector(!showModelSelector)}
            className="p-2 md:p-2 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-colors min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0 cursor-pointer"
            title="Change model"
          >
            <Settings className="w-4 h-4 text-zinc-500" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 md:p-2 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-colors min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0 cursor-pointer"
              title="Close branch"
            >
              <X className="w-4 h-4 text-zinc-500" />
            </button>
          )}
        </div>
      </div>

      {/* Model Selector */}
      {showModelSelector && (
        <div className="px-3 py-3 bg-zinc-900 border-b border-zinc-800 flex-shrink-0">
          <label className="text-xs font-medium text-zinc-600 mb-2 block font-mono">SELECT MODEL</label>
          <select
            value={selectedModel}
            onChange={(e) => handleModelChange(e.target.value)}
            className="w-full text-sm px-3 py-3 md:py-2 border-0 bg-zinc-950 text-white focus:outline-none font-mono min-h-[44px]"
          >
            {POPULAR_MODELS.map((model) => (
              <option key={model.id} value={model.id} className="bg-zinc-950">
                {model.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Messages */}
      <MessageList
        messages={messages}
        isStreaming={isStreaming}
        streamingContent={streamingContent}
      />

      {/* Input */}
      <div className="flex-shrink-0">
        <MessageInput
          key={conversation.id}
          onSend={handleSendMessage}
          disabled={isStreaming}
          isStreaming={isStreaming}
          mentionedTexts={conversation.mentionedTexts || (conversation.initialInput ? [conversation.initialInput] : [])}
        />
      </div>

      {/* Branch Button */}
      {branchSelection && (
        <BranchButton
          onBranch={handleBranch}
          onBranchToConversation={handleBranchToExistingBranch}
          availableConversations={availableConversations}
          currentConversationId={conversation.id}
        />
      )}
    </div>
  );
}
