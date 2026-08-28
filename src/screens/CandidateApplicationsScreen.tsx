import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Linking,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import {
  BriefcaseIcon,
  BuildingOffice2Icon,
  CalendarIcon,
  ChevronRightIcon,
  ClockIcon,
  ArrowTopRightOnSquareIcon,
  DocumentTextIcon,
  MapPinIcon,
  MagnifyingGlassIcon,
  ExclamationCircleIcon,
  CreditCardIcon,
} from 'react-native-heroicons/outline';
import { useAuth } from '../context/AuthContext';
import { getMyApplications, signUrl } from '../api/candidate';
import { Header } from '../components/Header';

interface Employer {
  id: number;
  companyName: string;
  fullName: string;
}

interface Job {
  id: number;
  jobTitle: string;
  jobType: string;
  location: string;
  minSalary: number | null;
  maxSalary: number | null;
  compensationType: string;
  workLocation: string;
  isActive: boolean;
  employer: Employer;
}

interface Application {
  id: number;
  createdAt: string;
  cvUrl: string | null;
  coverLetter: string | null;
  job: Job;
}

const formatSalary = (min: number | null, max: number | null) => {
  if (!min && !max) return 'Not specified';
  if (min && max)
    return `₹${min.toLocaleString()} – ₹${max.toLocaleString()}`;
  if (min) return `From ₹${min.toLocaleString()}`;
  return `Up to ₹${max!.toLocaleString()}`;
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

const daysAgo = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
};

const CandidateApplicationsScreen = () => {
  const { token } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [openingCv, setOpeningCv] = useState<number | null>(null);

  const openSignedCv = async (cvUrl: string, appId: number) => {
    try {
      setOpeningCv(appId);
      const urlObj = new URL(cvUrl);
      let key = urlObj.pathname.startsWith('/') ? urlObj.pathname.slice(1) : urlObj.pathname;

      // Attempt to sign the URL if possible
      if (token) {
        try {
          const res = await signUrl(key, token);
          await Linking.openURL(res.url);
        } catch (err) {
          // Fallback to original URL
          await Linking.openURL(cvUrl);
        }
      } else {
        await Linking.openURL(cvUrl);
      }
    } catch (err) {
      console.error('Failed to open CV:', err);
    } finally {
      setOpeningCv(null);
    }
  };

  useEffect(() => {
    const fetch = async () => {
      if (!token) return;
      setLoading(true);
      setError(null);
      try {
        const res = await getMyApplications(token);
        setApplications(res.applications || []);
      } catch (err) {
        setError('Could not load your applications. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [token]);

  const filtered = applications.filter(
    (a) =>
      a.job.jobTitle.toLowerCase().includes(search.toLowerCase()) ||
      a.job.employer.companyName.toLowerCase().includes(search.toLowerCase()) ||
      (a.job.location || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#fbb040" />
        <Text style={styles.loadingText}>Loading your applications...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <ExclamationCircleIcon size={60} color="#ef4444" />
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Header />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerSection}>
          <View style={styles.headerTitleRow}>
            <View style={styles.iconWrapper}>
              <BriefcaseIcon size={24} color="#fbb040" />
            </View>
            <View>
              <Text style={styles.pageTitle}>My Applications</Text>
              <Text style={styles.pageSubtitle}>Track all the jobs you've applied to</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={[styles.statCard, { borderColor: '#fef3c7' }]}>
              <View style={[styles.statIconBox, { backgroundColor: '#fef3c7' }]}>
                <DocumentTextIcon size={18} color="#fbb040" />
              </View>
              <View>
                <Text style={styles.statValue}>{applications.length}</Text>
                <Text style={styles.statLabel}>Total Applied</Text>
              </View>
            </View>
            <View style={[styles.statCard, { borderColor: '#dcfce7' }]}>
              <View style={[styles.statIconBox, { backgroundColor: '#dcfce7' }]}>
                <BriefcaseIcon size={18} color="#22c55e" />
              </View>
              <View>
                <Text style={styles.statValue}>{applications.filter(a => a.job.isActive).length}</Text>
                <Text style={styles.statLabel}>Active Jobs</Text>
              </View>
            </View>
          </View>
        </View>

        {applications.length > 0 && (
          <View style={styles.searchSection}>
            <View style={styles.searchBar}>
              <MagnifyingGlassIcon size={20} color="#94a3b8" />
              <TextInput
                placeholder="Search job title, company..."
                value={search}
                onChangeText={setSearch}
                style={styles.searchInput}
              />
            </View>
          </View>
        )}

        {applications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <DocumentTextIcon size={40} color="#fbb040" />
            </View>
            <Text style={styles.emptyTitle}>No applications yet</Text>
            <Text style={styles.emptyText}>You haven't applied for any jobs yet. Start exploring opportunities and apply today!</Text>
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MagnifyingGlassIcon size={40} color="#cbd5e1" />
            <Text style={styles.emptyTitle}>No results found</Text>
            <Text style={styles.emptyText}>Try a different keyword.</Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {filtered.map((app) => (
              <View key={app.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.companyAvatar}>
                    <Text style={styles.avatarText}>{app.job.employer.companyName?.charAt(0) || 'C'}</Text>
                  </View>
                  <View style={styles.jobInfo}>
                    <Text style={styles.jobTitle} numberOfLines={1}>{app.job.jobTitle}</Text>
                    <View style={styles.companyRow}>
                      <BuildingOffice2Icon size={14} color="#64748b" />
                      <Text style={styles.companyName} numberOfLines={1}>{app.job.employer.companyName}</Text>
                    </View>
                  </View>
                  <View style={styles.dateInfo}>
                    <Text style={styles.appliedDays}>{daysAgo(app.createdAt)}</Text>
                    <Text style={styles.appliedDate}>{formatDate(app.createdAt)}</Text>
                  </View>
                </View>

                <View style={styles.tagRow}>
                  {app.job.location && (
                    <View style={styles.tag}>
                      <MapPinIcon size={12} color="#64748b" />
                      <Text style={styles.tagText}>{app.job.location}</Text>
                    </View>
                  )}
                  {app.job.jobType && (
                    <View style={[styles.tag, { backgroundColor: '#eff6ff', borderColor: '#dbeafe' }]}>
                      <ClockIcon size={12} color="#2563eb" />
                      <Text style={[styles.tagText, { color: '#2563eb' }]}>{app.job.jobType}</Text>
                    </View>
                  )}
                  <View style={[styles.statusTag, app.job.isActive ? styles.activeTag : styles.closedTag]}>
                    <View style={[styles.statusDot, { backgroundColor: app.job.isActive ? '#10b981' : '#94a3b8' }]} />
                    <Text style={[styles.statusText, { color: app.job.isActive ? '#065f46' : '#475569' }]}>
                      {app.job.isActive ? 'Active' : 'Closed'}
                    </Text>
                  </View>
                </View>

                {(app.cvUrl || app.coverLetter) && (
                  <View style={styles.cardFooter}>
                    {app.cvUrl && (
                      <TouchableOpacity
                        style={styles.cvButton}
                        onPress={() => openSignedCv(app.cvUrl!, app.id)}
                        disabled={openingCv === app.id}
                      >
                        {openingCv === app.id ? (
                          <ActivityIndicator size="small" color="#fbb040" />
                        ) : (
                          <ArrowTopRightOnSquareIcon size={14} color="#fbb040" />
                        )}
                        <Text style={styles.cvButtonText}>View CV</Text>
                      </TouchableOpacity>
                    )}
                    {app.coverLetter && (
                      <View style={styles.coverLetterBadge}>
                        <Text style={styles.coverLetterText}>✉ Cover Letter</Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 12,
    color: '#64748b',
    fontSize: 16,
    fontWeight: '500',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    color: '#ef4444',
    textAlign: 'center',
    fontSize: 14,
  },
  scrollContent: {
    padding: 16,
  },
  headerSection: {
    marginBottom: 20,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  iconWrapper: {
    backgroundColor: '#fef3c7',
    padding: 10,
    borderRadius: 12,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1e293b',
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: 150,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
  },
  statIconBox: {
    padding: 8,
    borderRadius: 10,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  statLabel: {
    fontSize: 11,
    color: '#64748b',
  },
  searchSection: {
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1e293b',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fef3c7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 20,
  },
  listContainer: {
    gap: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  companyAvatar: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#fef3c7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fbb040',
  },
  jobInfo: {
    flex: 1,
    marginRight: 8,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
    flexShrink: 1,
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 1,
  },
  companyName: {
    fontSize: 13,
    color: '#64748b',
  },
  dateInfo: {
    alignItems: 'flex-end',
  },
  appliedDays: {
    fontSize: 11,
    color: '#94a3b8',
    marginBottom: 2,
  },
  appliedDate: {
    fontSize: 10,
    color: '#cbd5e1',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  tagText: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
  },
  statusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  activeTag: {
    backgroundColor: '#ecfdf5',
    borderColor: '#d1fae5',
  },
  closedTag: {
    backgroundColor: '#f1f5f9',
    borderColor: '#e2e8f0',
  },
  cardFooter: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f8fafc',
  },
  cvButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fbb040',
  },
  cvButtonText: {
    fontSize: 12,
    color: '#fbb040',
    fontWeight: '600',
  },
  coverLetterBadge: {
    backgroundColor: '#faf5ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f3e8ff',
  },
  coverLetterText: {
    fontSize: 12,
    color: '#9333ea',
    fontWeight: '500',
  },
});

export default CandidateApplicationsScreen;
