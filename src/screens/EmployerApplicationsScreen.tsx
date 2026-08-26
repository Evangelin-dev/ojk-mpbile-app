import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  Linking,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { fetchJobApplications } from '../api/employer';
import { Header } from '../components/Header';
import {
  ArrowLeftIcon,
  ChevronRightIcon,
  DocumentTextIcon,
  UsersIcon,
  ExclamationTriangleIcon,
  ArrowDownTrayIcon,
} from 'react-native-heroicons/outline';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Candidate {
  id: number;
  name: string;
  location: string;
  skills: string[];
  experienceYears: string | number;
}

interface Application {
  id: number;
  cvUrl: string;
  createdAt: string;
  candidate: Candidate;
}

interface JobWithApplications {
  id: number;
  jobTitle: string;
  createdAt: string;
  applicationsCount: number;
  applications: Application[];
}

export default function EmployerApplicationsScreen() {
  const { token, isLoading: authLoading } = useAuth();
  const [jobs, setJobs] = useState<JobWithApplications[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobWithApplications | null>(null);
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
      const response = await fetchJobApplications(token);
      // Accessing response.data.jobs to match the webapp's structure
      setJobs(response.data?.jobs || response.jobs || []);
    } catch (err) {
      console.error("Failed to fetch applications:", err);
      setError("Could not load job applications.");
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

  const handleDownloadCV = async (url: string) => {
    if (!url) {
        Alert.alert("Error", "CV URL not available.");
        return;
    }
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      Alert.alert("Error", "Could not open CV link.");
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  // --- DETAIL VIEW: Show Applicants for the Selected Job ---
  if (selectedJob) {
    return (
      <View style={styles.container}>
        <Header />
        <View style={styles.detailHeader}>
          <TouchableOpacity
            onPress={() => setSelectedJob(null)}
            style={styles.backBtn}
          >
            <ArrowLeftIcon size={20} color="#ea580c" />
            <Text style={styles.backBtnText}>Back to Jobs</Text>
          </TouchableOpacity>
          <Text style={styles.detailTitle}>Applicants for "{selectedJob.jobTitle}"</Text>
          <Text style={styles.detailSubtitle}>
            {selectedJob.applicationsCount} candidate(s) have applied.
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.detailScrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {selectedJob.applications.length > 0 ? (
            selectedJob.applications.map(app => (
              <View key={app.id} style={styles.applicantCard}>
                <View style={styles.applicantHeader}>
                  <View style={styles.avatarCircle}>
                    <Text style={styles.avatarInitial}>
                      {app.candidate?.name ? app.candidate.name.charAt(0) : '?'}
                    </Text>
                  </View>
                  <View style={styles.applicantBasicInfo}>
                    <Text style={styles.applicantName}>{app.candidate?.name || 'Unknown Candidate'}</Text>
                    <Text style={styles.applicantLocation}>{app.candidate?.location || 'Location N/A'}</Text>
                  </View>
                </View>

                <View style={styles.applicantDetailRow}>
                  <Text style={styles.detailLabel}>Experience:</Text>
                  <Text style={styles.detailValue}>{app.candidate?.experienceYears || 0} Years</Text>
                </View>

                <View style={styles.skillsContainer}>
                  {app.candidate?.skills?.slice(0, 5).map((skill, idx) => (
                    <View key={idx} style={styles.skillBadge}>
                      <Text style={styles.skillText}>{skill}</Text>
                    </View>
                  ))}
                </View>

                <TouchableOpacity
                    style={styles.downloadBtn}
                    onPress={() => handleDownloadCV(app.cvUrl)}
                >
                  <ArrowDownTrayIcon size={18} color="#fff" />
                  <Text style={styles.downloadBtnText}>View CV / Resume</Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <DocumentTextIcon size={64} color="#94a3b8" />
              <Text style={styles.emptyTitle}>No Applications Yet</Text>
              <Text style={styles.emptySubtitle}>Candidates who apply will appear here.</Text>
            </View>
          )}
        </ScrollView>
      </View>
    );
  }

  // --- MASTER VIEW: Show the List of All Jobs ---
  return (
    <View style={styles.container}>
      <Header />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={styles.pageTitle}>Job Applications</Text>

        {error && (
          <View style={styles.errorCard}>
            <ExclamationTriangleIcon size={24} color="#ef4444" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.jobListContainer}>
          {jobs.length > 0 ? (
            jobs.map(job => (
              <TouchableOpacity
                key={job.id}
                onPress={() => setSelectedJob(job)}
                style={styles.jobRow}
              >
                <View style={styles.jobInfo}>
                  <Text style={styles.jobRowTitle}>{job.jobTitle}</Text>
                  <Text style={styles.jobDate}>
                    Posted: {new Date(job.createdAt).toLocaleDateString('en-GB')}
                  </Text>
                </View>
                <View style={styles.jobCountContainer}>
                  <View style={styles.countBadge}>
                    <UsersIcon size={18} color="#475569" />
                    <Text style={styles.countText}>{job.applicationsCount}</Text>
                  </View>
                  <ChevronRightIcon size={20} color="#94a3b8" />
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <DocumentTextIcon size={64} color="#94a3b8" />
              <Text style={styles.emptyTitle}>No Jobs Found</Text>
              <Text style={styles.emptySubtitle}>You have not posted any jobs yet.</Text>
            </View>
          )}
        </View>
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
  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 20,
  },
  jobListContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 2,
  },
  jobRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  jobInfo: {
    flex: 1,
  },
  jobRowTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#ea580c',
    marginBottom: 4,
  },
  jobDate: {
    fontSize: 13,
    color: '#64748b',
  },
  jobCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  countBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 6,
  },
  countText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#475569',
  },
  // Detail View Styles
  detailHeader: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  backBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ea580c',
  },
  detailTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 4,
  },
  detailSubtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  detailScrollContent: {
    padding: 16,
    gap: 16,
  },
  applicantCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 3,
  },
  applicantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff7ed',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ffedd5',
  },
  avatarInitial: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ea580c',
  },
  applicantBasicInfo: {
    flex: 1,
  },
  applicantName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1e293b',
  },
  applicantLocation: {
    fontSize: 14,
    color: '#64748b',
  },
  applicantDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  skillBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  skillText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ea580c',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  downloadBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  emptyContainer: {
    padding: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#475569',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 8,
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorText: {
    color: '#ef4444',
    fontWeight: '600',
  },
});
