import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  UserGroupIcon,
  ArrowDownTrayIcon,
  QuestionMarkCircleIcon,
  ChevronLeftIcon,
} from 'react-native-heroicons/outline';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { fetchJobApplications } from '../api/employer';
import { Header } from '../components/Header';
import SupportTicketModal from '../components/SupportTicketModal';
// NOTE: These libraries need to be installed:
import * as XLSX from 'xlsx';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

const ReportsDashboardScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { token } = useAuth();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSupportModalVisible, setIsSupportModalVisible] = useState(false);

  const handleDownloadReport = async () => {
    if (!token) {
      Alert.alert('Error', 'You must be logged in to download reports.');
      return;
    }

    setIsDownloading(true);

    try {
      const response = await fetchJobApplications(token);

      // The API structure from the web code: { message, jobs: [{ jobTitle, applications: [...] }] }
      const jobsWithApplications = response.jobs;

      if (!jobsWithApplications || jobsWithApplications.length === 0) {
        Alert.alert('Notice', 'No jobs with applications found to generate a report.');
        return;
      }

      const formattedData = jobsWithApplications.flatMap((job: any) =>
        job.applications.map((app: any) => ({
          "Candidate Name": app.candidate.name,
          "Job Title": job.jobTitle,
          "Applied On": new Date(app.createdAt).toLocaleDateString('en-GB'),
          "Candidate Phone": app.candidate.user.phone,
          "Location": app.candidate.location,
          "Experience (Years)": app.candidate.experienceYears,
          "Skills": app.candidate.skills.join(', '),
          "CV Link": app.cvUrl,
        }))
      );

      if (formattedData.length === 0) {
        Alert.alert('Notice', 'No applications found across all your jobs.');
        return;
      }

      // EXCEL EXPORT LOGIC
      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Applications Report");
      const base64 = XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' });
      const filename = FileSystem.documentDirectory + `OJK_Report_${new Date().getTime()}.xlsx`;
      await FileSystem.writeAsStringAsync(filename, base64, { encoding: FileSystem.EncodingType.Base64 });
      await Sharing.shareAsync(filename);

    } catch (error) {
      console.error('Failed to download report:', error);
      Alert.alert('Error', 'Could not generate the report. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ChevronLeftIcon size={24} color="#fbb040" />
            <Text style={styles.backBtnText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Reports Dashboard</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconWrapper}>
              <UserGroupIcon size={32} color="#fbb040" />
            </View>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardHeading}>Applications Report</Text>
              <Text style={styles.cardDescription}>
                Export all candidates who applied to your jobs in Excel format.
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.downloadBtn}
            onPress={handleDownloadReport}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <ActivityIndicator color="#fbb040" />
            ) : (
              <>
                <Text style={styles.downloadBtnText}>View & Download Report</Text>
                <ArrowDownTrayIcon size={18} color="#fbb040" />
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.helpContainer}>
          <QuestionMarkCircleIcon size={18} color="#fbb040" />
          <Text style={styles.helpText}>Need a custom report?</Text>
          <TouchableOpacity onPress={() => setIsSupportModalVisible(true)}>
            <Text style={styles.contactLink}>Contact Sales</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <SupportTicketModal
        visible={isSupportModalVisible}
        onClose={() => setIsSupportModalVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF7E0',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginLeft: -4,
  },
  backBtnText: {
    fontSize: 16,
    color: '#fbb040',
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#253858',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#fbb040',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(251, 176, 64, 0.2)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    marginBottom: 20,
  },
  iconWrapper: {
    backgroundColor: '#FFF7E0',
    padding: 12,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'rgba(251, 176, 64, 0.3)',
  },
  cardTextContainer: {
    flex: 1,
  },
  cardHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#253858',
  },
  cardDescription: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 16,
  },
  downloadBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fbb040',
  },
  helpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    gap: 6,
    paddingHorizontal: 4,
  },
  helpText: {
    fontSize: 14,
    color: '#475569',
  },
  contactLink: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fbb040',
    textDecorationLine: 'underline',
  },
});

export default ReportsDashboardScreen;
