import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Image,
  Alert,
} from 'react-native';
import {
  ChevronLeftIcon,
  UserCircleIcon,
  MapPinIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  MagnifyingGlassIcon,
  TrashIcon,
} from 'react-native-heroicons/outline';
import { useNavigation } from '@react-navigation/native';
import { fetchShortlistedCandidates, removeFromShortlist } from '../api/employer';
import { useAuth } from '../context/AuthContext';
import { Header } from '../components/Header';
import CandidateProfileModal from '../components/CandidateProfileModal';

interface Candidate {
  id: number;
  name: string;
  location: string;
  experienceYears: number | string;
  education: string;
  skills: string[];
}

const SavedSearchesScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const loadShortlisted = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetchShortlistedCandidates(token);
      setCandidates(response.candidates || []);
    } catch (err: any) {
      console.error('Failed to fetch shortlisted candidates:', err);
      setError(err.response?.data?.message || 'Failed to fetch shortlisted candidates.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadShortlisted();
  }, [loadShortlisted]);

  const handleRemoveShortlist = (id: number) => {
    Alert.alert(
      'Remove Candidate',
      'Are you sure you want to remove this candidate from your saved searches?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            if (!token) return;
            try {
              await removeFromShortlist(id, token);
              setCandidates(prev => prev.filter(c => c.id !== id));
            } catch (err) {
              console.error('Failed to remove from shortlist:', err);
              Alert.alert('Error', 'Failed to remove candidate. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleViewProfile = (candidate: any) => {
    setSelectedCandidate(candidate);
    setModalVisible(true);
  };

  const renderCandidate = ({ item }: { item: Candidate }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <UserCircleIcon size={50} color="#fbb040" />
        <View style={styles.headerInfo}>
          <Text style={styles.name}>{item.name}</Text>
          <View style={styles.row}>
            <MapPinIcon size={14} color="#64748b" />
            <Text style={styles.location}>{item.location}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => handleRemoveShortlist(item.id)}>
          <TrashIcon size={22} color="#ef4444" />
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      <View style={styles.details}>
        <View style={styles.detailItem}>
          <BriefcaseIcon size={16} color="#94a3b8" />
          <Text style={styles.detailText}>{item.experienceYears} Years Exp.</Text>
        </View>
        <View style={styles.detailItem}>
          <AcademicCapIcon size={16} color="#94a3b8" />
          <Text style={styles.detailText} numberOfLines={1}>{item.education}</Text>
        </View>
      </View>

      <View style={styles.skillsContainer}>
        {item.skills.slice(0, 4).map((skill, idx) => (
          <View key={idx} style={styles.skillBadge}>
            <Text style={styles.skillText}>{skill}</Text>
          </View>
        ))}
        {item.skills.length > 4 && (
          <Text style={styles.moreText}>+{item.skills.length - 4} more</Text>
        )}
      </View>

      <TouchableOpacity style={styles.viewBtn} onPress={() => handleViewProfile(item)}>
        <Text style={styles.viewBtnText}>View Profile</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header />
      <View style={styles.container}>
        <View style={styles.pageHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ChevronLeftIcon size={24} color="#fbb040" />
            <Text style={styles.backBtnText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Saved Searches</Text>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#fbb040" />
            <Text style={styles.loadingText}>Loading saved searches...</Text>
          </View>
        ) : error ? (
          <View style={styles.center}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={loadShortlisted}>
              <Text style={styles.retryBtnText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={candidates}
            renderItem={renderCandidate}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Image
                  source={require('../../assets/icon.png')}
                  style={styles.emptyImage}
                  resizeMode="contain"
                />
                <Text style={styles.emptyTitle}>No Saved Searches</Text>
                <Text style={styles.emptySubtitle}>Candidates you save will appear here.</Text>
                <TouchableOpacity
                  style={styles.searchBtn}
                  onPress={() => navigation.navigate('SearchCandidates')}
                >
                  <MagnifyingGlassIcon size={20} color="#fff" />
                  <Text style={styles.searchBtnText}>Search for Candidates</Text>
                </TouchableOpacity>
              </View>
            }
          />
        )}
      </View>

      <CandidateProfileModal
        visible={modalVisible}
        candidate={selectedCandidate}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F8FAFC',
  },
  pageHeader: {
    marginBottom: 20,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    marginLeft: -4,
  },
  backBtnText: {
    fontSize: 16,
    color: '#fbb040',
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#253858',
  },
  listContent: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  location: {
    fontSize: 13,
    color: '#64748b',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 12,
  },
  details: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    color: '#475569',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  skillBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  skillText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  moreText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  viewBtn: {
    backgroundColor: '#FFF7E0',
    borderWidth: 1,
    borderColor: '#fbb040',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  viewBtnText: {
    color: '#b97a13',
    fontWeight: '700',
    fontSize: 14,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#64748b',
  },
  errorText: {
    color: '#ef4444',
    textAlign: 'center',
    fontSize: 15,
    marginBottom: 16,
  },
  retryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#fbb040',
    borderRadius: 8,
  },
  retryBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    paddingHorizontal: 20,
  },
  emptyImage: {
    width: 80,
    height: 80,
    marginBottom: 20,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#b97a13',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
  },
  searchBtn: {
    backgroundColor: '#fbb040',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  searchBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});

export default SavedSearchesScreen;
