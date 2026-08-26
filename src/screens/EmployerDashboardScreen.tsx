import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { fetchDashboardStats } from '../api/employer';
import {
  UserGroupIcon,
  PlusIcon,
} from 'react-native-heroicons/outline';
import { useNavigation } from '@react-navigation/native';
import { Header } from '../components/Header';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface DashboardStats {
  activeJobs: number;
  applicationsThisWeek: number;
  availableCredits: number;
}

export default function EmployerDashboardScreen() {
  const { token, user, isLoading: authLoading } = useAuth();
  const navigation = useNavigation<any>();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!token) {
      if (!authLoading) setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await fetchDashboardStats(token);
      // Support both wrapped and unwrapped response structure
      setStats(data.data?.stats || data.stats);
    } catch (err) {
      console.error("Dashboard data fetch failed", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, authLoading]);

  useEffect(() => {
    if (!authLoading) {
      loadData();
    }
  }, [loadData, authLoading]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563eb']} />
        }
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.greeting}>Good morning, {user?.full_name || 'Admin'} 👋</Text>
          <Text style={styles.subGreeting}>Here's your recruitment overview</Text>
        </View>

        {/* Stats Grid - Mapping API Data */}
        <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{stats?.activeJobs ?? 0}</Text>
              <Text style={styles.statLabel}>Active Jobs</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{stats?.applicationsThisWeek ?? 0}</Text>
              <Text style={styles.statLabel}>New Applications</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={[styles.statBox, { flex: 1 }]}>
              <Text style={[styles.statValue, { color: '#f59e0b' }]}>{stats?.availableCredits ?? 0}</Text>
              <Text style={styles.statLabel}>Available Credits</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>
        <View style={styles.quickActionsRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('PostJob')}>
            <PlusIcon size={20} color="#2563eb" />
            <Text style={styles.actionBtnText}>Post Job</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <UserGroupIcon size={20} color="#2563eb" />
            <Text style={styles.actionBtnText}>Add Candidate</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 20,
  },
  welcomeSection: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1e293b',
  },
  subGreeting: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  statsGrid: {
    gap: 12,
    marginBottom: 32,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1e293b',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 4,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 8,
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
});
