import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform } from 'react-native';
import Markdown from 'react-native-markdown-display';
import * as Clipboard from 'expo-clipboard';
import { Copy, Check } from 'lucide-react-native';

interface MessageContentProps {
  content: string;
  onTextSelect?: (text: string) => void;
}

export function MessageContent({ content, onTextSelect }: MessageContentProps) {
  return (
    <View className="flex-1">
      <Markdown
        style={{
          body: {
            color: '#ffffff',
            fontSize: 14,
            lineHeight: 21,
          },
          // Headings
          heading1: {
            color: '#ffffff',
            fontSize: 24,
            fontWeight: 'bold',
            marginTop: 24,
            marginBottom: 16,
          },
          heading2: {
            color: '#ffffff',
            fontSize: 20,
            fontWeight: 'bold',
            marginTop: 20,
            marginBottom: 12,
          },
          heading3: {
            color: '#ffffff',
            fontSize: 18,
            fontWeight: 'bold',
            marginTop: 16,
            marginBottom: 8,
          },
          // Paragraphs
          paragraph: {
            color: '#ffffff',
            marginBottom: 16,
            lineHeight: 21,
          },
          // Lists
          bullet_list: {
            marginBottom: 16,
          },
          ordered_list: {
            marginBottom: 16,
          },
          list_item: {
            color: '#ffffff',
            marginBottom: 8,
          },
          // Code
          code_inline: {
            backgroundColor: '#27272a',
            color: '#e4e4e7',
            paddingHorizontal: 6,
            paddingVertical: 2,
            fontFamily: Platform.select({
              ios: 'Courier New',
              android: 'monospace',
              default: 'monospace',
            }),
            fontSize: 14,
          },
          code_block: {
            backgroundColor: '#09090b',
            color: '#e4e4e7',
            padding: 12,
            fontFamily: Platform.select({
              ios: 'Courier New',
              android: 'monospace',
              default: 'monospace',
            }),
            fontSize: 14,
            borderWidth: 1,
            borderColor: '#27272a',
          },
          fence: {
            backgroundColor: '#09090b',
            color: '#e4e4e7',
            padding: 12,
            fontFamily: Platform.select({
              ios: 'Courier New',
              android: 'monospace',
              default: 'monospace',
            }),
            fontSize: 14,
            borderWidth: 1,
            borderColor: '#27272a',
            marginVertical: 16,
          },
          // Blockquotes
          blockquote: {
            backgroundColor: 'transparent',
            borderLeftWidth: 4,
            borderLeftColor: '#3f3f46',
            paddingLeft: 16,
            marginVertical: 16,
            fontStyle: 'italic',
          },
          // Links
          link: {
            color: '#60a5fa',
            textDecorationLine: 'underline',
          },
          // Tables
          table: {
            borderWidth: 1,
            borderColor: '#27272a',
            marginVertical: 16,
          },
          thead: {
            backgroundColor: '#18181b',
          },
          tbody: {},
          th: {
            color: '#ffffff',
            fontWeight: 'bold',
            padding: 8,
            borderWidth: 1,
            borderColor: '#27272a',
          },
          tr: {
            borderBottomWidth: 1,
            borderColor: '#27272a',
          },
          td: {
            color: '#ffffff',
            padding: 8,
            borderWidth: 1,
            borderColor: '#27272a',
          },
          // Horizontal rule
          hr: {
            backgroundColor: '#27272a',
            height: 1,
            marginVertical: 16,
          },
          // Strong and emphasis
          strong: {
            fontWeight: 'bold',
            color: '#ffffff',
          },
          em: {
            fontStyle: 'italic',
            color: '#ffffff',
          },
        }}
      >
        {content}
      </Markdown>
    </View>
  );
}

interface CodeBlockProps {
  language?: string;
  children: string;
}

export function CodeBlock({ language, children }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <View className="my-4 border border-zinc-800 overflow-hidden">
      {language && (
        <View className="px-4 py-2 bg-zinc-900 border-b border-zinc-800 flex-row items-center justify-between">
          <Text className="text-zinc-400 text-xs font-mono">{language}</Text>
          <TouchableOpacity
            onPress={handleCopy}
            className="flex-row items-center gap-1.5 px-2 py-1"
          >
            {copied ? (
              <>
                <Check size={14} color="#a1a1aa" />
                <Text className="text-zinc-400 text-xs">Copied</Text>
              </>
            ) : (
              <>
                <Copy size={14} color="#a1a1aa" />
                <Text className="text-zinc-400 text-xs">Copy</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
      <ScrollView horizontal className="bg-zinc-950">
        <Text className="p-3 text-sm font-mono text-zinc-200">
          {children}
        </Text>
      </ScrollView>
    </View>
  );
}
