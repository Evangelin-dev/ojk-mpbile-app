import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Header } from '../components/Header';
import Svg, { Path, Circle } from 'react-native-svg';
import { fetchJobs } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import EmployerJobsView from './EmployerJobsView';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Employer {
  id: number;
  companyName: string;
  profileImage?: string;
}

interface Job {
  id: number;
  jobTitle: string;
  jobType: string;
  isNightShift: boolean;
  location: string | null;
  workLocation: string;
  officeAddress: string;
  minSalary: number;
  maxSalary: number;
  perks: string[];
  walkIn: boolean;
  createdAt: string;
  employer: Employer;
}

const states = ["Maharashtra", "Karnataka", "Delhi", "Gujarat", "Tamil Nadu", "Uttar Pradesh"];

export default function BrowseJobsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [locationTerm, setLocationTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Filter States
  const [selectedState, setSelectedState] = useState('');
  const [selectedDate, setSelectedDate] = useState<string[]>([]);
  const [selectedWorkMode, setSelectedWorkMode] = useState<string[]>([]);
  const [selectedShift, setSelectedShift] = useState<string[]>([]);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {
        q: searchTerm,
        location: locationTerm || selectedState,
        datePosted: selectedDate,
        workMode: selectedWorkMode,
        shift: selectedShift,
      };

      const data = await fetchJobs(params);
      // Handle both nested 'jobs' key and direct array response
      const jobsData = Array.isArray(data) ? data : (data.jobs || []);
      setJobs(jobsData);
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
      setError('Failed to load jobs.');
    } finally {
      setLoading(false);
    }
  };

  const toggleFilter = (list: string[], setList: (l: string[]) => void, item: string) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const renderItem = ({ item }: { item: Job }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('JobDetail', { job: item })}
      style={styles.card}
      activeOpacity={0.9}
    >
      <View style={styles.cardHeader}>
        <Image source={{ uri: item.employer.profileImage }} style={styles.companyLogo} />
        <View style={styles.titleContainer}>
          <Text style={styles.jobTitle} numberOfLines={1}>{item.jobTitle}</Text>
          <Text style={styles.companyName}>{item.employer.companyName}</Text>
        </View>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.infoText}>📍 {item.location}</Text>
        <Text style={styles.infoText}>💼 {item.jobType}</Text>
      </View>
      <Text style={styles.salaryText}>
        ₹{item.minSalary.toLocaleString()} - ₹{item.maxSalary.toLocaleString()} / month
      </Text>
      <View style={styles.badgeRow}>
        <View style={styles.badge}><Text style={styles.badgeText}>{item.workLocation}</Text></View>
        {item.isNightShift && <View style={styles.badge}><Text style={styles.badgeText}>Night Shift</Text></View>}
      </View>
    </TouchableOpacity>
  );

  if (user?.role === 'EMPLOYER') {
    return (
      <View style={styles.container}>
        <Header />
        <EmployerJobsView />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header />

      {/* Search Bar with Filter Toggle */}
      <View style={styles.searchSection}>
        <View style={styles.topSearchRow}>
          <View style={styles.searchBox}>
            <Svg width={20} height={20} fill="none" viewBox="0 0 24 24">
              <Circle cx={11} cy={11} r={8} stroke="#9ca3af" strokeWidth={2} />
              <Path d="M21 21l-4.35-4.35" stroke="#9ca3af" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
            <TextInput
              placeholder="Search Job Title, company..."
              style={styles.input}
              value={searchTerm}
              onChangeText={setSearchTerm}
              onSubmitEditing={loadJobs}
              returnKeyType="search"
            />
          </View>
          <TouchableOpacity
            style={styles.filterBtn}
            onPress={() => setShowFilters(true)}
          >
            <Svg width={24} height={24} fill="none" viewBox="0 0 24 24">
              <Path d="M3 4.5h18m-15 6h12m-9 6h6" stroke="#2563eb" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.resultsHeader}>
        <Text style={styles.resultsTitle}>Showing {jobs.length} Jobs</Text>
        <TouchableOpacity style={styles.shareBtn}>
            <Text style={styles.shareText}>Share</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 40 }} />
      ) : error ? (
        <Text style={{ textAlign: 'center', color: 'red', marginTop: 40 }}>{error}</Text>
      ) : (
        <FlatList
          data={jobs}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshing={loading}
          onRefresh={loadJobs}
        />
      )}

      {/* Post Job FAB for Employers */}
      {user?.role === 'EMPLOYER' && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('PostJob')}
        >
          <Svg width={24} height={24} fill="none" viewBox="0 0 24 24">
            <Path d="M12 5v14m-7-7h14" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </TouchableOpacity>
      )}

      {/* Filters Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filters</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Text style={styles.closeBtn}>Close</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.filterScroll}>

              {/* Job Title */}
              <Text style={styles.filterLabel}>Search Job Title</Text>
              <TextInput
                placeholder="Job title, company..."
                style={styles.filterInput}
                value={searchTerm}
                onChangeText={setSearchTerm}
              />

              {/* Location */}
              <Text style={styles.filterLabel}>Location (General Search)</Text>
              <TextInput
                placeholder="City, state..."
                style={styles.filterInput}
                value={locationTerm}
                onChangeText={setLocationTerm}
              />

              {/* State Dropdown Placeholder */}
              <Text style={styles.filterLabel}>Select State</Text>
              <View style={styles.dropdownPlaceholder}>
                <Text style={styles.dropdownText}>{selectedState || 'Select State'}</Text>
              </View>
              <View style={styles.stateTags}>
                {states.map(s => (
                  <TouchableOpacity
                    key={s}
                    style={[styles.stateTag, selectedState === s && styles.stateTagActive]}
                    onPress={() => setSelectedState(s === selectedState ? '' : s)}
                  >
                    <Text style={[styles.stateTagText, selectedState === s && styles.stateTagActiveText]}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Date Posted */}
              <Text style={styles.filterLabel}>Date posted</Text>
              {['Last 24 hours', 'Last 3 days', 'Last 7 days'].map(opt => (
                <TouchableOpacity
                  key={opt}
                  style={styles.checkboxRow}
                  onPress={() => toggleFilter(selectedDate, setSelectedDate, opt)}
                >
                  <View style={[styles.checkbox, selectedDate.includes(opt) && styles.checkboxActive]} />
                  <Text style={styles.checkboxLabel}>{opt}</Text>
                </TouchableOpacity>
              ))}

              {/* Work Mode */}
              <Text style={styles.filterLabel}>Work Mode</Text>
              {['Work from home', 'Work from office', 'Field Job'].map(opt => (
                <TouchableOpacity
                  key={opt}
                  style={styles.checkboxRow}
                  onPress={() => toggleFilter(selectedWorkMode, setSelectedWorkMode, opt)}
                >
                  <View style={[styles.checkbox, selectedWorkMode.includes(opt) && styles.checkboxActive]} />
                  <Text style={styles.checkboxLabel}>{opt}</Text>
                </TouchableOpacity>
              ))}

              {/* Work Shift */}
              <Text style={styles.filterLabel}>Work Shift</Text>
              {['Day shift', 'Night shift', '8 Hours shift'].map(opt => (
                <TouchableOpacity
                  key={opt}
                  style={styles.checkboxRow}
                  onPress={() => toggleFilter(selectedShift, setSelectedShift, opt)}
                >
                  <View style={[styles.checkbox, selectedShift.includes(opt) && styles.checkboxActive]} />
                  <Text style={styles.checkboxLabel}>{opt}</Text>
                </TouchableOpacity>
              ))}

              <View style={{ height: 30 }} />
            </ScrollView>

            <TouchableOpacity
                style={[styles.applyFiltersBtn, { marginBottom: Platform.OS === 'ios' ? 20 : 0 }]}
                onPress={() => {
                  setShowFilters(false);
                  loadJobs();
                }}
            >
              <Text style={styles.applyFiltersText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  searchSection: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  topSearchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#1e293b',
  },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  shareBtn: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  shareText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  listContainer: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  companyLogo: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  titleContainer: {
    marginLeft: 12,
    flex: 1,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  companyName: {
    fontSize: 13,
    color: '#64748b',
  },
  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#64748b',
    flexShrink: 1,
  },
  salaryText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#16a34a',
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: SCREEN_HEIGHT * 0.85,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e293b',
  },
  closeBtn: {
    color: '#ef4444',
    fontWeight: '700',
  },
  filterScroll: {
    flex: 1,
  },
  filterLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#475569',
    marginTop: 16,
    marginBottom: 8,
  },
  filterInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#f8fafc',
  },
  dropdownPlaceholder: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#f8fafc',
  },
  dropdownText: {
    color: '#64748b',
  },
  stateTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  stateTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  stateTagActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  stateTagText: {
    fontSize: 12,
    color: '#475569',
  },
  stateTagActiveText: {
    color: '#fff',
    fontWeight: '600',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    marginRight: 12,
  },
  checkboxActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#475569',
  },
  applyFiltersBtn: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  applyFiltersText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f97316',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
});
