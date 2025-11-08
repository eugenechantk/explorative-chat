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
    <div className="border-t border-zinc-800 bg-black">
      {/* Mentioned Texts Callouts */}
      {mentions.length > 0 && (
        <div className="px-3 pt-3 space-y-2">
          {mentions.map((mentionedText, index) => (
            <div key={index} className="bg-zinc-950 border border-zinc-800 p-3">
              <div className="flex items-start gap-2">
                <Quote className="w-4 h-4 text-zinc-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-zinc-600 mb-1 font-mono">REFERENCED TEXT {mentions.length > 1 ? `(${index + 1}/${mentions.length})` : ''}</div>
                  <div className="text-sm text-zinc-300 whitespace-pre-wrap break-words line-clamp-3">
                    {truncateText(mentionedText, 3)}
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveMention(index)}
                  className="flex-shrink-0 text-zinc-500 hover:text-zinc-300 transition-colors"
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

      <div className="flex items-stretch">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={mentions.length > 0 ? 'ADD YOUR MESSAGE...' : placeholder.toUpperCase()}
          disabled={disabled}
          rows={1}
          className="flex-1 bg-zinc-950 border-0 px-3 py-3 text-white placeholder:text-zinc-700 text-sm md:text-sm resize-none focus:outline-none font-mono disabled:opacity-50 disabled:cursor-not-allowed max-h-[200px] overflow-y-auto"
          style={{ fontSize: '16px' }}
        />
        <button
          onClick={handleSend}
          disabled={disabled || (!message.trim() && mentions.length === 0)}
          className="px-3 md:px-4 hover:bg-zinc-900 border-l border-zinc-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-zinc-300"
          aria-label="Send message"
        >
          <Send className="w-4 h-4 md:w-3.5 md:h-3.5" />
        </button>
      </div>
    </div>
  );
}
