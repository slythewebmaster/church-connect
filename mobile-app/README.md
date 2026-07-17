# Methodist Community Four App - Mobile App

React Native mobile application built with Expo for iOS and Android.

## Features

- 🔐 **Authentication**: JWT-based login
- 📢 **Announcements**: Submit announcements for Sunday service
- 📅 **Events**: View upcoming church events
- 📖 **Devotionals**: Read daily devotionals (coming soon)
- 👤 **Profile**: View account information and logout

## Tech Stack

- **Framework**: Expo (React Native)
- **Language**: TypeScript
- **Navigation**: React Navigation (Bottom Tabs)
- **State Management**: React Query + Context API
- **HTTP Client**: Axios
- **Storage**: AsyncStorage

## Accessibility Features

Optimized for older users:
- ✅ Large buttons (60px minimum height)
- ✅ Large fonts (18-24px)
- ✅ High contrast colors (WCAG AAA)
- ✅ Simple navigation (bottom tabs)
- ✅ Clear labels and instructions
- ✅ Voice input support (coming soon)

## Setup

### Prerequisites

- Node.js 18+ installed
- Expo Go app on your mobile device
- Backend API running (see `../backend/README.md`)

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start Expo development server:
   ```bash
   npm start
   ```

3. Test on device:
   - **iOS**: Open Camera app and scan QR code
   - **Android**: Open Expo Go app and scan QR code
   - **Web**: Press `w` in terminal

### Configuration

Update API URL in `src/constants/config.ts`:

```typescript
export const API_URL = __DEV__ 
  ? 'http://YOUR_COMPUTER_IP:3000/api/v1' // Use your computer's IP, not localhost
  : 'https://your-production-api.com/api/v1';
```

**Important**: For testing on physical devices, replace `localhost` with your computer's IP address (e.g., `192.168.1.100`).

## Project Structure

```
mobile-app/
├── src/
│   ├── api/              # API client configuration
│   ├── components/       # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── Card.tsx
│   ├── contexts/         # React contexts
│   │   └── AuthContext.tsx
│   ├── navigation/       # Navigation setup
│   │   └── AppNavigator.tsx
│   ├── screens/          # App screens
│   │   ├── LoginScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── AnnouncementsScreen.tsx
│   │   ├── EventsScreen.tsx
│   │   └── ProfileScreen.tsx
│   ├── types/            # TypeScript types
│   ├── constants/        # App configuration
│   └── utils/            # Helper functions
├── assets/              # Images, icons, fonts
├── App.tsx              # Root component
└── package.json
```

## Screens

### 1. Login Screen
- Email and password authentication
- Large input fields
- Clear error messages

### 2. Home Screen
- Welcome message with user name
- Quick action cards (role-based)
- Dashboard overview

### 3. Announcements Screen
- Submit new announcements
- Step-by-step form
- Category selection
- Character count

### 4. Events Screen
- List of upcoming events
- Pull-to-refresh
- Event details (date, time, location)
- Color-coded by type

### 5. Profile Screen
- User information
- Account details
- Logout button

## Role-Based Features

- **Member**: Submit announcements, view events
- **Clerk**: + Review pending announcements
- **Class Leader**: + Create devotionals, manage class
- **Admin/Pastor**: Full access to all features

## Development

### Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android emulator
- `npm run ios` - Run on iOS simulator (macOS only)
- `npm run web` - Run in web browser

### Building for Production

1. Install EAS CLI:
   ```bash
   npm install -g eas-cli
   ```

2. Configure EAS:
   ```bash
   eas build:configure
   ```

3. Build for iOS:
   ```bash
   eas build --platform ios
   ```

4. Build for Android:
   ```bash
   eas build --platform android
   ```

## Testing

1. Start backend API:
   ```bash
   cd ../backend
   npm run dev
   ```

2. Update API_URL in config.ts with your computer's IP

3. Start Expo:
   ```bash
   npm start
   ```

4. Test login with credentials created in backend

## Troubleshooting

### Cannot connect to backend
- Ensure backend is running
- Use computer's IP address, not localhost
- Check firewall settings
- Both devices must be on same network

### Dependencies issues
```bash
rm -rf node_modules
npm install
```

### Cache issues
```bash
npm start -- --clear
```

## Next Steps

- [ ] Complete Devotionals screen
- [ ] Add push notifications
- [ ] Implement offline support
- [ ] Add voice input
- [ ] Add text-to-speech
- [ ] Implement dark mode
- [ ] Add tutorial/onboarding

## License

MIT
