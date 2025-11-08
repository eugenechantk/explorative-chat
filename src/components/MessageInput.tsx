'use client';

import { useState, useRef, KeyboardEvent, useEffect } from 'react';
import { Send, Quote, Loader2 } from 'lucide-react';

interface MessageInputProps {
  onSend: (message: string, mentionedTexts?: string[]) => void;
  disabled?: boolean;
  placeholder?: string;
  initialValue?: string;
  mentionedTexts?: string[];
  isStreaming?: boolean;
}

export function MessageInput({ onSend, disabled = false, placeholder = 'Type a message...', initialValue = '', mentionedTexts = [], isStreaming = false }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [mentions, setMentions] = useState<string[]>(mentionedTexts);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync mentioned texts from props and auto-focus when they change
  // Note: This pattern syncs props to state, which is intentional for this component
  // The component needs local state because users can remove mentions
  /* eslint-disable react-compiler/react-compiler */
  useEffect(() => {
    // Update local state when prop changes (needed for prop-to-state sync pattern)
    setMentions(mentionedTexts);

    // Focus on textarea after a delay to ensure rendering and scroll animations complete
    // Delay (1000ms) accounts for: panel render (~0ms) + scroll delay (100ms) + smooth scroll animation (~500ms)
    if (mentionedTexts.length > 0) {
      // Clear any existing timeout to avoid multiple focuses
      if (focusTimeoutRef.current) {
        clearTimeout(focusTimeoutRef.current);
      }

      focusTimeoutRef.current = setTimeout(() => {
        // Focus the textarea if it exists
        if (textareaRef.current) {
          console.log('[MessageInput] Auto-focusing textarea, current activeElement:', document.activeElement?.tagName);
          textareaRef.current.focus();
          // Verify focus was successful
          setTimeout(() => {
            console.log('[MessageInput] Focus result - activeElement:', document.activeElement?.tagName, 'is textarea:', document.activeElement === textareaRef.current);
          }, 100);
        } else {
          console.log('[MessageInput] Cannot focus - textarea ref not available');
        }
        focusTimeoutRef.current = null;
      }, 1000);
    }

    // Cleanup timeout on unmount
    return () => {
      if (focusTimeoutRef.current) {
        clearTimeout(focusTimeoutRef.current);
        focusTimeoutRef.current = null;
      }
    };
  }, [mentionedTexts]);
  /* eslint-enable react-compiler/react-compiler */

  const handleSend = () => {
    const trimmedMessage = message.trim();

    if ((trimmedMessage || mentions.length > 0) && !disabled) {
      onSend(trimmedMessage, mentions.length > 0 ? mentions : undefined);
      setMessage('');
      setMentions([]);
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        // Blur to close mobile keyboard
        textareaRef.current.blur();
      }
      // Scroll to top after keyboard closes to show header
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
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
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
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
        <div className="px-3 pt-3 pb-3 space-y-2 border-b border-zinc-800">
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
                  className="flex-shrink-0 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
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
          placeholder={mentions.length > 0 ? 'Add your message...' : placeholder}
          disabled={disabled}
          rows={1}
          className="flex-1 bg-zinc-950 border-0 px-3 py-3 text-white placeholder:text-zinc-700 resize-none focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed max-h-[120px] overflow-y-auto"
          style={{ fontSize: '16px', fontFamily: 'system-ui, -apple-system, sans-serif' }}
        />
        <button
          onClick={handleSend}
          disabled={disabled || (!message.trim() && mentions.length === 0)}
          className="px-3 md:px-4 hover:bg-zinc-900 border-l border-zinc-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-zinc-300 cursor-pointer"
          aria-label="Send message"
        >
          {isStreaming ? (
            <Loader2 className="w-4 h-4 md:w-3.5 md:h-3.5 animate-spin" />
          ) : (
            <Send className="w-4 h-4 md:w-3.5 md:h-3.5" />
          )}
        </button>
      </div>
    </div>
  );
}
