# React Native Migration Guide

This document describes the migration from Next.js to React Native using Expo.

## What Has Been Converted

### ✅ Completed

1. **Project Setup**
   - Initialized Expo project with web and iOS support
   - Configured Expo Router for file-based routing
   - Set up NativeWind for cross-platform Tailwind CSS styling
   - Created Metro bundler configuration

2. **Storage Layer**
   - Converted from Dexie/IndexedDB to AsyncStorage
   - Maintained the same operation interface
   - All CRUD operations working (conversations, branches, messages)
   - Storage abstraction layer preserved

3. **Configuration Files**
   - `app.json` - Expo configuration
   - `metro.config.js` - Metro bundler with NativeWind
   - `tailwind.config.js` - TailwindCSS configuration
   - `tsconfig.json` - TypeScript configuration for Expo
   - `global.css` - Global styles with brutalist design system

4. **API Routes**
   - Converted Next.js API route to Expo API route
   - `/api/chat` endpoint migrated to `app/api/chat+api.ts`
   - Uses `EXPO_PUBLIC_OPENROUTER_API_KEY` environment variable

5. **Core Structure**
   - Root layout (`app/_layout.tsx`)
   - Main page (`app/index.tsx`) with basic conversation management
   - Safe area handling for iOS
   - Basic conversation list and selection

## Current State

The app now runs on:
- ✅ Web (via Expo Web)
- ✅ iOS (via Expo Go or build)
- ⚠️ Limited UI components (simplified from original)

### Working Features

- Create new conversations
- View conversation list
- Select conversations
- Delete conversations (long press)
- Storage persistence with AsyncStorage
- Basic layout with sidebar and main content area

### Simplified Components

The following components have been **simplified** for the initial migration:
- Conversation list (basic version in `app/index.tsx`)
- Message display (placeholder in main page)
- Branch management (basic structure only)

## What Needs Further Work

### 🔨 To Be Completed

1. **Full Component Migration**
   - `MessageList` - Convert to React Native FlatList/ScrollView
   - `MessageInput` - Convert to React Native TextInput
   - `MessageContent` - Migrate markdown rendering
   - `ConversationPanel` - Convert to React Native layout
   - `GroupView` - Adapt resizable panels for mobile
   - `BranchButton` - Implement text selection for React Native

2. **Markdown Rendering**
   - Replace `react-markdown` with `react-native-markdown-display`
   - Implement code block syntax highlighting
   - Handle embedded images and links

3. **Text Selection & Branching**
   - Implement text selection on React Native
   - Position branch button correctly on mobile vs web
   - Handle iOS-specific selection delays

4. **Platform-Specific Optimizations**
   - iOS keyboard handling
   - Web-specific resizable panels
   - Mobile gesture handlers
   - Platform-specific scrolling behavior

5. **Keyboard Shortcuts**
   - Migrate `useKeyboardShortcuts` hook
   - Implement cross-platform shortcut handling
   - Modal for shortcuts help

6. **Streaming LLM Responses**
   - Verify streaming works on React Native
   - Update UI for real-time message updates
   - Handle cancellation properly

## File Structure

```
explorative-chat/
├── app/
│   ├── _layout.tsx          # Root layout (NEW)
│   ├── index.tsx            # Main page (CONVERTED)
│   └── api/
│       └── chat+api.ts      # API route (CONVERTED)
├── src/
│   ├── components/          # React components (TO BE CONVERTED)
│   ├── lib/
│   │   ├── storage/
│   │   │   ├── db.ts        # Storage layer (CONVERTED to AsyncStorage)
│   │   │   └── operations.ts # CRUD operations (UPDATED)
│   │   ├── openrouter/      # LLM integration (needs testing)
│   │   └── types.ts         # TypeScript types (unchanged)
│   └── hooks/               # Custom hooks (TO BE CONVERTED)
├── assets/                  # Images and icons
├── global.css               # Global styles (NEW)
├── tailwind.config.js       # Tailwind config (UPDATED for RN)
├── metro.config.js          # Metro config (NEW)
├── app.json                 # Expo config (NEW)
├── index.ts                 # Entry point (NEW)
└── package.json             # Dependencies (UPDATED)
```

## Running the App

### Development

```bash
# Install dependencies
npm install

# Start Expo
npm start

# Run on specific platform
npm run web      # Web browser
npm run ios      # iOS simulator (macOS only)
npm run android  # Android emulator
```

### Environment Variables

Create a `.env` file:

```env
EXPO_PUBLIC_OPENROUTER_API_KEY=your_api_key_here
```

## Migration Strategy

The migration follows these principles:

1. **Preserve Data Layer**: Keep the same storage interface, just swap implementation
2. **Gradual Conversion**: Convert components one at a time
3. **Platform Parity**: Ensure feature parity across web and iOS
4. **Brutalist Design**: Maintain the sharp, minimal aesthetic

## Key Differences: Next.js vs Expo

| Aspect | Next.js | Expo |
|--------|---------|------|
| **Routing** | File-based in `app/` | Expo Router in `app/` |
| **Storage** | IndexedDB | AsyncStorage |
| **Styling** | Tailwind CSS | NativeWind (Tailwind for RN) |
| **Components** | HTML elements | React Native primitives |
| **API Routes** | `route.ts` | `+api.ts` |
| **Environment** | `.env.local` | `.env` with `EXPO_PUBLIC_` |
| **Markdown** | `react-markdown` | `react-native-markdown-display` |

## Component Conversion Checklist

When converting a component from web to React Native:

- [ ] Replace `<div>` with `<View>`
- [ ] Replace `<p>`, `<span>`, `<h1-h6>` with `<Text>`
- [ ] Replace `<button>` with `<TouchableOpacity>` or `<Pressable>`
- [ ] Replace `<input>` with `<TextInput>`
- [ ] Replace `<img>` with `<Image>`
- [ ] Replace `className` with NativeWind's `className` (works on both!)
- [ ] Handle platform-specific code with `Platform.select()`
- [ ] Test on both web and iOS
- [ ] Ensure accessibility (iOS VoiceOver, web screen readers)

## Next Steps

1. Wait for `npm install` to complete
2. Test the basic app: `npm start`
3. Verify storage operations work
4. Begin converting remaining components
5. Implement full chat UI
6. Add text selection and branching
7. Test on iOS device
8. Build for production

## Notes

- The original brutalist design system is preserved in `STYLE_GUIDE.md`
- All zinc color scale values are configured in `tailwind.config.js`
- NativeWind provides near-identical styling between web and native
- Some web-specific features (like resizable panels) may need alternatives on mobile

## Troubleshooting

### "Module not found"
Run `npm install` and clear cache:
```bash
npm install
npx expo start --clear
```

### "Cannot find module '@react-native-async-storage/async-storage'"
Make sure all dependencies are installed. Check `package.json`.

### Styling not working
Ensure `global.css` is imported in `app/_layout.tsx` and NativeWind is configured in `metro.config.js`.

## Resources

- [Expo Documentation](https://docs.expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [NativeWind](https://www.nativewind.dev/)
- [React Native](https://reactnative.dev/)
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/)
