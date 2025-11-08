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

        if (rect && rect.width > 0 && rect.height > 0) {
          setPosition({
            x: rect.left + rect.width / 2,
            y: rect.top + window.scrollY,
          });
        }
      }
    };

    // Update position with a small delay for iOS Safari
    // iOS Safari needs time to finalize the selection
    const timer = setTimeout(updatePosition, 50);

    // Also update immediately in case it's ready
    updatePosition();

    // Update position on scroll/resize
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      clearTimeout(timer);
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

  // Prevent Safari from clearing selection when button is pressed
  const handleButtonMouseDown = (e: React.MouseEvent | React.TouchEvent, handler: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    handler();
  };

  // Close dropdown when clicking/touching outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
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
      data-branch-button
      className="absolute z-50 transform -translate-x-1/2 -translate-y-full -mt-2"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <div className="flex items-center gap-0 shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Main Branch Button */}
        <button
          onMouseDown={(e) => handleButtonMouseDown(e, handleBranch)}
          onTouchStart={(e) => handleButtonMouseDown(e, handleBranch)}
          className="px-4 py-3 md:py-2 bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-700 border border-zinc-700 text-white flex items-center gap-2 text-sm md:text-sm font-mono transition-colors min-h-[48px] md:min-h-[44px] cursor-pointer touch-manipulation"
          title="Branch to new branch"
        >
          <GitBranch className="w-4 h-4" />
          NEW
        </button>

        {/* Dropdown Toggle (only show if there are other branches) */}
        {hasOtherBranches && (
          <>
            <button
              onMouseDown={(e) => handleButtonMouseDown(e, () => setShowDropdown(!showDropdown))}
              onTouchStart={(e) => handleButtonMouseDown(e, () => setShowDropdown(!showDropdown))}
              className="px-3 py-3 md:py-2 bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-700 border border-zinc-700 border-l-0 transition-colors min-h-[48px] min-w-[48px] md:min-h-[44px] md:min-w-[44px] cursor-pointer touch-manipulation"
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
                      onMouseDown={(e) => handleButtonMouseDown(e, () => handleBranchToBranch(branch.id))}
                      onTouchStart={(e) => handleButtonMouseDown(e, () => handleBranchToBranch(branch.id))}
                      className="w-full text-left px-3 py-3 text-sm text-white hover:bg-zinc-950 active:bg-zinc-900 border-b border-zinc-800 flex items-center gap-2 transition-colors font-mono min-h-[48px] md:min-h-[44px] cursor-pointer touch-manipulation"
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
