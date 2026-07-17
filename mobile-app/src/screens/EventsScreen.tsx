import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, RefreshControl } from 'react-native';
import { Card } from '../components/Card';
import apiClient from '../api/client';
import { Event } from '../types';
import { ACCESSIBILITY, COLORS } from '../constants/config';

export const EventsScreen = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await apiClient.get<{ events: Event[] }>('/events');
      setEvents(response.data.events);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchEvents();
  };

  const renderEvent = ({ item }: { item: Event }) => (
    <Card style={styles.eventCard}>
      <View style={styles.eventHeader}>
        <Text style={styles.eventName}>{item.eventName}</Text>
        <View style={[styles.typeBadge, { backgroundColor: getTypeColor(item.eventType) }]}>
          <Text style={styles.typeBadgeText}>{item.eventType.toUpperCase()}</Text>
        </View>
      </View>
      
      <Text style={styles.eventDate}>📅 {formatDate(item.startDate)}</Text>
      
      {item.startTime && (
        <Text style={styles.eventTime}>🕐 {item.startTime}</Text>
      )}
      
      {item.location && (
        <Text style={styles.eventLocation}>📍 {item.location}</Text>
      )}
      
      {item.description && (
        <Text style={styles.eventDescription}>{item.description}</Text>
      )}
    </Card>
  );

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'service': return COLORS.primary;
      case 'meeting': return COLORS.secondary;
      case 'conference': return COLORS.warning;
      case 'social': return COLORS.success;
      default: return COLORS.textLight;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Upcoming Events</Text>
        <Text style={styles.subtitle}>Church activities and programs</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading events...</Text>
        </View>
      ) : events.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No upcoming events</Text>
        </View>
      ) : (
        <FlatList
          data={events}
          renderItem={renderEvent}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: ACCESSIBILITY.SPACING * 2,
    paddingBottom: ACCESSIBILITY.SPACING,
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
  listContent: {
    padding: ACCESSIBILITY.SPACING * 2,
    paddingTop: 0,
  },
  eventCard: {
    marginBottom: ACCESSIBILITY.SPACING,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  eventName: {
    flex: 1,
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    lineHeight: 30,
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  eventDate: {
    fontSize: 18,
    color: COLORS.text,
    lineHeight: 26,
    marginBottom: 4,
  },
  eventTime: {
    fontSize: 18,
    color: COLORS.text,
    lineHeight: 26,
    marginBottom: 4,
  },
  eventLocation: {
    fontSize: 18,
    color: COLORS.text,
    lineHeight: 26,
    marginBottom: 8,
  },
  eventDescription: {
    fontSize: 18,
    color: COLORS.textLight,
    lineHeight: 26,
    marginTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 20,
    color: COLORS.textLight,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: ACCESSIBILITY.SPACING * 2,
  },
  emptyText: {
    fontSize: 20,
    color: COLORS.textLight,
    textAlign: 'center',
  },
});
