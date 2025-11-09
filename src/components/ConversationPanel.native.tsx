import { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Platform, Alert } from 'react-native';
import type { Branch, Message } from '@/lib/types';
import { MessageList } from './MessageList.native';
import { MessageInput } from './MessageInput.native';
import { OpenRouterClient, POPULAR_MODELS } from '@/lib/openrouter/client';
import {
  createMessage,
  updateBranch,
  generateId,
  getConversation,
  updateConversation
} from '@/lib/storage/operations';
import { generateConversationTitle } from '@/lib/openrouter/generateTitle';
import { X, Settings } from 'lucide-react-native';

interface ConversationPanelProps {
  conversation: Branch;
  onClose?: () => void;
  onConversationUpdated?: () => void;
  isActive?: boolean;
}

export function ConversationPanel({
  conversation,
  onClose,
  onConversationUpdated,
  isActive = false,
}: ConversationPanelProps) {
  const [messages, setMessages] = useState<Message[]>(conversation.messages || []);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [selectedModel, setSelectedModel] = useState(conversation.model || POPULAR_MODELS[0].id);
  const [showModelSelector, setShowModelSelector] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const prevBranchIdRef = useRef(conversation.id);

  // Sync messages from branch prop changes
  useEffect(() => {
    if (prevBranchIdRef.current !== conversation.id) {
      setMessages(conversation.messages || []);
      prevBranchIdRef.current = conversation.id;
    } else if (conversation.messages && conversation.messages.length > messages.length) {
      setMessages(conversation.messages);
    }
  }, [conversation.id, conversation.messages]);

  const handleSendMessage = async (content: string, mentionedTexts?: string[]) => {
    // Combine mentioned texts and user content
    let fullContent = content;
    if (mentionedTexts && mentionedTexts.length > 0) {
      const referencesSection = mentionedTexts
        .map((text, index) => `[Reference ${index + 1}]\n${text}`)
        .join('\n\n');
      fullContent = `${referencesSection}\n\n---\n\n${content}`;
    }

    // Create user message
    const userMessage: Message = {
      id: generateId(),
      branchId: conversation.id,
      role: 'user',
      content: fullContent,
      timestamp: Date.now(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    // Save user message
    await createMessage(userMessage);
    await updateBranch(conversation.id, { messages: updatedMessages, mentionedTexts: [] });

    // Generate title after first message in first branch
    if (updatedMessages.length === 1 && conversation.position === 0) {
      const conversationData = await getConversation(conversation.conversationId);

      if (conversationData && !conversationData.name) {
        generateConversationTitle(userMessage.content, '').then((title) => {
          return updateConversation(conversation.conversationId, { name: title });
        }).then(() => {
          if (onConversationUpdated) {
            onConversationUpdated();
          }
        }).catch((error) => {
          console.error('Error generating title:', error);
        });
      }
    }

    // Stream LLM response
    setIsStreaming(true);
    setStreamingContent('');

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const client = new OpenRouterClient();
      const conversationMessages = [...updatedMessages].map(m => ({
        role: m.role,
        content: m.content,
      }));

      let fullResponse = '';

      for await (const chunk of client.streamChat(
        selectedModel,
        conversationMessages,
        abortController.signal
      )) {
        fullResponse += chunk;
        setStreamingContent(fullResponse);
      }

      // Save assistant message
      const assistantMessage: Message = {
        id: generateId(),
        branchId: conversation.id,
        role: 'assistant',
        content: fullResponse,
        timestamp: Date.now(),
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);
      await createMessage(assistantMessage);
      await updateBranch(conversation.id, { messages: finalMessages });

    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Streaming aborted');
      } else {
        console.error('Streaming error:', error);
        Alert.alert('Error', 'Failed to get response from AI');
      }
    } finally {
      setIsStreaming(false);
      setStreamingContent('');
      abortControllerRef.current = null;
    }
  };

  const handleModelChange = async (modelId: string) => {
    setSelectedModel(modelId);
    await updateBranch(conversation.id, { model: modelId });
    setShowModelSelector(false);
  };

  return (
    <View className="flex-1 bg-black border-r border-zinc-800">
      {/* Header */}
      <View className="border-b border-zinc-800 bg-zinc-950 px-3 py-3 flex-row items-center justify-between">
        <View className="flex-1">
          <TouchableOpacity
            onPress={() => setShowModelSelector(!showModelSelector)}
            className="flex-row items-center"
          >
            <Text className="text-white font-mono text-sm">
              {POPULAR_MODELS.find(m => m.id === selectedModel)?.name || 'Select Model'}
            </Text>
            <Settings size={14} color="#71717a" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </View>

        {onClose && (
          <TouchableOpacity onPress={onClose} className="p-2">
            <X size={16} color="#71717a" />
          </TouchableOpacity>
        )}
      </View>

      {/* Model Selector */}
      {showModelSelector && (
        <View className="bg-zinc-950 border-b border-zinc-800">
          {POPULAR_MODELS.map((model) => (
            <TouchableOpacity
              key={model.id}
              onPress={() => handleModelChange(model.id)}
              className={`px-3 py-3 border-b border-zinc-800 ${
                selectedModel === model.id ? 'bg-zinc-900' : ''
              }`}
            >
              <Text className="text-white font-mono text-sm">{model.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Messages */}
      <MessageList
        messages={messages}
        isStreaming={isStreaming}
        streamingContent={streamingContent}
      />

      {/* Input */}
      <MessageInput
        onSend={handleSendMessage}
        disabled={isStreaming}
        mentionedTexts={conversation.mentionedTexts}
        isStreaming={isStreaming}
      />
    </View>
  );
}
