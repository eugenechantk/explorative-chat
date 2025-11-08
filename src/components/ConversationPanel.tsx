'use client';

import { useState, useEffect, useRef } from 'react';
import type { Conversation, Message, BranchContext } from '@/lib/types';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { BranchButton } from './BranchButton';
import { OpenRouterClient, POPULAR_MODELS } from '@/lib/openrouter/client';
import { createMessage, updateConversation, generateId } from '@/lib/storage/operations';
import { X, Settings, Plus } from 'lucide-react';

interface ConversationPanelProps {
  conversation: Conversation;
  onClose?: () => void;
  onBranch?: (branchContext: BranchContext) => void;
  onBranchToConversation?: (conversationId: string, selectedText: string) => void;
  availableConversations?: Conversation[];
  isActive?: boolean;
}

export function ConversationPanel({
  conversation,
  onClose,
  onBranch,
  onBranchToConversation,
  availableConversations = [],
  isActive = false,
}: ConversationPanelProps) {
  const [messages, setMessages] = useState<Message[]>(conversation.messages || []);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [selectedModel, setSelectedModel] = useState(conversation.model || POPULAR_MODELS[0].id);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [branchSelection, setBranchSelection] = useState<{ message: Message; text: string } | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Sync messages from conversation prop changes
  useEffect(() => {
    setMessages(conversation.messages || []);
  }, [conversation.id]); // Only update when conversation changes

  // Clear branch selection when clicking elsewhere or selection changes
  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      const selectedText = selection?.toString().trim();
      if (!selectedText && branchSelection) {
        setBranchSelection(null);
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    document.addEventListener('mousedown', handleSelectionChange);

    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      document.removeEventListener('mousedown', handleSelectionChange);
    };
  }, [branchSelection]);

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
      conversationId: conversation.id,
      role: 'user',
      content: fullContent,
      timestamp: Date.now(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    // Save user message to storage
    await createMessage(userMessage);
    // Clear mentionedTexts after sending
    await updateConversation(conversation.id, { messages: updatedMessages, mentionedTexts: [] });

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
        conversationId: conversation.id,
        role: 'assistant',
        content: fullResponse,
        timestamp: Date.now(),
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);

      // Save assistant message to storage
      await createMessage(assistantMessage);
      await updateConversation(conversation.id, { messages: finalMessages });
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

  const handleMessageSelect = (message: Message, selectedText: string) => {
    if (selectedText) {
      setBranchSelection({ message, text: selectedText });
    } else {
      // Clear selection when text is empty
      setBranchSelection(null);
    }
  };

  const handleBranch = () => {
    if (onBranch && branchSelection) {
      const branchContext: BranchContext = {
        sourceConversationId: conversation.id,
        sourceMessageId: branchSelection.message.id,
        selectedText: branchSelection.text,
      };
      onBranch(branchContext);
      setBranchSelection(null);
    }
  };

  const handleBranchToExistingConversation = (conversationId: string) => {
    if (onBranchToConversation && branchSelection) {
      onBranchToConversation(conversationId, branchSelection.text);
      setBranchSelection(null);
    }
  };

  const handleModelChange = async (newModel: string) => {
    setSelectedModel(newModel);
    await updateConversation(conversation.id, { model: newModel });
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
    <div className={`flex flex-col h-full bg-black border-r border-zinc-800 md:border-r-0`}>
      {/* Header */}
      <div className="h-11 md:h-12 flex items-center justify-between px-3 border-b border-zinc-800 bg-zinc-950 flex-shrink-0">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <h2 className="text-xs md:text-sm font-medium text-white truncate font-mono">
            {conversation.title || `CONVERSATION ${conversation.position + 1}`}
          </h2>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowModelSelector(!showModelSelector)}
            className="p-2 md:p-2 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-colors min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0"
            title="Change model"
          >
            <Settings className="w-4 h-4 text-zinc-500" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 md:p-2 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-colors min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0"
              title="Close conversation"
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
      <div className="flex-1 min-h-0 overflow-hidden">
        <MessageList
          messages={messages}
          isStreaming={isStreaming}
          streamingContent={streamingContent}
          onMessageSelect={handleMessageSelect}
        />
      </div>

      {/* Input */}
      <div className="flex-shrink-0">
        <MessageInput
          onSend={handleSendMessage}
          disabled={isStreaming}
          mentionedTexts={conversation.mentionedTexts || (conversation.initialInput ? [conversation.initialInput] : [])}
        />
      </div>

      {/* Branch Button */}
      {branchSelection && (
        <BranchButton
          onBranch={handleBranch}
          onBranchToConversation={handleBranchToExistingConversation}
          availableConversations={availableConversations}
          currentConversationId={conversation.id}
        />
      )}
    </div>
  );
}
