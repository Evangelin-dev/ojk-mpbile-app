import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { ChevronLeftIcon, UserCircleIcon, MapPinIcon, BriefcaseIcon, AcademicCapIcon, BookmarkIcon as BookmarkOutline } from 'react-native-heroicons/outline';
import { BookmarkIcon as BookmarkSolid } from 'react-native-heroicons/solid';
import { useNavigation, useRoute } from '@react-navigation/native';
import { searchCandidates, addToShortlist, removeFromShortlist, fetchShortlistedCandidates } from '../api/employer';
import { useAuth } from '../context/AuthContext';
import { Header } from '../components/Header';
import CandidateProfileModal from '../components/CandidateProfileModal';

const CandidateSearchListScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { token } = useAuth();
  const { searchCriteria } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [shortlistedIds, setShortlistedIds] = useState<Set<number>>(new Set());

  // Modal State
  const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchCandidates();
  }, [searchCriteria]);

  const fetchCandidates = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const [searchResponse, shortlistResponse] = await Promise.all([
        searchCandidates(searchCriteria, token),
        fetchShortlistedCandidates(token)
      ]);

      setCandidates(searchResponse.candidates || []);

      const shortlistedData = shortlistResponse.candidates || [];
      const ids = new Set(shortlistedData.map((c: any) => c.id));
      setShortlistedIds(ids);
    } catch (error) {
      console.error('Failed to search candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShortlistToggle = async (candidateId: number) => {
    if (!token) return;

    const isShortlisted = shortlistedIds.has(candidateId);
    try {
      if (isShortlisted) {
        await removeFromShortlist(candidateId, token);
        setShortlistedIds(prev => {
          const newIds = new Set(prev);
          newIds.delete(candidateId);
          return newIds;
        });
      } else {
        await addToShortlist(candidateId, token);
        setShortlistedIds(prev => new Set(prev).add(candidateId));
      }
    } catch (error) {
      console.error('Failed to update shortlist:', error);
    }
  };

  const handleViewProfile = (candidate: any) => {
    setSelectedCandidate(candidate);
    setModalVisible(true);
  };

  const renderCandidate = ({ item }: { item: any }) => (
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
        <TouchableOpacity
          onPress={() => handleShortlistToggle(item.id)}
          style={styles.bookmarkBtn}
        >
          {shortlistedIds.has(item.id) ? (
            <BookmarkSolid size={24} color="#fbb040" />
          ) : (
            <BookmarkOutline size={24} color="#64748b" />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      <View style={styles.details}>
        <View style={styles.detailItem}>
          <BriefcaseIcon size={16} color="#94a3b8" />
          <Text style={styles.detailText}>{item.experienceYears} Years Experience</Text>
        </View>
        <View style={styles.detailItem}>
          <AcademicCapIcon size={16} color="#94a3b8" />
          <Text style={styles.detailText} numberOfLines={1}>
            {item.education}
          </Text>
        </View>
      </View>

      <View style={styles.skillsContainer}>
        {item.skills.map((skill: string, idx: number) => (
          <View key={idx} style={styles.skillBadge}>
            <Text style={styles.skillText}>{skill}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.viewBtn} onPress={() => handleViewProfile(item)}>
        <Text style={styles.viewBtnText}>View Full Profile</Text>
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
          <Text style={styles.title}>Search Results</Text>
          <Text style={styles.subtitle}>{candidates.length} candidates found</Text>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#fbb040" />
            <Text style={styles.loadingText}>Searching candidates...</Text>
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
                <Text style={styles.emptyText}>No candidates found matching your criteria.</Text>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                  <Text style={styles.refineBtn}>Refine Search</Text>
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
    color: '#1E293B',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
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
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bookmarkBtn: {
    padding: 4,
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  location: {
    fontSize: 13,
    color: '#64748B',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
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
  },
  skillBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  skillText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
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
    color: '#64748B',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 12,
  },
  refineBtn: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fbb040',
    textDecorationLine: 'underline',
  },
});

export default CandidateSearchListScreen;
