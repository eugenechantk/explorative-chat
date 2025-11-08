'use client';

import { X, Keyboard } from 'lucide-react';
import { formatShortcut } from '@/hooks/useKeyboardShortcuts';

interface Shortcut {
  keys: string;
  description: string;
}

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsHelp({ isOpen, onClose }: KeyboardShortcutsHelpProps) {
  if (!isOpen) return null;

  const shortcuts: { category: string; items: Shortcut[] }[] = [
    {
      category: 'Navigation',
      items: [
        { keys: formatShortcut({ key: '[', metaKey: true }), description: 'Previous conversation' },
        { keys: formatShortcut({ key: ']', metaKey: true }), description: 'Next conversation' },
      ],
    },
    {
      category: 'Groups',
      items: [
        { keys: formatShortcut({ key: 't', metaKey: true }), description: 'New group' },
        { keys: formatShortcut({ key: 's', metaKey: true, shiftKey: true }), description: 'Save group' },
      ],
    },
    {
      category: 'Conversations',
      items: [
        { keys: formatShortcut({ key: 'n', metaKey: true }), description: 'New conversation' },
        { keys: formatShortcut({ key: 'w', metaKey: true }), description: 'Close conversation' },
        { keys: formatShortcut({ key: 'b', metaKey: true }), description: 'Branch selected text' },
      ],
    },
    {
      category: 'Other',
      items: [
        { keys: formatShortcut({ key: '?' }), description: 'Show this help' },
        { keys: formatShortcut({ key: 'Escape' }), description: 'Close dialog' },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-black border border-zinc-800 shadow-2xl p-3 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-zinc-500" />
            <h2 className="text-base font-bold text-white font-mono">KEYBOARD SHORTCUTS</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-colors"
          >
            <X className="w-4 h-4 text-zinc-500" />
          </button>
        </div>

        <div className="space-y-4">
          {shortcuts.map((section) => (
            <div key={section.category}>
              <h3 className="text-xs font-semibold text-zinc-600 mb-2 uppercase tracking-wide font-mono">
                {section.category}
              </h3>
              <div className="space-y-1">
                {section.items.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 px-3 bg-zinc-950 border-b border-zinc-900"
                  >
                    <span className="text-sm text-white font-mono">{shortcut.description}</span>
                    <kbd className="px-2 py-1 text-xs font-mono bg-zinc-900 border border-zinc-700 text-zinc-300">
                      {shortcut.keys}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-3 border-t border-zinc-800">
          <p className="text-xs text-zinc-500 text-center font-mono">
            PRESS <kbd className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-700 text-zinc-400 font-mono">?</kbd> ANYTIME TO SHOW THIS HELP
          </p>
        </div>
      </div>
    </div>
  );
}
