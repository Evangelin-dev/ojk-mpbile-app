import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import { Header } from '../components/Header';
import { fetchJobById } from '../api/auth';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Employer {
  id: number;
  companyName: string;
  profileImage?: string;
  fullName?: string;
  workEmail?: string;
  mobileNumber?: string;
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
  experienceType: string;
  minEducation: string;
  englishLevel: string;
  gender: string;
  description: string;
}

export default function JobDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const params = route.params as { job?: Job, id?: number };

  const [job, setJob] = useState<Job | null>(params.job || null);
  const [loading, setLoading] = useState(!params.job);
  const [error, setError] = useState<string | null>(null);
  const [showFullDesc, setShowFullDesc] = useState(false);

  useEffect(() => {
    if (!job && (params.id || params.job?.id)) {
      loadJob(params.id || params.job?.id);
    }
  }, []);

  const loadJob = async (id: number | string) => {
    try {
      setLoading(true);
      const data = await fetchJobById(id);
      // Handle both nested 'job' key and direct object response
      const jobData = data.job || data;
      setJob(jobData);
    } catch (err) {
      console.error('Failed to fetch job detail:', err);
      setError('Failed to load job details.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.outerContainer}>
        <Header />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      </View>
    );
  }

  if (error || !job) {
    return (
      <View style={styles.outerContainer}>
        <Header />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ color: 'red', textAlign: 'center' }}>{error || 'Job not found.'}</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
            <Text style={{ color: '#2563eb', fontWeight: 'bold' }}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.outerContainer}>
      <Header />

      <View style={styles.navHeader}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Svg width={24} height={24} fill="none" viewBox="0 0 24 24">
            <Path d="M15 18l-6-6 6-6" stroke="#2563eb" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Apply for Job
        </Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Job Summary Card */}
        <View style={styles.card}>
          <View style={styles.jobMainInfo}>
            <Image
              source={{ uri: job.employer.profileImage }}
              style={styles.companyLogoLarge}
            />
            <View style={styles.titleArea}>
              <Text style={styles.jobTitleLarge}>{job.jobTitle}</Text>
              <Text style={styles.companyNameLarge}>{job.employer.companyName}</Text>
            </View>
          </View>

          <View style={styles.quickSpecs}>
            <View style={styles.specItem}>
              <Text style={styles.specLabel}>Location</Text>
              <Text style={styles.specValue}>{job.location || job.officeAddress}</Text>
            </View>
            <View style={styles.specItem}>
              <Text style={styles.specLabel}>Salary</Text>
              <Text style={styles.specValue}>₹{job.minSalary.toLocaleString()} - ₹{job.maxSalary.toLocaleString()}</Text>
            </View>
            <View style={styles.specItem}>
              <Text style={styles.specLabel}>Experience</Text>
              <Text style={styles.specValue}>{job.experienceType}</Text>
            </View>
          </View>

          <View style={styles.badgeContainer}>
            <View style={[styles.badge, { backgroundColor: '#eff6ff' }]}>
              <Text style={[styles.badgeText, { color: '#2563eb' }]}>{job.jobType}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: '#fdf2f8' }]}>
              <Text style={[styles.badgeText, { color: '#db2777' }]}>{job.workLocation}</Text>
            </View>
            {job.isNightShift && (
              <View style={[styles.badge, { backgroundColor: '#f3f4f6' }]}>
                <Text style={[styles.badgeText, { color: '#4b5563' }]}>Night Shift</Text>
              </View>
            )}
          </View>

          <TouchableOpacity style={styles.applyButtonMain}>
            <Text style={styles.applyButtonText}>Apply Now</Text>
          </TouchableOpacity>
        </View>

        {/* Job Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Job Description</Text>
          <Text
            style={styles.descriptionText}
            numberOfLines={showFullDesc ? undefined : 5}
          >
            {job.description}
          </Text>
          <TouchableOpacity onPress={() => setShowFullDesc(!showFullDesc)}>
            <Text style={styles.showMoreText}>
              {showFullDesc ? 'Show Less' : 'Show More'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Requirements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Candidate Requirements</Text>
          <View style={styles.requirementGrid}>
            <View style={styles.reqItem}>
              <Text style={styles.reqLabel}>Minimum Education</Text>
              <Text style={styles.reqValue}>{job.minEducation}</Text>
            </View>
            <View style={styles.reqItem}>
              <Text style={styles.reqLabel}>English Level</Text>
              <Text style={styles.reqValue}>{job.englishLevel}</Text>
            </View>
            <View style={styles.reqItem}>
              <Text style={styles.reqLabel}>Gender</Text>
              <Text style={styles.reqValue}>{job.gender === 'ANY' ? 'Any Gender' : job.gender}</Text>
            </View>
            <View style={styles.reqItem}>
              <Text style={styles.reqLabel}>Experience</Text>
              <Text style={styles.reqValue}>{job.experienceType}</Text>
            </View>
          </View>
        </View>

        {/* Perks */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Perks & Benefits</Text>
          <View style={styles.perksRow}>
            {job.perks.map((perk, i) => (
              <View key={i} style={styles.perkBadge}>
                <Text style={styles.perkText}>✓ {perk}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* About Employer */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Company</Text>
          <View style={styles.employerInfo}>
            <Image
              source={{ uri: job.employer.profileImage }}
              style={styles.companyLogoSmall}
            />
            <View>
              <Text style={styles.employerCompanyName}>{job.employer.companyName}</Text>
              <Text style={styles.employerTag}>Verified Employer on OJK</Text>
            </View>
          </View>
          <Text style={styles.companyDesc}>
            {job.employer.companyName} is a leading organization focused on growth and innovation. They provide excellent career opportunities and a professional work environment.
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Floating Apply Button for Bottom */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomPriceInfo}>
          <Text style={styles.bottomPriceLabel}>Salary up to</Text>
          <Text style={styles.bottomPriceValue}>₹{job.maxSalary.toLocaleString()}</Text>
        </View>
        <TouchableOpacity style={styles.bottomApplyBtn}>
          <Text style={styles.bottomApplyText}>Apply Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  navHeader: {
    paddingHorizontal: 16,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    marginLeft: 8,
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  scrollView: {
    flex: 1,
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  jobMainInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  companyLogoLarge: {
    width: 64,
    height: 64,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  titleArea: {
    marginLeft: 16,
    flex: 1,
  },
  jobTitleLarge: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1e293b',
    lineHeight: 28,
  },
  companyNameLarge: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: '600',
    marginTop: 4,
  },
  quickSpecs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
    marginBottom: 16,
  },
  specItem: {
    flex: 1,
  },
  specLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  specValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  applyButtonMain: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '800',
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
  },
  descriptionText: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 24,
  },
  showMoreText: {
    color: '#2563eb',
    fontWeight: '700',
    marginTop: 10,
    fontSize: 14,
  },
  requirementGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  reqItem: {
    width: (SCREEN_WIDTH - 56) / 2,
  },
  reqLabel: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 4,
  },
  reqValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
  },
  perksRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  perkBadge: {
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#dcfce7',
  },
  perkText: {
    color: '#15803d',
    fontSize: 13,
    fontWeight: '600',
  },
  employerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  companyLogoSmall: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
  },
  employerCompanyName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  employerTag: {
    fontSize: 12,
    color: '#16a34a',
    fontWeight: '600',
  },
  companyDesc: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 10,
  },
  bottomPriceInfo: {
    flex: 1,
  },
  bottomPriceLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  bottomPriceValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#16a34a',
  },
  bottomApplyBtn: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 10,
  },
  bottomApplyText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
