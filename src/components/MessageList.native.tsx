import { useEffect, useRef } from 'react';
import { View, Text, FlatList, ScrollView } from 'react-native';
import type { Message } from '@/lib/types';
import { User, Bot, Sparkles } from 'lucide-react-native';
import { MessageContent } from './MessageContent.native';

interface MessageListProps {
  messages: Message[];
  isStreaming?: boolean;
  streamingContent?: string;
  onTextSelect?: (text: string, messageId: string) => void;
}

export function MessageList({
  messages,
  isStreaming = false,
  streamingContent = '',
  onTextSelect,
}: MessageListProps) {
  const flatListRef = useRef<FlatList>(null);
  const prevMessagesLengthRef = useRef(messages.length);
  const wasStreamingRef = useRef(isStreaming);

  // Auto-scroll when streaming starts
  useEffect(() => {
    const streamingJustStarted = isStreaming && !wasStreamingRef.current;

    if (streamingJustStarted && messages.length > 0) {
      // Scroll to end when streaming starts
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }

    prevMessagesLengthRef.current = messages.length;
    wasStreamingRef.current = isStreaming;
  }, [messages.length, isStreaming]);

  const renderMessage = ({ item: message }: { item: Message }) => (
    <View className="flex-row gap-3 px-3 py-3">
      <View className="w-7 h-7 bg-zinc-900 border border-zinc-800 items-center justify-center">
        {message.role === 'assistant' ? (
          <Bot size={14} color="#71717a" />
        ) : (
          <User size={14} color="#71717a" />
        )}
      </View>

      <View className="flex-1">
        {message.branchSourceMessageId && (
          <View className="border-b border-zinc-800 mb-2 pb-2">
            <View className="flex-row items-center">
              <Sparkles size={12} color="#71717a" />
              <Text className="text-xs text-zinc-500 ml-1 font-mono">
                BRANCHED FROM ANOTHER BRANCH
              </Text>
            </View>
            {message.branchSelectedText && (
              <Text className="text-xs text-zinc-600 italic mt-1">
                "{message.branchSelectedText.slice(0, 100)}
                {message.branchSelectedText.length > 100 ? '...' : ''}"
              </Text>
            )}
          </View>
        )}

        <MessageContent
          content={message.content}
          onTextSelect={onTextSelect ? (text) => onTextSelect(text, message.id) : undefined}
        />
      </View>
    </View>
  );

  const renderStreamingMessage = () => {
    if (!isStreaming) return null;

    return (
      <View className="flex-row gap-3 px-3 py-3">
        <View className="w-7 h-7 bg-zinc-900 border border-zinc-800 items-center justify-center">
          <Bot size={14} color="#71717a" />
        </View>
        <View className="flex-1">
          <MessageContent content={streamingContent} />
          <View className="w-1.5 h-4 ml-1 bg-zinc-500 mt-2" />
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center px-3">
      <Sparkles size={48} color="#3f3f46" />
      <Text className="text-base font-mono text-white mt-4">START A NEW BRANCH</Text>
      <Text className="text-sm text-zinc-500 font-mono mt-2">
        TYPE A MESSAGE BELOW TO BEGIN
      </Text>
    </View>
  );

  if (messages.length === 0 && !isStreaming) {
    return (
      <View className="flex-1 bg-black">
        {renderEmptyState()}
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ flexGrow: 1 }}
        ListFooterComponent={renderStreamingMessage}
        initialNumToRender={20}
        maxToRenderPerBatch={10}
        windowSize={10}
      />
    </View>
  );
}
