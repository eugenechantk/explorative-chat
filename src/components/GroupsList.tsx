'use client';

import { useState } from 'react';
import type { Conversation } from '@/lib/types';
import { FolderOpen, Trash2, Calendar } from 'lucide-react';

interface GroupsListProps {
  groups: Conversation[];
  activeGroupId?: string;
  onSelectGroup: (group: Conversation) => void;
  onDeleteGroup: (groupId: string) => void;
}

export function GroupsList({ groups, activeGroupId, onSelectGroup, onDeleteGroup }: GroupsListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this conversation and all its branches?')) {
      setDeletingId(conversationId);
      await onDeleteGroup(conversationId);
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
        <p className="text-sm text-center text-zinc-400 font-mono">NO SAVED CONVERSATIONS YET</p>
        <p className="text-xs text-center mt-1 text-zinc-600 font-mono">CREATE A CONVERSATION TO GET STARTED</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        {groups.map((conversation) => (
          <div
            key={conversation.id}
            onClick={() => onSelectGroup(conversation)}
            className={`w-full text-left px-3 py-3 md:py-2 border-b border-zinc-800 hover:bg-zinc-950 transition-colors cursor-pointer min-h-[60px] md:min-h-0 ${
              activeGroupId === conversation.id ? 'bg-zinc-900' : ''
            } ${deletingId === conversation.id ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-5 h-5 bg-zinc-800 flex items-center justify-center flex-shrink-0">
                    <FolderOpen className="w-3 h-3 text-zinc-400" />
                  </div>
                  <h3 className="text-sm truncate text-white font-mono leading-snug">
                    {conversation.name || `CONVERSATION ${(conversation.branchIds || []).length} BRANCHES`}
                  </h3>
                </div>
                <div className="flex items-center gap-3 text-xs text-zinc-600 font-mono">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(conversation.updatedAt).toUpperCase()}
                  </span>
                  <span>{(conversation.branchIds || []).length} BRANCH{(conversation.branchIds || []).length !== 1 ? 'ES' : ''}</span>
                </div>
                {conversation.tags && conversation.tags.length > 0 && (
                  <div className="flex gap-1 mt-2">
                    {conversation.tags.map((tag, i) => (
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
                onClick={(e) => handleDelete(e, conversation.id)}
                className="p-2 md:p-1 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 text-zinc-500 transition-colors min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0 flex items-center justify-center"
                disabled={deletingId === conversation.id}
                title="Delete conversation"
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
