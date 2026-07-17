import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../api/client';
import { ACCESSIBILITY, COLORS } from '../constants/config';

export const AnnouncementsScreen = () => {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState<string>('general');
  const [loading, setLoading] = useState(false);

  const categories = [
    { value: 'general', label: 'General' },
    { value: 'prayer_request', label: 'Prayer Request' },
    { value: 'thanksgiving', label: 'Thanksgiving' },
    { value: 'event', label: 'Event' },
    { value: 'other', label: 'Other' },
  ];

  const handleSubmit = async () => {
    if (!title.trim() || !message.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/announcements', {
        title: title.trim(),
        message: message.trim(),
        category,
        priority: 'normal',
      });

      Alert.alert(
        'Success!',
        'Your announcement has been submitted and is awaiting approval from the clerk.',
        [
          {
            text: 'OK',
            onPress: () => {
              setTitle('');
              setMessage('');
              setCategory('general');
              setShowForm(false);
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to submit announcement'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Announcements</Text>
          <Text style={styles.subtitle}>
            Submit announcements for Sunday service
          </Text>
        </View>

        {!showForm ? (
          <View>
            <Button
              title="+ Submit New Announcement"
              onPress={() => setShowForm(true)}
              fullWidth
              size="large"
            />

            <Text style={styles.helpText}>
              Your announcement will be reviewed by the clerk before being read
              on Sunday.
            </Text>
          </View>
        ) : (
          <View style={styles.form}>
            <Text style={styles.formTitle}>New Announcement</Text>

            <Input
              label="Title"
              value={title}
              onChangeText={setTitle}
              placeholder="Brief title for your announcement"
              maxLength={100}
            />

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Message</Text>
              <Input
                value={message}
                onChangeText={setMessage}
                placeholder="Announcement details..."
                multiline
                numberOfLines={6}
                style={styles.textArea}
                maxLength={500}
              />
              <Text style={styles.charCount}>
                {message.length}/500 characters
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Category</Text>
              <View style={styles.categoryContainer}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.value}
                    style={[
                      styles.categoryButton,
                      category === cat.value && styles.categoryButtonActive,
                    ]}
                    onPress={() => setCategory(cat.value)}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        category === cat.value && styles.categoryTextActive,
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <Button
              title="Submit Announcement"
              onPress={handleSubmit}
              loading={loading}
              fullWidth
              size="large"
              style={styles.submitButton}
            />

            <Button
              title="Cancel"
              onPress={() => setShowForm(false)}
              variant="outline"
              fullWidth
              size="large"
            />
          </View>
        )}
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
    padding: ACCESSIBILITY.SPACING * 2,
  },
  header: {
    marginBottom: ACCESSIBILITY.SPACING * 2,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 18,
    color: COLORS.textLight,
    marginTop: 8,
    lineHeight: 26,
  },
  helpText: {
    marginTop: ACCESSIBILITY.SPACING * 2,
    fontSize: 18,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 26,
    padding: ACCESSIBILITY.SPACING,
  },
  form: {
    marginTop: ACCESSIBILITY.SPACING,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: ACCESSIBILITY.SPACING,
    lineHeight: 32,
  },
  inputGroup: {
    marginBottom: ACCESSIBILITY.SPACING * 2,
  },
  label: {
    fontSize: ACCESSIBILITY.BASE_FONT_SIZE,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
    lineHeight: ACCESSIBILITY.BASE_FONT_SIZE * ACCESSIBILITY.LINE_HEIGHT,
  },
  textArea: {
    minHeight: 150,
    textAlignVertical: 'top',
    paddingTop: 16,
  },
  charCount: {
    marginTop: 4,
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: 'right',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: COLORS.cardBackground,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  categoryButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  submitButton: {
    marginBottom: ACCESSIBILITY.SPACING,
  },
});
