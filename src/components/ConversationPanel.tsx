'use client';

import { useState, useEffect, useRef } from 'react';
import type { Conversation, Message, BranchContext } from '@/lib/types';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { BranchButton } from './BranchButton';
import { OpenRouterClient, getStoredApiKey, POPULAR_MODELS } from '@/lib/openrouter/client';
import { createMessage, updateConversation, generateId } from '@/lib/storage/operations';
import { X, Settings, Plus } from 'lucide-react';

interface ConversationPanelProps {
  conversation: Conversation;
  onClose?: () => void;
  onBranch?: (branchContext: BranchContext) => void;
  onMessagesUpdate?: (messages: Message[]) => void;
  isActive?: boolean;
}

export function ConversationPanel({
  conversation,
  onClose,
  onBranch,
  onMessagesUpdate,
  isActive = false,
}: ConversationPanelProps) {
  const [messages, setMessages] = useState<Message[]>(conversation.messages || []);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [selectedModel, setSelectedModel] = useState(conversation.model || POPULAR_MODELS[0].id);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [branchSelection, setBranchSelection] = useState<{ message: Message; text: string } | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Sync messages with parent
  useEffect(() => {
    onMessagesUpdate?.(messages);
  }, [messages, onMessagesUpdate]);

  const handleSendMessage = async (content: string) => {
    const apiKey = getStoredApiKey();
    if (!apiKey) {
      alert('Please set your OpenRouter API key in settings');
      return;
    }

    // Create user message
    const userMessage: Message = {
      id: generateId(),
      conversationId: conversation.id,
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    // Save user message to storage
    await createMessage(userMessage);
    await updateConversation(conversation.id, { messages: updatedMessages });

    // Start streaming assistant response
    setIsStreaming(true);
    setStreamingContent('');

    const client = new OpenRouterClient(apiKey);
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
        alert('Error communicating with OpenRouter API. Please check your API key and try again.');
      }
    } finally {
      setIsStreaming(false);
      setStreamingContent('');
      abortControllerRef.current = null;
    }
  };

  const handleMessageSelect = (message: Message, selectedText: string) => {
    setBranchSelection({ message, text: selectedText });
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
    <div className={`flex flex-col h-full bg-white dark:bg-gray-900 ${isActive ? 'ring-2 ring-blue-500' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <h2 className="text-sm font-medium truncate">
            {conversation.title || `Conversation ${conversation.position + 1}`}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowModelSelector(!showModelSelector)}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
            title="Change model"
          >
            <Settings className="w-4 h-4" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
              title="Close conversation"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Model Selector */}
      {showModelSelector && (
        <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Select Model</label>
          <select
            value={selectedModel}
            onChange={(e) => handleModelChange(e.target.value)}
            className="w-full text-sm px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {POPULAR_MODELS.map((model) => (
              <option key={model.id} value={model.id}>
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
        onMessageSelect={handleMessageSelect}
      />

      {/* Input */}
      <MessageInput onSend={handleSendMessage} disabled={isStreaming} />

      {/* Branch Button */}
      {branchSelection && <BranchButton onBranch={handleBranch} />}
    </div>
  );
}
