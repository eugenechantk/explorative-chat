'use client';

import { useEffect, useState, useRef } from 'react';
import { GitBranch, ChevronDown } from 'lucide-react';

interface Branch {
  id: string;
  title?: string;
  position: number;
}

interface BranchButtonProps {
  onBranch: () => void;
  onBranchToConversation?: (branchId: string) => void;
  availableConversations?: Branch[];
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

  const handleBranchToBranch = (branchId: string) => {
    if (onBranchToConversation) {
      onBranchToConversation(branchId);
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

  const otherBranches = availableConversations.filter(c => c.id !== currentConversationId);
  const hasOtherBranches = otherBranches.length > 0;

  return (
    <div
      ref={dropdownRef}
      className="absolute z-50 transform -translate-x-1/2 -translate-y-full -mt-2"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <div className="flex items-center gap-0 shadow-2xl">
        {/* Main Branch Button */}
        <button
          onClick={handleBranch}
          className="px-3 py-2 md:py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white flex items-center gap-2 text-xs md:text-sm font-mono transition-colors min-h-[44px]"
          title="Branch to new branch"
        >
          <GitBranch className="w-4 h-4" />
          NEW
        </button>

        {/* Dropdown Toggle (only show if there are other branches) */}
        {hasOtherBranches && (
          <>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="px-2 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 border-l-0 transition-colors min-h-[44px] min-w-[44px]"
              title="Branch to existing branch"
            >
              <ChevronDown className={`w-4 h-4 text-white transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute top-full mt-1 left-0 bg-black border border-zinc-800 shadow-2xl min-w-[200px] md:min-w-[200px] max-h-[300px] overflow-y-auto z-50">
                <div>
                  <div className="px-3 py-2 text-xs font-semibold text-zinc-600 border-b border-zinc-800 font-mono">
                    BRANCH TO BRANCH
                  </div>
                  {otherBranches.map((branch) => (
                    <button
                      key={branch.id}
                      onClick={() => handleBranchToBranch(branch.id)}
                      className="w-full text-left px-3 py-3 md:py-2 text-sm text-white hover:bg-zinc-950 border-b border-zinc-800 flex items-center gap-2 transition-colors font-mono min-h-[44px]"
                    >
                      <GitBranch className="w-3 h-3 text-zinc-500" />
                      <span className="truncate">
                        {branch.title || `BRANCH ${branch.position + 1}`}
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
