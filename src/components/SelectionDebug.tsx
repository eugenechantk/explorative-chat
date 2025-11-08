'use client';

import { useEffect, useState } from 'react';

interface SelectionDebugProps {
  logs: string[];
  selectedText: string | null;
  hasSelection: boolean;
  messageId: string | null;
  cssInfo: {
    userSelect: string;
    webkitUserSelect: string;
    touchCallout: string;
  } | null;
}

export function SelectionDebug({
  logs,
  selectedText,
  hasSelection,
  messageId,
  cssInfo,
}: SelectionDebugProps) {
  const [supportsTest, setSupportsTest] = useState<boolean>(false);

  useEffect(() => {
    // Test if @supports query matches
    const testEl = document.createElement('div');
    testEl.style.webkitTouchCallout = 'default';
    setSupportsTest(CSS.supports('-webkit-touch-callout', 'default'));
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-zinc-950 border-t border-zinc-700 p-3 max-h-64 overflow-y-auto z-50 text-xs font-mono">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-white font-bold">DEBUG INFO</h3>
        <div className="text-zinc-500">iOS Safari Text Selection</div>
      </div>

      <div className="space-y-1 mb-3">
        <div className="flex gap-2">
          <span className="text-zinc-500">CSS Supports:</span>
          <span className={supportsTest ? 'text-green-400' : 'text-yellow-400'}>
            {supportsTest ? 'YES' : 'NO (fallback active)'}
          </span>
        </div>

        <div className="flex gap-2">
          <span className="text-zinc-500">Has Selection:</span>
          <span className={hasSelection ? 'text-green-400' : 'text-red-400'}>
            {hasSelection ? 'YES' : 'NO'}
          </span>
        </div>

        <div className="flex gap-2">
          <span className="text-zinc-500">Selected Text:</span>
          <span className="text-white truncate max-w-xs">
            {selectedText ? `"${selectedText}"` : 'null'}
          </span>
        </div>

        <div className="flex gap-2">
          <span className="text-zinc-500">Message ID:</span>
          <span className="text-white">
            {messageId || 'null'}
          </span>
        </div>

        {cssInfo && (
          <div className="mt-2 p-2 bg-zinc-900 rounded">
            <div className="text-zinc-400 mb-1">Computed CSS:</div>
            <div className="flex gap-2">
              <span className="text-zinc-500">user-select:</span>
              <span className="text-blue-400">{cssInfo.userSelect}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-zinc-500">-webkit-user-select:</span>
              <span className="text-blue-400">{cssInfo.webkitUserSelect}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-zinc-500">-webkit-touch-callout:</span>
              <span className="text-blue-400">{cssInfo.touchCallout}</span>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-zinc-800 pt-2">
        <div className="text-zinc-400 mb-1">Event Log:</div>
        <div className="space-y-0.5 max-h-32 overflow-y-auto">
          {logs.map((log, i) => (
            <div key={i} className="text-zinc-300">
              {log}
            </div>
          ))}
          {logs.length === 0 && (
            <div className="text-zinc-600 italic">No events yet...</div>
          )}
        </div>
      </div>
    </div>
  );
}
