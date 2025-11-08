'use client';

import { useEffect, useRef, useState } from 'react';
import type { Message } from '@/lib/types';
import { User, Bot, Sparkles } from 'lucide-react';
import { MessageContent } from './MessageContent';

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
  const streamingMessageRef = useRef<HTMLDivElement>(null);
  const prevMessagesLengthRef = useRef(messages.length);
  const wasStreamingRef = useRef(isStreaming);
  const [lastSelectedMessage, setLastSelectedMessage] = useState<Message | null>(null);
  const selectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll to top of new message when streaming starts
  useEffect(() => {
    const streamingJustStarted = isStreaming && !wasStreamingRef.current;
    const streamingJustEnded = !isStreaming && wasStreamingRef.current;

    // Only scroll when streaming starts, not when it ends
    if (streamingJustStarted && streamingMessageRef.current) {
      // Scroll to top of streaming message, not bottom
      streamingMessageRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start' // Changed from default to 'start' to show top of message
      });
    }

    // Don't scroll when streaming ends or when message count changes
    prevMessagesLengthRef.current = messages.length;
    wasStreamingRef.current = isStreaming;
  }, [messages.length, isStreaming, streamingContent]);

  // Global selection change handler for iOS Safari
  useEffect(() => {
    const handleGlobalSelectionChange = () => {
      // Clear any pending timeout
      if (selectionTimeoutRef.current) {
        clearTimeout(selectionTimeoutRef.current);
      }

      // Delay to ensure selection is stable (important for iOS Safari)
      selectionTimeoutRef.current = setTimeout(() => {
        const selection = window.getSelection();
        const selectedText = selection?.toString().trim();

        if (selectedText && onMessageSelect) {
          // Find which message contains the selection
          const anchorNode = selection?.anchorNode;
          if (anchorNode) {
            // Find the message element
            let messageElement = anchorNode.parentElement;
            while (messageElement && !messageElement.hasAttribute('data-message-id')) {
              messageElement = messageElement.parentElement;
            }

            if (messageElement) {
              const messageId = messageElement.getAttribute('data-message-id');
              const message = messages.find(m => m.id === messageId);
              if (message) {
                setLastSelectedMessage(message);
                onMessageSelect(message, selectedText);
              }
            }
          }
        } else if (!selectedText && onMessageSelect && lastSelectedMessage) {
          // Clear selection
          onMessageSelect(lastSelectedMessage, '');
          setLastSelectedMessage(null);
        }
      }, 150);
    };

    document.addEventListener('selectionchange', handleGlobalSelectionChange);

    return () => {
      document.removeEventListener('selectionchange', handleGlobalSelectionChange);
      if (selectionTimeoutRef.current) {
        clearTimeout(selectionTimeoutRef.current);
      }
    };
  }, [messages, onMessageSelect, lastSelectedMessage]);

  const handleTextSelection = (message: Message) => {
    // Use a small delay to ensure selection is finalized on iOS Safari
    setTimeout(() => {
      const selection = window.getSelection();
      const selectedText = selection?.toString().trim();
      if (selectedText && onMessageSelect) {
        onMessageSelect(message, selectedText);
      } else if (!selectedText && onMessageSelect) {
        // Clear selection when text is unselected
        onMessageSelect(message, '');
      }
    }, 100);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-black">
      {messages.length === 0 && !isStreaming && (
        <div className="flex flex-col items-center justify-center h-full text-center px-3">
          <Sparkles className="w-12 h-12 mb-4 text-zinc-700" />
          <p className="text-base font-mono text-white">START A NEW BRANCH</p>
          <p className="text-sm mt-2 text-zinc-500 font-mono">TYPE A MESSAGE BELOW TO BEGIN</p>
        </div>
      )}

      {messages.map((message) => (
        <div
          key={message.id}
          data-message-id={message.id}
          className="flex gap-3 px-3 py-3"
          onMouseUp={() => handleTextSelection(message)}
          onTouchEnd={() => handleTextSelection(message)}
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
                BRANCHED FROM ANOTHER BRANCH
                {message.branchSelectedText && (
                  <div className="mt-1 italic text-zinc-600">
                    &quot;{message.branchSelectedText.slice(0, 100)}
                    {message.branchSelectedText.length > 100 ? '...' : ''}&quot;
                  </div>
                )}
              </div>
            )}

            <MessageContent
              content={message.content}
              className="text-white text-base"
            />
          </div>
        </div>
      ))}

      {isStreaming && (
        <div ref={streamingMessageRef} className="flex gap-3 px-3 py-3">
          <div className="w-7 h-7 bg-zinc-900 border border-zinc-800 flex items-center justify-center flex-shrink-0">
            <Bot className="w-3.5 h-3.5 text-zinc-500" />
          </div>
          <div className="flex-1 min-w-0">
            <MessageContent
              content={streamingContent}
              className="text-zinc-300 text-base"
            />
            <span className="inline-block w-1.5 h-4 ml-1 bg-zinc-500 animate-pulse" />
          </div>
        </div>
      )}
    </div>
  );
}
