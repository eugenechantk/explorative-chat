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
    <div className="flex-1 overflow-y-auto bg-black">
      {messages.length === 0 && !isStreaming && (
        <div className="flex flex-col items-center justify-center h-full text-center px-3">
          <Sparkles className="w-12 h-12 mb-4 text-zinc-700" />
          <p className="text-base font-mono text-white">START A NEW CONVERSATION</p>
          <p className="text-sm mt-2 text-zinc-500 font-mono">TYPE A MESSAGE BELOW TO BEGIN</p>
        </div>
      )}

      {messages.map((message) => (
        <div
          key={message.id}
          className="flex gap-3 px-3 py-3"
          onMouseUp={() => handleTextSelection(message)}
        >
          <div className="w-7 h-7 bg-zinc-900 border border-zinc-800 flex items-center justify-center flex-shrink-0">
            {message.role === 'assistant' ? (
              <Bot className="w-3.5 h-3.5 text-zinc-500" />
            ) : (
              <User className="w-3.5 h-3.5 text-zinc-500" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            {message.branchSourceMessageId && (
              <div className="text-xs text-zinc-500 mb-2 pb-2 border-b border-zinc-800 font-mono">
                <Sparkles className="w-3 h-3 inline mr-1" />
                BRANCHED CONVERSATION
                {message.branchSelectedText && (
                  <div className="mt-1 italic text-zinc-600">
                    &quot;{message.branchSelectedText.slice(0, 100)}
                    {message.branchSelectedText.length > 100 ? '...' : ''}&quot;
                  </div>
                )}
              </div>
            )}

            <div className="text-white text-sm leading-6 whitespace-pre-wrap break-words">
              {message.content}
            </div>

            <div className="text-xs text-zinc-600 mt-2 font-mono">
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              }).toUpperCase()}
            </div>
          </div>
        </div>
      ))}

      {isStreaming && (
        <div className="flex gap-3 px-3 py-3">
          <div className="w-7 h-7 bg-zinc-900 border border-zinc-800 flex items-center justify-center flex-shrink-0">
            <Bot className="w-3.5 h-3.5 text-zinc-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-zinc-300 text-sm leading-6 whitespace-pre-wrap break-words">
              {streamingContent}
              <span className="inline-block w-1.5 h-4 ml-1 bg-zinc-500 animate-pulse" />
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
