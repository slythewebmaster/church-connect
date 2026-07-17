import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../api/client';
import { AuthResponse } from '../types';
import { ACCESSIBILITY, COLORS, APP_CONFIG } from '../constants/config';

export const LoginScreen = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', {
        email: email.trim().toLowerCase(),
        password,
      });

      const { user, accessToken, refreshToken } = response.data;
      await login(user, accessToken, refreshToken);
    } catch (error: any) {
      Alert.alert(
        'Login Failed',
        error.response?.data?.message || 'Unable to login. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>{APP_CONFIG.name}</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="your.email@example.com"
            error={errors.email}
          />

          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            placeholder="Enter your password"
            error={errors.password}
          />

          <Button
            title="Sign In"
            onPress={handleLogin}
            loading={loading}
            fullWidth
            style={styles.loginButton}
          />

          <Text style={styles.helpText}>
            Need help signing in? Contact your church administrator.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: ACCESSIBILITY.SPACING * 2,
  },
  header: {
    alignItems: 'center',
    marginBottom: ACCESSIBILITY.SPACING * 3,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 20,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 28,
  },
  form: {
    width: '100%',
  },
  loginButton: {
    marginTop: ACCESSIBILITY.SPACING,
  },
  helpText: {
    marginTop: ACCESSIBILITY.SPACING * 2,
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 24,
  },
});
