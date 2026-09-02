import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Linking,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import {
  MapPinIcon,
  CurrencyDollarIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  LanguageIcon,
  ClockIcon,
  UserIcon,
  BuildingOffice2Icon,
  CalendarDaysIcon,
  MapIcon,
  PhoneIcon,
  EnvelopeIcon,
  DocumentTextIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CheckCircleIcon,
  PaperAirplaneIcon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  ArrowLeftIcon,
  ArrowTopRightOnSquareIcon,
} from 'react-native-heroicons/outline';
import { Header } from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { signUrl } from '../api/candidate';
import { fetchSimilarJobs } from '../api/auth';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Employer {
  id: number;
  fullName: string;
  mobileNumber: string;
  companyName: string;
  employeesCount: number;
  workEmail: string;
  profileImage: string | null;
}

interface Application {
  id: number;
  createdAt: string;
  cvUrl: string | null;
  coverLetter: string | null;
  job: Job;
}

interface Job {
  id: number;
  jobTitle: string;
  jobType: string;
  gender?: string;
  isNightShift: boolean;
  isEightHour?: boolean;
  workLocation: string;
  officeAddress: string;
  compensationType: string;
  minSalary: number;
  maxSalary: number;
  perks: string[];
  joiningFee: boolean;
  minEducation: string;
  englishLevel: string;
  experienceType: string;
  relatedRoles: string[];
  additionalReqs: string;
  description: string;
  walkIn: boolean;
  walkInAddress: string;
  walkInStart: string | null;
  walkInEnd: string | null;
  walkInTimings: string;
  otherInstructions: string;
  employer: Employer;
  location: string;
}

const AppliedJobDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const { token } = useAuth();
  const { application } = route.params as { application: Application };
  const job = application.job;

  const [showFullDescription, setShowFullDescription] = useState(false);
  const [similarJobs, setSimilarJobs] = useState<Job[]>([]);
  const [loadingSimilar, setLoadingSimilar] = useState(true);
  const [openingCv, setOpeningCv] = useState(false);

  // For this view, since it's an "Applied" job, step is at least 2
  const step = 2;

  useEffect(() => {
    loadSimilarJobs();
  }, [job.id]);

  const loadSimilarJobs = async () => {
    try {
      setLoadingSimilar(true);
      const data = await fetchSimilarJobs(job.id);
      if (data.jobs) {
        setSimilarJobs(data.jobs);
      }
    } catch (err) {
      console.error('Failed to fetch similar jobs:', err);
    } finally {
      setLoadingSimilar(false);
    }
  };

  const getEmployerImageSrc = (employer: Employer) => {
    if (employer?.profileImage) return { uri: employer.profileImage };
    return {
      uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(
        employer?.companyName || 'Company'
      )}&background=0D8ABC&color=fff&size=80`,
    };
  };

  const openSignedCv = async () => {
    if (!application.cvUrl || !token) return;
    try {
      setOpeningCv(true);
      const urlObj = new URL(application.cvUrl);
      let key = urlObj.pathname.startsWith('/') ? urlObj.pathname.slice(1) : urlObj.pathname;
      const res = await signUrl(key, token);
      await Linking.openURL(res.url);
    } catch (err) {
      await Linking.openURL(application.cvUrl);
    } finally {
      setOpeningCv(false);
    }
  };

  const formatSalary = (min: number, max: number) => {
    if (!min && !max) return 'Salary not disclosed';
    return `₹${min.toLocaleString()} - ₹${max.toLocaleString()} / month`;
  };

  const formatDate = (iso: string) => {
    if (!iso) return 'N/A';
    return new Date(iso).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Header />

      {/* Custom Navigation Header */}
      <View style={styles.navHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeftIcon size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.navTitle} numberOfLines={1}>Applied Job Details</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Job Overview Card */}
        <View style={styles.card}>
          <View style={styles.jobHeaderRow}>
            <Image
              source={getEmployerImageSrc(job.employer)}
              style={styles.employerLogo}
            />
            <View style={styles.jobHeaderText}>
              <Text style={styles.jobTitle}>{job.jobTitle}</Text>
              <Text style={styles.companyName}>{job.employer.companyName}</Text>
            </View>
          </View>

          <View style={styles.overviewGrid}>
            <View style={styles.overviewItem}>
              <MapPinIcon size={18} color="#64748b" />
              <Text style={styles.overviewText}>{job.location || job.officeAddress || 'Not Specified'}</Text>
            </View>
            <View style={styles.overviewItem}>
              <CurrencyDollarIcon size={18} color="#10b981" />
              <Text style={[styles.overviewText, { fontWeight: '600', color: '#065f46' }]}>
                {formatSalary(job.minSalary, job.maxSalary)}
              </Text>
            </View>
            <View style={styles.overviewItem}>
              <BriefcaseIcon size={18} color="#8b5cf6" />
              <Text style={styles.overviewText}>{job.experienceType || 'Any Experience'}</Text>
            </View>
          </View>

          <View style={styles.tagRow}>
            <View style={[styles.badge, { backgroundColor: '#eff6ff' }]}>
              <Text style={[styles.badgeText, { color: '#2563eb' }]}>{job.jobType}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: '#f5f3ff' }]}>
              <Text style={[styles.badgeText, { color: '#7c3aed' }]}>{job.workLocation}</Text>
            </View>
            {job.isNightShift && (
              <View style={[styles.badge, { backgroundColor: '#f8fafc' }]}>
                <Text style={[styles.badgeText, { color: '#475569' }]}>Night Shift</Text>
              </View>
            )}
            {job.isEightHour && (
              <View style={[styles.badge, { backgroundColor: '#eef2ff' }]}>
                <Text style={[styles.badgeText, { color: '#4338ca' }]}>8 Hours Duty</Text>
              </View>
            )}
            {job.joiningFee && (
              <View style={[styles.badge, { backgroundColor: '#fef2f2' }]}>
                <Text style={[styles.badgeText, { color: '#dc2626' }]}>Joining Fee</Text>
              </View>
            )}
            {job.perks && job.perks.map((perk, index) => (
              <View key={index} style={[styles.badge, { backgroundColor: '#f0fdf4' }]}>
                <Text style={[styles.badgeText, { color: '#16a34a' }]}>{perk}</Text>
              </View>
            ))}
          </View>

          <View style={styles.appliedBadge}>
            <CheckCircleIcon size={20} color="#15803d" />
            <Text style={styles.appliedBadgeText}>You applied on {formatDate(application.createdAt)}</Text>
          </View>
        </View>

        {/* Application Progress Stepper */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            <ClipboardDocumentCheckIcon size={20} color="#f59e0b" style={{ marginRight: 8 }} />
            Application Progress
          </Text>
          <View style={styles.stepperContainer}>
            {/* Step 1: Applied */}
            <View style={styles.stepItem}>
              <View style={[styles.stepIcon, styles.stepCompleted]}>
                <CheckCircleIcon size={20} color="#fff" />
              </View>
              <Text style={styles.stepLabelActive}>Apply</Text>
            </View>
            <View style={[styles.stepLine, styles.stepLineActive]} />

            {/* Step 2: Interview */}
            <View style={styles.stepItem}>
              <View style={[styles.stepIcon, styles.stepPending]}>
                <CalendarDaysIcon size={20} color="#f59e0b" />
              </View>
              <Text style={styles.stepLabel}>Interview</Text>
            </View>
            <View style={styles.stepLine} />

            {/* Step 3: Hired */}
            <View style={styles.stepItem}>
              <View style={[styles.stepIcon, styles.stepDisabled]}>
                <CheckCircleIcon size={20} color="#cbd5e1" />
              </View>
              <Text style={styles.stepLabel}>Hired!</Text>
            </View>
          </View>
        </View>

        {/* Submitted Details */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            <DocumentTextIcon size={20} color="#2563eb" style={{ marginRight: 8 }} />
            Your Submission
          </Text>
          <View style={styles.submissionContent}>
            {application.cvUrl && (
              <TouchableOpacity style={styles.cvButton} onPress={openSignedCv} disabled={openingCv}>
                {openingCv ? <ActivityIndicator size="small" color="#fbb040" /> : <ArrowTopRightOnSquareIcon size={18} color="#fbb040" />}
                <Text style={styles.cvButtonText}>View Submitted CV</Text>
              </TouchableOpacity>
            )}
            {application.coverLetter && (
              <View style={styles.coverLetterBox}>
                <Text style={styles.detailLabel}>Cover Letter:</Text>
                <Text style={styles.detailValue}>{application.coverLetter}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Job Description */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            <DocumentTextIcon size={20} color="#2563eb" style={{ marginRight: 8 }} />
            Job Description
          </Text>
          <Text
            style={styles.descriptionText}
            numberOfLines={showFullDescription ? undefined : 6}
          >
            {job.description || 'No description available.'}
          </Text>
          {job.description && job.description.length > 300 && (
            <TouchableOpacity
              style={styles.showMoreBtn}
              onPress={() => setShowFullDescription(!showFullDescription)}
            >
              <Text style={styles.showMoreText}>
                {showFullDescription ? 'Show Less' : 'Show More'}
              </Text>
              {showFullDescription ? <ChevronUpIcon size={16} color="#2563eb" /> : <ChevronDownIcon size={16} color="#2563eb" />}
            </TouchableOpacity>
          )}
        </View>

        {/* Job Role Details */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            <UserIcon size={20} color="#16a34a" style={{ marginRight: 8 }} />
            Job Role Details
          </Text>
          <View style={styles.detailsGrid}>
            <DetailItem label="Work Location" value={job.workLocation} icon={<MapPinIcon size={14} color="#64748b" />} />
            <DetailItem label="Compensation" value={job.compensationType || 'N/A'} icon={<CurrencyDollarIcon size={14} color="#64748b" />} />
            <DetailItem label="Employment Type" value={job.jobType || 'N/A'} icon={<BriefcaseIcon size={14} color="#64748b" />} />
            <DetailItem label="Shift" value={job.isNightShift ? 'Night Shift' : 'Day Shift'} icon={<ClockIcon size={14} color="#64748b" />} />
            {job.isEightHour && <DetailItem label="Duty Hours" value="8 Hours Duty" icon={<ClockIcon size={14} color="#64748b" />} />}
          </View>
          {job.relatedRoles && job.relatedRoles.length > 0 && (
            <View style={styles.rolesSection}>
              <Text style={styles.detailLabel}>
                <ClipboardDocumentListIcon size={14} color="#64748b" style={{ marginRight: 4 }} />
                Related Roles
              </Text>
              <View style={styles.rolesRow}>
                {job.relatedRoles.map((role, idx) => (
                  <View key={idx} style={styles.roleTag}>
                    <Text style={styles.roleTagText}>{role}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Candidate Requirements */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            <AcademicCapIcon size={20} color="#ea580c" style={{ marginRight: 8 }} />
            Candidate Requirements
          </Text>
          <View style={styles.detailsGrid}>
            <DetailItem label="Experience" value={job.experienceType || 'Not Specified'} icon={<BriefcaseIcon size={14} color="#64748b" />} />
            <DetailItem label="Min Education" value={job.minEducation || 'Not Specified'} icon={<AcademicCapIcon size={14} color="#64748b" />} />
            <DetailItem label="English Level" value={job.englishLevel || 'Not Specified'} icon={<LanguageIcon size={14} color="#64748b" />} />
            <DetailItem label="Gender" value={job.gender === 'ANY' ? 'Any Gender' : job.gender || 'Not Specified'} icon={<UserGroupIcon size={14} color="#64748b" />} />
          </View>
          {job.additionalReqs && (
            <View style={styles.additionalReqs}>
              <Text style={styles.detailLabel}>Additional Requirements:</Text>
              <Text style={styles.detailValue}>{job.additionalReqs}</Text>
            </View>
          )}
        </View>

        {/* Walk-in Interview Details */}
        {job.walkIn && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              <CalendarDaysIcon size={20} color="#dc2626" style={{ marginRight: 8 }} />
              Walk-in Interview Details
            </Text>
            <View style={styles.detailsGrid}>
              <DetailItem label="Address" value={job.walkInAddress || 'Not Specified'} icon={<MapIcon size={14} color="#64748b" />} fullWidth />
              <DetailItem label="Timings" value={job.walkInTimings || 'Not Specified'} icon={<ClockIcon size={14} color="#64748b" />} />
              {job.walkInStart && <DetailItem label="Start" value={formatDate(job.walkInStart)} icon={<CalendarDaysIcon size={14} color="#64748b" />} />}
            </View>
            {job.otherInstructions && (
              <View style={styles.additionalReqs}>
                <Text style={styles.detailLabel}>Other Instructions:</Text>
                <Text style={styles.detailValue}>{job.otherInstructions}</Text>
              </View>
            )}
          </View>
        )}

        {/* About Company */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            <BuildingOffice2Icon size={20} color="#4f46e5" style={{ marginRight: 8 }} />
            About Company
          </Text>
          <View style={styles.companyAboutHeader}>
            <Image source={getEmployerImageSrc(job.employer)} style={styles.companySmallLogo} />
            <View>
              <Text style={styles.companyNameBold}>{job.employer.companyName}</Text>
              <Text style={styles.postedByText}>Job posted by {job.employer.fullName}</Text>
            </View>
          </View>
          <View style={styles.companyContactGrid}>
            {job.employer.employeesCount && (
              <View style={styles.contactItem}>
                <UserGroupIcon size={16} color="#64748b" />
                <Text style={styles.contactText}>{job.employer.employeesCount} Employees</Text>
              </View>
            )}
            {job.employer.workEmail && (
              <View style={styles.contactItem}>
                <EnvelopeIcon size={16} color="#64748b" />
                <Text style={styles.contactText}>{job.employer.workEmail}</Text>
              </View>
            )}
            {job.employer.mobileNumber && (
              <View style={styles.contactItem}>
                <PhoneIcon size={16} color="#64748b" />
                <Text style={styles.contactText}>{job.employer.mobileNumber}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Similar Jobs */}
        {similarJobs.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              <ClipboardDocumentListIcon size={20} color="#4f46e5" style={{ marginRight: 8 }} />
              Similar Jobs
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.similarJobsScroll}>
              {similarJobs.map((sj) => (
                <TouchableOpacity
                  key={sj.id}
                  style={styles.similarJobCard}
                  onPress={() => navigation.navigate('JobDetail', { id: sj.id })}
                >
                  <Text style={styles.similarJobTitle} numberOfLines={1}>{sj.jobTitle}</Text>
                  <Text style={styles.similarCompanyName} numberOfLines={1}>{sj.employer.companyName}</Text>
                  <View style={styles.similarLocationRow}>
                    <MapPinIcon size={12} color="#94a3b8" />
                    <Text style={styles.similarLocationText} numberOfLines={1}>{sj.location}</Text>
                  </View>
                  <Text style={styles.similarSalary}>
                    ₹{sj.minSalary.toLocaleString()} - ₹{sj.maxSalary.toLocaleString()}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const DetailItem = ({ label, value, icon, fullWidth }: { label: string; value: string; icon: any; fullWidth?: boolean }) => (
  <View style={[styles.detailItem, fullWidth && { width: '100%' }]}>
    <Text style={styles.detailLabel}>
      {icon} {label}
    </Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  navTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  jobHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  employerLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#f1f5f9',
  },
  jobHeaderText: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e293b',
    lineHeight: 24,
  },
  companyName: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: '600',
    marginTop: 2,
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  overviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: '100%',
  },
  overviewText: {
    fontSize: 14,
    color: '#475569',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  appliedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f0fdf4',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dcfce7',
  },
  appliedBadgeText: {
    fontSize: 13,
    color: '#15803d',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1e293b',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  stepItem: {
    alignItems: 'center',
    gap: 4,
  },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  stepCompleted: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  stepPending: {
    backgroundColor: '#fef3c7',
    borderColor: '#f59e0b',
  },
  stepDisabled: {
    backgroundColor: '#f1f5f9',
    borderColor: '#cbd5e1',
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#e2e8f0',
    marginHorizontal: -10,
    marginTop: -20,
  },
  stepLineActive: {
    backgroundColor: '#10b981',
  },
  stepLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  stepLabelActive: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '700',
  },
  submissionContent: {
    gap: 12,
  },
  cvButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#fbb040',
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  cvButtonText: {
    fontSize: 14,
    color: '#fbb040',
    fontWeight: '700',
  },
  coverLetterBox: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  descriptionText: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 22,
  },
  showMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 8,
  },
  showMoreText: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '700',
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  detailItem: {
    width: (SCREEN_WIDTH - 80) / 2,
  },
  detailLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    marginBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailValue: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '700',
  },
  rolesSection: {
    marginTop: 16,
  },
  rolesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  roleTag: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  roleTagText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  additionalReqs: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 10,
  },
  companyAboutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  companySmallLogo: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  companyNameBold: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1e293b',
  },
  postedByText: {
    fontSize: 12,
    color: '#64748b',
  },
  companyContactGrid: {
    gap: 8,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactText: {
    fontSize: 13,
    color: '#475569',
  },
  similarJobsScroll: {
    flexDirection: 'row',
  },
  similarJobCard: {
    width: 200,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  similarJobTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2563eb',
    marginBottom: 4,
  },
  similarCompanyName: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  similarLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  similarLocationText: {
    fontSize: 11,
    color: '#64748b',
  },
  similarSalary: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '700',
    marginTop: 6,
  },
});

export default AppliedJobDetailScreen;
