'use client';

import { useEffect, useState, useRef } from 'react';
import { GitBranch, ChevronDown } from 'lucide-react';

interface Conversation {
  id: string;
  title?: string;
  position: number;
}

interface BranchButtonProps {
  onBranch: () => void;
  onBranchToConversation?: (conversationId: string) => void;
  availableConversations?: Conversation[];
  currentConversationId?: string;
}

export function BranchButton({
  onBranch,
  onBranchToConversation,
  availableConversations = [],
  currentConversationId
}: BranchButtonProps) {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updatePosition = () => {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0 && selection.toString().trim()) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        if (rect) {
          setPosition({
            x: rect.left + rect.width / 2,
            y: rect.top + window.scrollY,
          });
        }
      }
    };

    // Update position immediately
    updatePosition();

    // Update position on scroll/resize
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, []);

  const handleBranch = () => {
    onBranch();
    // Clear selection
    window.getSelection()?.removeAllRanges();
    setShowDropdown(false);
  };

  const handleBranchToConversation = (conversationId: string) => {
    if (onBranchToConversation) {
      onBranchToConversation(conversationId);
      // Clear selection
      window.getSelection()?.removeAllRanges();
      setShowDropdown(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  if (!position) {
    return null;
  }

  const otherConversations = availableConversations.filter(c => c.id !== currentConversationId);
  const hasOtherConversations = otherConversations.length > 0;

  return (
    <div
      ref={dropdownRef}
      className="absolute z-50 transform -translate-x-1/2 -translate-y-full -mt-2"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <div className="flex items-center gap-0 shadow-lg shadow-black/50">
        {/* Main Branch Button */}
        <button
          onClick={handleBranch}
          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-l-lg flex items-center gap-2 text-sm transition-colors"
          title="Branch to new conversation"
        >
          <GitBranch className="w-4 h-4" />
          New
        </button>

        {/* Dropdown Toggle (only show if there are other conversations) */}
        {hasOtherConversations && (
          <>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="px-2 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-r-lg border-l border-blue-800 transition-colors"
              title="Branch to existing conversation"
            >
              <ChevronDown className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute top-full mt-1 left-0 bg-gray-900 rounded-lg shadow-xl border border-white/10 min-w-[200px] max-h-[300px] overflow-y-auto">
                <div className="py-1">
                  <div className="px-3 py-2 text-xs font-semibold text-gray-400 border-b border-white/10">
                    Branch to conversation
                  </div>
                  {otherConversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => handleBranchToConversation(conv.id)}
                      className="w-full text-left px-3 py-2 text-sm text-gray-200 hover:bg-white/5 flex items-center gap-2 transition-colors"
                    >
                      <GitBranch className="w-3 h-3 text-gray-500" />
                      <span className="truncate">
                        {conv.title || `Conversation ${conv.position + 1}`}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
