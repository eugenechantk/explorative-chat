import { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Platform, Keyboard } from 'react-native';
import { Send, Quote, Loader2 } from 'lucide-react-native';

interface MessageInputProps {
  onSend: (message: string, mentionedTexts?: string[]) => void;
  disabled?: boolean;
  placeholder?: string;
  initialValue?: string;
  mentionedTexts?: string[];
  isStreaming?: boolean;
}

export function MessageInput({
  onSend,
  disabled = false,
  placeholder = 'Type a message...',
  initialValue = '',
  mentionedTexts = [],
  isStreaming = false,
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [mentions, setMentions] = useState<string[]>(mentionedTexts);
  const [inputHeight, setInputHeight] = useState(40);
  const textInputRef = useRef<TextInput>(null);

  // Sync mentioned texts from props
  useEffect(() => {
    setMentions(mentionedTexts);
  }, [mentionedTexts]);

  const handleSend = () => {
    const trimmedMessage = message.trim();

    if ((trimmedMessage || mentions.length > 0) && !disabled) {
      onSend(trimmedMessage, mentions.length > 0 ? mentions : undefined);
      setMessage('');
      setMentions([]);
      setInputHeight(40); // Reset height

      // Dismiss keyboard
      Keyboard.dismiss();
    }
  };

  const handleRemoveMention = (index: number) => {
    setMentions(mentions.filter((_, i) => i !== index));
  };

  const truncateText = (text: string, maxLines: number = 3) => {
    const lines = text.split('\n');
    if (lines.length > maxLines) {
      return lines.slice(0, maxLines).join('\n') + '...';
    }
    return text;
  };

  const handleContentSizeChange = (event: any) => {
    // Auto-resize with max height of 200px
    const height = Math.min(Math.max(40, event.nativeEvent.contentSize.height), 200);
    setInputHeight(height);
  };

  return (
    <View className="border-t border-zinc-800 bg-black">
      {/* Mentioned Texts Callouts */}
      {mentions.length > 0 && (
        <ScrollView className="px-3 pt-3 pb-3 border-b border-zinc-800 max-h-96">
          <View className="gap-2">
            {mentions.map((mentionedText, index) => (
              <View key={index} className="bg-zinc-950 border border-zinc-800 p-3">
                <View className="flex-row items-start gap-2">
                  <Quote size={16} color="#71717a" style={{ marginTop: 2 }} />
                  <View className="flex-1">
                    <Text className="text-xs font-mono text-zinc-600 mb-1">
                      REFERENCED TEXT {mentions.length > 1 ? `(${index + 1}/${mentions.length})` : ''}
                    </Text>
                    <Text className="text-sm text-zinc-300" numberOfLines={3}>
                      {truncateText(mentionedText, 3)}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleRemoveMention(index)}
                    className="p-1"
                  >
                    <Text className="text-zinc-500 text-lg">×</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      <View className="flex-row items-end">
        <TextInput
          ref={textInputRef}
          value={message}
          onChangeText={setMessage}
          placeholder={mentions.length > 0 ? 'Add your message...' : placeholder}
          placeholderTextColor="#3f3f46"
          editable={!disabled}
          multiline
          onContentSizeChange={handleContentSizeChange}
          className="flex-1 bg-zinc-950 px-3 py-3 text-white text-base"
          style={{
            height: inputHeight,
            fontSize: 16, // Prevent zoom on iOS
            fontFamily: Platform.select({
              ios: '-apple-system',
              android: 'Roboto',
              default: 'system',
            }),
            textAlignVertical: 'top',
          }}
          returnKeyType="default"
          blurOnSubmit={false}
        />
        <TouchableOpacity
          onPress={handleSend}
          disabled={disabled || (!message.trim() && mentions.length === 0)}
          className={`px-4 py-3 border-l border-zinc-800 ${
            disabled || (!message.trim() && mentions.length === 0) ? 'opacity-30' : ''
          }`}
        >
          {isStreaming ? (
            <Loader2 size={16} color="#d4d4d8" className="animate-spin" />
          ) : (
            <Send size={16} color="#d4d4d8" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
