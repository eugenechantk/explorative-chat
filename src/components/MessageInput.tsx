'use client';

import { useState, useRef, KeyboardEvent, useEffect } from 'react';
import { Send, Quote } from 'lucide-react';

interface MessageInputProps {
  onSend: (message: string, mentionedTexts?: string[]) => void;
  disabled?: boolean;
  placeholder?: string;
  initialValue?: string;
  mentionedTexts?: string[];
}

export function MessageInput({ onSend, disabled = false, placeholder = 'Type a message...', initialValue = '', mentionedTexts = [] }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [mentions, setMentions] = useState<string[]>(mentionedTexts);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync mentioned texts from props
  useEffect(() => {
    setMentions(mentionedTexts);
    // Focus on textarea after a short delay to ensure rendering
    if (mentionedTexts.length > 0) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [mentionedTexts]);

  const handleSend = () => {
    const trimmedMessage = message.trim();

    if ((trimmedMessage || mentions.length > 0) && !disabled) {
      onSend(trimmedMessage, mentions.length > 0 ? mentions : undefined);
      setMessage('');
      setMentions([]);
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleRemoveMention = (index: number) => {
    setMentions(mentions.filter((_, i) => i !== index));
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter, new line on Shift+Enter
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  const truncateText = (text: string, maxLines: number = 3) => {
    const lines = text.split('\n');
    if (lines.length > maxLines) {
      return lines.slice(0, maxLines).join('\n') + '...';
    }
    return text;
  };

  return (
    <div className="border-t border-white/10 bg-black/40 backdrop-blur-sm p-4">
      {/* Mentioned Texts Callouts */}
      {mentions.length > 0 && (
        <div className="mb-3 space-y-2">
          {mentions.map((mentionedText, index) => (
            <div key={index} className="bg-white/5 border border-white/10 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Quote className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-gray-400 mb-1">Referenced text {mentions.length > 1 ? `(${index + 1}/${mentions.length})` : ''}</div>
                  <div className="text-sm text-gray-300 whitespace-pre-wrap break-words line-clamp-3">
                    {truncateText(mentionedText, 3)}
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveMention(index)}
                  className="flex-shrink-0 text-gray-400 hover:text-gray-200 transition-colors"
                  aria-label="Remove reference"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2 items-end">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={mentions.length > 0 ? 'Add your message...' : placeholder}
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none rounded-lg border border-white/10 bg-white/5 text-gray-100 placeholder:text-gray-500 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed max-h-[200px] overflow-y-auto transition-all"
        />
        <button
          onClick={handleSend}
          disabled={disabled || (!message.trim() && mentions.length === 0)}
          className="flex-shrink-0 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-white/10 disabled:cursor-not-allowed text-white p-3 transition-colors"
          aria-label="Send message"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
      <div className="text-xs text-gray-500 mt-2">
        Press <kbd className="px-1.5 py-0.5 bg-white/10 text-gray-400 rounded text-xs">Enter</kbd> to send,{' '}
        <kbd className="px-1.5 py-0.5 bg-white/10 text-gray-400 rounded text-xs">Shift+Enter</kbd> for new line
      </div>
    </div>
  );
}
