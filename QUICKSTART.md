# Quick Start Guide - Explorative Chat (React Native)

## Prerequisites

- Node.js 18+ installed
- For iOS development: macOS with Xcode
- For Android development: Android Studio
- Expo Go app (optional, for testing on physical device)

## Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**

   Create a `.env` file in the root directory:
   ```env
   EXPO_PUBLIC_OPENROUTER_API_KEY=your_openrouter_api_key_here
   ```

   Get an API key from [OpenRouter](https://openrouter.ai/keys)

3. **Start the development server**
   ```bash
   npm start
   ```

## Running the App

After `npm start`, you'll see options:

- Press `w` - Open in web browser
- Press `i` - Open in iOS simulator (macOS only)
- Press `a` - Open in Android emulator
- Scan QR code with Expo Go app on your phone

## Current Features (v0.1.0)

This is a **minimal working version** of the migration from Next.js to React Native.

### ✅ Working
- Create conversations
- View conversation list in sidebar
- Select conversations
- Delete conversations (long press on mobile/right-click on web)
- Data persistence with AsyncStorage
- Cross-platform (Web + iOS)

### 🚧 In Progress
- Full chat UI (message list, input)
- Text selection and branching
- Markdown rendering
- Streaming LLM responses
- Keyboard shortcuts

## Project Structure

```
app/               # Expo Router pages
├── _layout.tsx    # Root layout
├── index.tsx      # Main page
└── api/
    └── chat+api.ts # API endpoint

src/               # Source code
├── components/    # React components (being migrated)
├── lib/
│   ├── storage/   # AsyncStorage wrapper (✅ converted)
│   └── types.ts   # TypeScript types
└── hooks/         # Custom React hooks

global.css         # Global styles
tailwind.config.js # Tailwind configuration
metro.config.js    # Metro bundler config
```

## Development Tips

### Clear Cache
If you encounter issues:
```bash
npx expo start --clear
```

### iOS Simulator (macOS)
```bash
npm run ios
```

### Web Browser
```bash
npm run web
```

### Check Logs
Expo provides detailed error messages in the terminal. Check both:
- Metro bundler terminal
- Browser console (for web)
- Xcode console (for iOS)

## What's Different from Next.js Version?

1. **Storage**: IndexedDB → AsyncStorage
2. **Routing**: Next.js App Router → Expo Router
3. **Components**: HTML elements → React Native primitives
4. **Styling**: Still uses Tailwind CSS (via NativeWind)

## Next Steps

The current version demonstrates:
- ✅ Project setup and configuration
- ✅ Storage layer working
- ✅ Basic UI structure

To complete the migration:
1. Convert remaining components (MessageList, MessageInput, etc.)
2. Implement markdown rendering for React Native
3. Add text selection and branching features
4. Test streaming LLM responses
5. Implement platform-specific optimizations

See `MIGRATION.md` for detailed migration status.

## Troubleshooting

### Error: "Cannot find module..."
```bash
npm install
npx expo start --clear
```

### Storage not persisting
AsyncStorage should work on all platforms. Check:
- No errors in console
- `.env` file is present
- App has necessary permissions

### Styles not applying
Ensure:
- `global.css` is imported in `app/_layout.tsx`
- NativeWind is configured in `metro.config.js`
- Tailwind classes are valid for NativeWind

## Resources

- [Expo Docs](https://docs.expo.dev/)
- [NativeWind Docs](https://www.nativewind.dev/)
- [Original PRD](./PRODUCT_REQUIREMENTS.md)
- [Style Guide](./STYLE_GUIDE.md)
- [Migration Guide](./MIGRATION.md)

## Support

For issues or questions:
1. Check `MIGRATION.md` for known issues
2. Review Expo documentation
3. Check console for error messages
