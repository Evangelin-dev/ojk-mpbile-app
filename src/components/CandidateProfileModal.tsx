import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TouchableWithoutFeedback,
  Linking,
  Dimensions,
  Platform,
} from 'react-native';
import {
  XMarkIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  LanguageIcon,
  PhoneIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon,
  MapPinIcon,
} from 'react-native-heroicons/outline';

interface Certificate {
  name: string;
  fileUrl: string;
}

interface DetailedCandidateProfile {
  id: number;
  name: string;
  skills: string[];
  location: string;
  experienceYears: number | string;
  expectedSalary: string;
  education: string;
  englishLevel: string;
  cvUrl?: string;
  certificates?: Certificate[];
  additionalDetails?: {
    languages?: string[];
  };
  user: {
    phone: string;
  };
}

interface CandidateProfileModalProps {
  visible: boolean;
  candidate: DetailedCandidateProfile | null;
  onClose: () => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const DetailItem = ({ icon: Icon, label, value }: { icon: any, label: string, value: string | React.ReactNode }) => (
  <View style={styles.detailItem}>
    <View style={styles.detailIconContainer}>
      <Icon size={20} color="#fbb040" strokeWidth={2} />
    </View>
    <View style={styles.detailTextContainer}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue} numberOfLines={1}>{value || 'N/A'}</Text>
    </View>
  </View>
);

const CandidateProfileModal: React.FC<CandidateProfileModalProps> = ({ visible, candidate, onClose }) => {
  if (!candidate) return null;

  const handleDownload = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.error("Couldn't open URL", error);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              {/* Decorative Handle */}
              <View style={styles.dragHandle} />

              <View style={styles.header}>
                <View style={styles.headerTop}>
                  <View style={styles.avatarContainer}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{getInitials(candidate.name)}</Text>
                    </View>
                    <View style={styles.onlineBadge} />
                  </View>
                  <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                    <XMarkIcon size={22} color="#64748b" />
                  </TouchableOpacity>
                </View>

                <View style={styles.headerInfo}>
                  <Text style={styles.name}>{candidate.name}</Text>
                  <View style={styles.locationContainer}>
                    <MapPinIcon size={14} color="#94a3b8" />
                    <Text style={styles.locationText}>{candidate.location}</Text>
                  </View>
                </View>
              </View>

              <ScrollView
                style={styles.scrollContent}
                contentContainerStyle={styles.scrollInnerContent}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.grid}>
                  <DetailItem icon={BriefcaseIcon} label="Experience" value={`${candidate.experienceYears} Years`} />
                  <DetailItem
                    icon={AcademicCapIcon}
                    label="Education"
                    value={candidate.education?.toLowerCase().replace(/_/g, ' ')}
                  />
                  <DetailItem icon={LanguageIcon} label="English" value={candidate.englishLevel} />
                  <DetailItem icon={PhoneIcon} label="Contact" value={candidate.user?.phone} />
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Skills & Expertise</Text>
                  <View style={styles.skillsContainer}>
                    {candidate.skills?.map((skill, index) => (
                      <View key={index} style={styles.skillBadge}>
                        <Text style={styles.skillText}>{skill}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {candidate.cvUrl && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Documents</Text>
                    <TouchableOpacity
                      style={styles.fileCard}
                      onPress={() => handleDownload(candidate.cvUrl!)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.fileInfo}>
                        <View style={styles.fileIconWrapper}>
                          <DocumentTextIcon size={24} color="#fbb040" />
                        </View>
                        <View>
                          <Text style={styles.fileName}>Curriculum Vitae</Text>
                          <Text style={styles.fileType}>PDF • Professional Resume</Text>
                        </View>
                      </View>
                      <View style={styles.downloadIconWrapper}>
                        <ArrowDownTrayIcon size={18} color="#fff" />
                      </View>
                    </TouchableOpacity>
                  </View>
                )}

                {candidate.certificates && candidate.certificates.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Certifications</Text>
                    {candidate.certificates.map((cert, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[styles.fileCard, { marginBottom: 12 }]}
                        onPress={() => handleDownload(cert.fileUrl)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.fileInfo}>
                          <View style={[styles.fileIconWrapper, { backgroundColor: '#E0F2FE' }]}>
                            <DocumentTextIcon size={24} color="#0EA5E9" />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.fileName} numberOfLines={1}>{cert.name}</Text>
                            <Text style={styles.fileType}>Verified Certificate</Text>
                          </View>
                        </View>
                        <View style={[styles.downloadIconWrapper, { backgroundColor: '#0EA5E9' }]}>
                          <ArrowDownTrayIcon size={18} color="#fff" />
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {candidate.additionalDetails?.languages && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Languages</Text>
                    <View style={styles.languagesContainer}>
                      {candidate.additionalDetails.languages.map((lang, index) => (
                        <View key={index} style={styles.langBadge}>
                          <Text style={styles.langText}>{lang}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </ScrollView>

              <View style={styles.footer}>
                <TouchableOpacity
                  style={styles.closeFooterBtn}
                  onPress={onClose}
                  activeOpacity={0.8}
                >
                  <Text style={styles.closeFooterBtnText}>Close Profile</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    width: '100%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    height: SCREEN_HEIGHT * 0.85,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 25,
  },
  dragHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 12,
  },
  header: {
    paddingTop: 8,
    paddingHorizontal: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: '#FFF7E0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    ...Platform.select({
      ios: {
        shadowColor: '#fbb040',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  avatarText: {
    color: '#fbb040',
    fontSize: 26,
    fontWeight: '800',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#22C55E',
    borderWidth: 3,
    borderColor: '#fff',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  headerInfo: {
    marginTop: 4,
  },
  name: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  locationText: {
    fontSize: 15,
    color: '#64748b',
    fontWeight: '500',
  },
  scrollContent: {
    flex: 1,
  },
  scrollInnerContent: {
    padding: 24,
    paddingBottom: 40,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  detailItem: {
    width: (SCREEN_WIDTH - 60) / 2,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    gap: 12,
  },
  detailIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginTop: 1,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 16,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillBadge: {
    backgroundColor: '#FFF7E0',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(251, 176, 64, 0.3)',
  },
  skillText: {
    fontSize: 14,
    color: '#b97a13',
    fontWeight: '700',
  },
  languagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  langBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  langText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '600',
  },
  fileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  fileIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#FFF7E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fileName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  fileType: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
    marginTop: 2,
  },
  downloadIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#fbb040',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  closeFooterBtn: {
    backgroundColor: '#0F172A',
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  closeFooterBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 0.5,
  },
});

export default CandidateProfileModal;
