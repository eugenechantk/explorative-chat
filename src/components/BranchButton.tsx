'use client';

import { useState, useEffect } from 'react';
import { GitBranch } from 'lucide-react';

interface BranchButtonProps {
  onBranch: () => void;
}

export function BranchButton({ onBranch }: BranchButtonProps) {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [selectedText, setSelectedText] = useState('');

  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      const text = selection?.toString().trim();

      if (text && text.length > 0) {
        setSelectedText(text);

        // Get the position of the selection
        const range = selection?.getRangeAt(0);
        const rect = range?.getBoundingClientRect();

        if (rect) {
          setPosition({
            x: rect.left + rect.width / 2,
            y: rect.top - 10,
          });
        }
      } else {
        setPosition(null);
        setSelectedText('');
      }
    };

    // Listen for selection changes
    document.addEventListener('mouseup', handleSelectionChange);
    document.addEventListener('keyup', handleSelectionChange);

    return () => {
      document.removeEventListener('mouseup', handleSelectionChange);
      document.removeEventListener('keyup', handleSelectionChange);
    };
  }, []);

  const handleBranch = () => {
    onBranch();
    // Clear selection
    window.getSelection()?.removeAllRanges();
    setPosition(null);
    setSelectedText('');
  };

  if (!position || !selectedText) {
    return null;
  }

  return (
    <button
      onClick={handleBranch}
      className="fixed z-50 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg flex items-center gap-2 text-sm transform -translate-x-1/2 -translate-y-full animate-in fade-in slide-in-from-top-2 duration-200"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
      title="Branch conversation with selected text"
    >
      <GitBranch className="w-4 h-4" />
      Branch
    </button>
  );
}
