import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { Card } from '../components/Card';
import { useAuth } from '../contexts/AuthContext';
import { ACCESSIBILITY, COLORS } from '../constants/config';

export const HomeScreen = ({ navigation }: any) => {
  const { user } = useAuth();

  const quickActions = [
    {
      title: '📢 Submit Announcement',
      subtitle: 'Share with the church',
      onPress: () => navigation.navigate('Announcements'),
      roles: ['member', 'clerk', 'class_leader', 'admin', 'pastor'],
    },
    {
      title: '📅 View Events',
      subtitle: 'Upcoming church events',
      onPress: () => navigation.navigate('Events'),
      roles: ['member', 'clerk', 'class_leader', 'admin', 'pastor'],
    },
    {
      title: '📖 Read Devotionals',
      subtitle: 'Daily spiritual guidance',
      onPress: () => navigation.navigate('Devotionals'),
      roles: ['member', 'clerk', 'class_leader', 'admin', 'pastor'],
    },
    {
      title: '📋 Pending Reviews',
      subtitle: 'Announcements awaiting approval',
      onPress: () => navigation.navigate('Announcements'),
      roles: ['clerk', 'admin'],
    },
  ];

  const availableActions = quickActions.filter(action => 
    action.roles.includes(user?.role || 'member')
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.name}>{user?.fullName || 'Member'}</Text>
          <Text style={styles.role}>
            {user?.role.replace('_', ' ').toUpperCase()}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          {availableActions.map((action, index) => (
            <Card key={index} onPress={action.onPress} style={styles.actionCard}>
              <Text style={styles.actionTitle}>{action.title}</Text>
              <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
            </Card>
          ))}
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
    padding: ACCESSIBILITY.SPACING * 2,
  },
  header: {
    marginBottom: ACCESSIBILITY.SPACING * 2,
  },
  greeting: {
    fontSize: 20,
    color: COLORS.textLight,
    lineHeight: 28,
  },
  name: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
    lineHeight: 40,
    marginTop: 4,
  },
  role: {
    fontSize: 16,
    color: COLORS.primary,
    marginTop: 4,
    fontWeight: '600',
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
  actionCard: {
    minHeight: 100,
    justifyContent: 'center',
  },
  actionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: COLORS.text,
    lineHeight: 30,
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 18,
    color: COLORS.textLight,
    lineHeight: 26,
  },
});
