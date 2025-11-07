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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Keyboard className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Keyboard Shortcuts</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {shortcuts.map((section) => (
            <div key={section.category}>
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3 uppercase tracking-wide">
                {section.category}
              </h3>
              <div className="space-y-2">
                {section.items.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    <span className="text-sm text-gray-900 dark:text-gray-100">{shortcut.description}</span>
                    <kbd className="px-2 py-1 text-xs font-mono bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow-sm">
                      {shortcut.keys}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 text-center">
            Press <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">?</kbd> anytime to show this
            help
          </p>
        </div>
      </div>
    </div>
  );
}
