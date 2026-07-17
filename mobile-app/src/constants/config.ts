// API Configuration
export const API_URL = __DEV__ 
  ? 'http://localhost:3000/api/v1' 
  : 'https://your-production-api.com/api/v1';

// Accessibility Settings
export const ACCESSIBILITY = {
  MIN_BUTTON_HEIGHT: 60,
  MIN_BUTTON_WIDTH: 120,
  BASE_FONT_SIZE: 18,
  MAX_FONT_SIZE: 24,
  LINE_HEIGHT: 1.6,
  SPACING: 16,
};

// Colors (high contrast for accessibility)
export const COLORS = {
  primary: '#1E40AF', // Blue
  secondary: '#7C3AED', // Purple
  success: '#059669', // Green
  error: '#DC2626', // Red
  warning: '#D97706', // Orange
  background: '#FFFFFF',
  text: '#1F2937',
  textLight: '#6B7280',
  border: '#D1D5DB',
  cardBackground: '#F9FAFB',
};

// App Configuration
export const APP_CONFIG = {
  name: 'Methodist Community Four',
  shortName: 'MC4 App',
  version: '1.0.0',
};
