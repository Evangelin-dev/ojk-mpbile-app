import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  Squares2X2Icon,
  BriefcaseIcon,
  UserCircleIcon,
  AcademicCapIcon,
  BookOpenIcon,
  DocumentDuplicateIcon,
  ChevronRightIcon,
  CheckCircleIcon,
} from 'react-native-heroicons/outline';
import { useAuth } from '../context/AuthContext';
import { fetchCandidateProfile } from '../api/candidate';
import { Header } from '../components/Header';
import { useNavigation } from '@react-navigation/native';

const CandidateDashboardScreen = () => {
  const navigation = useNavigation<any>();
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);

  const fetchStats = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetchCandidateProfile(token);
      setProfileData(response.profile);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const calculateCompleteness = (p: any): number => {
    if (!p) return 0;
    let score = 0;
    if (p.name) score += 10;
    if (p.location) score += 10;
    if (p.experienceYears) score += 10;
    if (p.skills?.length > 0) score += 20;
    if (p.education) score += 10;
    if (p.preferredJobType) score += 10;
    if (p.cvUrl) score += 15;
    if (p.certificates && p.certificates.length > 0) score += 15;
    return Math.min(100, score);
  };

  const completeness = calculateCompleteness(profileData);
  const appliedCount = profileData?.applications?.length || 0;

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#fbb040" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Header />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Hello, {profileData?.name || 'Candidate'}!</Text>
          <Text style={styles.subtitle}>Here is your activity overview</Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsContainer}>
          <TouchableOpacity
            style={styles.statCard}
            onPress={() => navigation.navigate('My Application')}
          >
            <View style={[styles.iconBox, { backgroundColor: '#eff6ff' }]}>
              <BriefcaseIcon size={24} color="#3b82f6" />
            </View>
            <Text style={styles.statValue}>{appliedCount}</Text>
            <Text style={styles.statLabel}>Applied Jobs</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statCard}
            onPress={() => navigation.navigate('CandidateProfile')}
          >
            <View style={[styles.iconBox, { backgroundColor: '#ecfdf5' }]}>
              <CheckCircleIcon size={24} color="#10b981" />
            </View>
            <Text style={styles.statValue}>{completeness}%</Text>
            <Text style={styles.statLabel}>Profile Score</Text>
          </TouchableOpacity>
        </View>

        {/* Completeness Banner */}
        {completeness < 100 && (
          <TouchableOpacity
            style={styles.completenessBanner}
            onPress={() => navigation.navigate('CandidateProfile')}
          >
            <View style={styles.bannerInfo}>
              <Text style={styles.bannerTitle}>Complete your profile</Text>
              <Text style={styles.bannerSub}>Increase your chances of getting hired by 3x!</Text>
            </View>
            <ChevronRightIcon size={20} color="#b97a13" />
          </TouchableOpacity>
        )}

        {/* Features Section */}
        <Text style={styles.sectionTitle}>Tools & Resources</Text>

        <View style={styles.featureGrid}>
          <TouchableOpacity
            style={styles.featureCard}
            onPress={() => navigation.navigate('Learning')}
          >
            <View style={[styles.featureIconBox, { backgroundColor: '#f5f3ff' }]}>
              <BookOpenIcon size={30} color="#8b5cf6" />
            </View>
            <Text style={styles.featureName}>Learning</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.featureCard}
            onPress={() => navigation.navigate('ResumeBuilder')}
          >
            <View style={[styles.featureIconBox, { backgroundColor: '#fff7ed' }]}>
              <DocumentDuplicateIcon size={30} color="#f97316" />
            </View>
            <Text style={styles.featureName}>Resume Builder</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Links */}
        <View style={styles.quickLinksSection}>
           <TouchableOpacity
            style={styles.linkItem}
            onPress={() => navigation.navigate('Jobs', { screen: 'JobList' })}
           >
             <View style={styles.linkLeft}>
               <Squares2X2Icon size={20} color="#64748b" />
               <Text style={styles.linkText}>Browse Jobs</Text>
             </View>
             <ChevronRightIcon size={18} color="#cbd5e1" />
           </TouchableOpacity>

           <TouchableOpacity
            style={styles.linkItem}
            onPress={() => navigation.navigate('CandidateProfile')}
           >
             <View style={styles.linkLeft}>
               <UserCircleIcon size={20} color="#64748b" />
               <Text style={styles.linkText}>Update Profile</Text>
             </View>
             <ChevronRightIcon size={18} color="#cbd5e1" />
           </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
  },
  welcomeSection: {
    marginBottom: 20,
    marginTop: 10,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1e293b',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  completenessBanner: {
    backgroundColor: '#fef3c7',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  bannerInfo: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#92400e',
  },
  bannerSub: {
    fontSize: 12,
    color: '#b45309',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
  },
  featureGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  featureCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    position: 'relative',
  },
  featureIconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  featureName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    textAlign: 'center',
  },
  comingSoonBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  comingSoonText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
  quickLinksSection: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  linkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  linkText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#334155',
  },
});

export default CandidateDashboardScreen;
