import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { useAuth } from '../contexts/AuthContext';
import { ACCESSIBILITY, COLORS, APP_CONFIG } from '../constants/config';

export const ProfileScreen = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.fullName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.name}>{user?.fullName}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <Text style={styles.role}>
            {user?.role.replace('_', ' ').toUpperCase()}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          
          <Card>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Full Name</Text>
              <Text style={styles.infoValue}>{user?.fullName}</Text>
            </View>
          </Card>

          <Card>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user?.email}</Text>
            </View>
          </Card>

          {user?.phone && (
            <Card>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Phone</Text>
                <Text style={styles.infoValue}>{user.phone}</Text>
              </View>
            </Card>
          )}

          <Card>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Role</Text>
              <Text style={styles.infoValue}>
                {user?.role.replace('_', ' ').toUpperCase()}
              </Text>
            </View>
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Information</Text>
          
          <Card>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>App Name</Text>
              <Text style={styles.infoValue}>{APP_CONFIG.name}</Text>
            </View>
          </Card>

          <Card>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Version</Text>
              <Text style={styles.infoValue}>{APP_CONFIG.version}</Text>
            </View>
          </Card>
        </View>

        <Button
          title="Logout"
          onPress={handleLogout}
          variant="danger"
          fullWidth
          size="large"
          style={styles.logoutButton}
        />
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
    alignItems: 'center',
    marginBottom: ACCESSIBILITY.SPACING * 3,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: ACCESSIBILITY.SPACING,
  },
  avatarText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  email: {
    fontSize: 18,
    color: COLORS.textLight,
    marginBottom: 8,
  },
  role: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: `${COLORS.primary}15`,
    borderRadius: 20,
  },
  section: {
    marginBottom: ACCESSIBILITY.SPACING * 2,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: ACCESSIBILITY.SPACING,
    lineHeight: 32,
  },
  infoRow: {
    marginBottom: 0,
  },
  infoLabel: {
    fontSize: 16,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 20,
    color: COLORS.text,
    fontWeight: '500',
  },
  logoutButton: {
    marginTop: ACCESSIBILITY.SPACING,
  },
});
