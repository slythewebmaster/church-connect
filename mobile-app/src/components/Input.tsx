import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, TextInputProps } from 'react-native';
import { ACCESSIBILITY, COLORS } from '../constants/config';

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
  onVoiceInput?: () => void;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  onVoiceInput,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            isFocused && styles.inputFocused,
            error && styles.inputError,
          ]}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholderTextColor={COLORS.textLight}
          {...props}
        />
        {onVoiceInput && (
          <TouchableOpacity
            style={styles.voiceButton}
            onPress={onVoiceInput}
          >
            <Text style={styles.voiceIcon}>🎤</Text>
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: ACCESSIBILITY.SPACING,
  },
  label: {
    fontSize: ACCESSIBILITY.BASE_FONT_SIZE,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
    lineHeight: ACCESSIBILITY.BASE_FONT_SIZE * ACCESSIBILITY.LINE_HEIGHT,
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    height: ACCESSIBILITY.MIN_BUTTON_HEIGHT,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: ACCESSIBILITY.BASE_FONT_SIZE,
    color: COLORS.text,
    backgroundColor: '#FFFFFF',
  },
  inputFocused: {
    borderColor: COLORS.primary,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  voiceButton: {
    position: 'absolute',
    right: 8,
    top: '50%',
    transform: [{ translateY: -20 }],
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 20,
  },
  voiceIcon: {
    fontSize: 20,
  },
  error: {
    marginTop: 4,
    fontSize: 16,
    color: COLORS.error,
  },
});
