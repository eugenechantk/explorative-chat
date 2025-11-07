'use client';

import { useEffect, useRef } from 'react';
import type { Message } from '@/lib/types';
import { User, Bot, Sparkles } from 'lucide-react';

interface MessageListProps {
  messages: Message[];
  isStreaming?: boolean;
  streamingContent?: string;
  onMessageSelect?: (message: Message, selectedText: string) => void;
}

export function MessageList({
  messages,
  isStreaming = false,
  streamingContent = '',
  onMessageSelect,
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevMessagesLengthRef = useRef(messages.length);
  const wasStreamingRef = useRef(isStreaming);

  // Auto-scroll to bottom only when new messages arrive or streaming starts
  useEffect(() => {
    const shouldScroll =
      messages.length > prevMessagesLengthRef.current || // New message added
      (isStreaming && !wasStreamingRef.current) || // Streaming just started
      (isStreaming && streamingContent); // Streaming in progress

    if (shouldScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }

    prevMessagesLengthRef.current = messages.length;
    wasStreamingRef.current = isStreaming;
  }, [messages.length, isStreaming, streamingContent]);

  const handleTextSelection = (message: Message) => {
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim();
    if (selectedText && onMessageSelect) {
      onMessageSelect(message, selectedText);
    } else if (!selectedText && onMessageSelect) {
      // Clear selection when text is unselected
      onMessageSelect(message, '');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {messages.length === 0 && !isStreaming && (
        <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
          <Sparkles className="w-12 h-12 mb-4 opacity-50" />
          <p className="text-lg">Start a new conversation</p>
          <p className="text-sm mt-2">Type a message below to begin</p>
        </div>
      )}

      {messages.map((message) => (
        <div
          key={message.id}
          className="flex gap-4 group"
          onMouseUp={() => handleTextSelection(message)}
        >
          <div className="flex-shrink-0 w-7 h-7 rounded-md bg-white/5 flex items-center justify-center text-gray-400">
            {message.role === 'assistant' ? (
              <Bot className="w-4 h-4" />
            ) : (
              <User className="w-4 h-4" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            {message.branchSourceMessageId && (
              <div className="text-xs text-gray-500 mb-2 pb-2 border-b border-white/10">
                <Sparkles className="w-3 h-3 inline mr-1" />
                Branched conversation
                {message.branchSelectedText && (
                  <div className="mt-1 italic text-gray-600">
                    &quot;{message.branchSelectedText.slice(0, 100)}
                    {message.branchSelectedText.length > 100 ? '...' : ''}&quot;
                  </div>
                )}
              </div>
            )}

            <div className="prose prose-invert max-w-none">
              <div className="text-[15px] leading-7 text-gray-200 whitespace-pre-wrap break-words">
                {message.content}
              </div>
            </div>

            <div className="text-xs text-gray-600 mt-2">
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
        </div>
      ))}

      {isStreaming && (
        <div className="flex gap-4 group">
          <div className="flex-shrink-0 w-7 h-7 rounded-md bg-white/5 flex items-center justify-center text-gray-400">
            <Bot className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="prose prose-invert max-w-none">
              <div className="text-[15px] leading-7 text-gray-200 whitespace-pre-wrap break-words">
                {streamingContent}
                <span className="inline-block w-1.5 h-4 ml-1 bg-blue-500 animate-pulse rounded-sm" />
              </div>
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
