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

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  const handleTextSelection = (message: Message) => {
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim();
    if (selectedText && onMessageSelect) {
      onMessageSelect(message, selectedText);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
          className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          onMouseUp={() => handleTextSelection(message)}
        >
          {message.role === 'assistant' && (
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
          )}

          <div
            className={`max-w-[80%] rounded-lg px-4 py-3 ${
              message.role === 'user'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
            }`}
          >
            {message.branchSourceMessageId && (
              <div className="text-xs opacity-70 mb-2 pb-2 border-b border-current/20">
                <Sparkles className="w-3 h-3 inline mr-1" />
                Branched conversation
                {message.branchSelectedText && (
                  <div className="mt-1 italic">
                    &quot;{message.branchSelectedText.slice(0, 100)}
                    {message.branchSelectedText.length > 100 ? '...' : ''}&quot;
                  </div>
                )}
              </div>
            )}
            <div className="whitespace-pre-wrap break-words">{message.content}</div>
            <div className="text-xs opacity-50 mt-2">
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>

          {message.role === 'user' && (
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
          )}
        </div>
      ))}

      {isStreaming && (
        <div className="flex gap-3 justify-start">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div className="max-w-[80%] rounded-lg px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100">
            <div className="whitespace-pre-wrap break-words">
              {streamingContent}
              <span className="inline-block w-2 h-4 ml-1 bg-current animate-pulse" />
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
