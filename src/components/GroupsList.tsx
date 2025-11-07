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
      <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
        <FolderOpen className="w-12 h-12 mb-2 opacity-50" />
        <p className="text-sm text-center">No saved groups yet</p>
        <p className="text-xs text-center mt-1">Create a conversation to get started</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Saved Groups</h2>
        <p className="text-xs text-gray-500 mt-0.5">{groups.length} group{groups.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {groups.map((group) => (
          <button
            key={group.id}
            onClick={() => onSelectGroup(group)}
            className={`w-full text-left px-4 py-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
              activeGroupId === group.id ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500' : ''
            }`}
            disabled={deletingId === group.id}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <FolderOpen className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <h3 className="text-sm font-medium truncate">
                    {group.name || `Group ${group.conversationIds.length} conversations`}
                  </h3>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(group.updatedAt)}
                  </span>
                  <span>{group.conversationIds.length} conv{group.conversationIds.length !== 1 ? 's' : ''}</span>
                </div>
                {group.tags && group.tags.length > 0 && (
                  <div className="flex gap-1 mt-2">
                    {group.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={(e) => handleDelete(e, group.id)}
                className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded text-gray-400 hover:text-red-600 transition-colors"
                disabled={deletingId === group.id}
                title="Delete group"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
