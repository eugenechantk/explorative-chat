'use client';

import { useState } from 'react';
import type { ConversationGroup } from '@/lib/types';
import { FolderOpen, Trash2, Calendar } from 'lucide-react';

interface GroupsListProps {
  groups: ConversationGroup[];
  activeGroupId?: string;
  onSelectGroup: (group: ConversationGroup) => void;
  onDeleteGroup: (groupId: string) => void;
}

export function GroupsList({ groups, activeGroupId, onSelectGroup, onDeleteGroup }: GroupsListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (e: React.MouseEvent, groupId: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this group and all its conversations?')) {
      setDeletingId(groupId);
      await onDeleteGroup(groupId);
      setDeletingId(null);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-3">
        <FolderOpen className="w-12 h-12 mb-2 text-zinc-700" />
        <p className="text-sm text-center text-zinc-400 font-mono">NO SAVED GROUPS YET</p>
        <p className="text-xs text-center mt-1 text-zinc-600 font-mono">CREATE A CONVERSATION TO GET STARTED</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-3 border-b border-zinc-800">
        <h2 className="text-sm font-semibold text-white font-mono">SAVED GROUPS</h2>
        <p className="text-xs text-zinc-600 mt-0.5 font-mono">{groups.length} GROUP{groups.length !== 1 ? 'S' : ''}</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {groups.map((group) => (
          <div
            key={group.id}
            onClick={() => onSelectGroup(group)}
            className={`w-full text-left px-3 py-2 border-b border-zinc-800 hover:bg-zinc-950 transition-colors cursor-pointer ${
              activeGroupId === group.id ? 'bg-zinc-900' : ''
            } ${deletingId === group.id ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-5 h-5 bg-zinc-800 flex items-center justify-center flex-shrink-0">
                    <FolderOpen className="w-3 h-3 text-zinc-400" />
                  </div>
                  <h3 className="text-sm truncate text-white font-mono leading-snug">
                    {group.name || `GROUP ${group.conversationIds.length} CONVERSATIONS`}
                  </h3>
                </div>
                <div className="flex items-center gap-3 text-xs text-zinc-600 font-mono">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(group.updatedAt).toUpperCase()}
                  </span>
                  <span>{group.conversationIds.length} CONV{group.conversationIds.length !== 1 ? 'S' : ''}</span>
                </div>
                {group.tags && group.tags.length > 0 && (
                  <div className="flex gap-1 mt-2">
                    {group.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-1.5 py-0.5 text-xs bg-zinc-800 text-zinc-400 font-mono border border-zinc-700"
                      >
                        {tag.toUpperCase()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={(e) => handleDelete(e, group.id)}
                className="p-1 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 text-zinc-500 transition-colors"
                disabled={deletingId === group.id}
                title="Delete group"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
