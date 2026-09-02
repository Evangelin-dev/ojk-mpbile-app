import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Image,
  Linking,
  SafeAreaView,
  StatusBar,
  Platform,
  Alert,
} from 'react-native';
import {
  PencilIcon,
  XMarkIcon,
  DocumentTextIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  LightBulbIcon,
  CheckCircleIcon,
  MapPinIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  ArrowTopRightOnSquareIcon,
  PlusIcon,
  PhotoIcon,
  TrashIcon,
  ArrowUpTrayIcon,
} from 'react-native-heroicons/outline';
import Svg, { Path } from 'react-native-svg';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { fetchCandidateProfile, updateCandidateProfile } from '../api/candidate';
import { Header } from '../components/Header';

interface Certificate {
  name: string;
  fileUrl: string;
}

interface Application {
  id: number;
  job: {
    jobTitle: string;
    employer: {
      companyName: string;
    };
  };
  createdAt: string;
}

interface ProfileData {
  name: string;
  type: string;
  keywords: string;
  skills: string[];
  location: string;
  experienceYears: string;
  expectedSalary: string;
  education: string;
  graduationField?: string;
  diplomaField?: string;
  postGraduateField?: string;
  preferredJobType: string;
  preferredWorkLocation: string;
  englishLevel: string;
  additionalDetails?: { languages?: string[] };
  certificates?: Certificate[];
  cvUrl?: string;
  profileImage?: string | null;
  applications?: Application[];
}

const ProfileSection: React.FC<{
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, icon, children }) => (
  <View style={styles.sectionCard}>
    <View style={styles.sectionHeader}>
      <View style={styles.sectionIconWrapper}>{icon}</View>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
    <View style={styles.sectionContent}>{children}</View>
  </View>
);

const CandidateProfileScreen = () => {
  const navigation = useNavigation<any>();
  const { token, user, updateUser } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);

  // Edit states
  const [editedProfile, setEditedProfile] = useState<ProfileData | null>(null);
  const [newCvFile, setNewCvFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [newCertificates, setNewCertificates] = useState<{ name: string; file: DocumentPicker.DocumentPickerAsset }[]>([]);
  const [newCertName, setNewCertName] = useState('');
  const [newCertFile, setNewCertFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [newProfilePhoto, setNewProfilePhoto] = useState<any>(null);

  const fetchProfile = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setProfileMessage(null);
    try {
      const response = await fetchCandidateProfile(token);
      if (response.profile) {
        setProfile(response.profile);
        setEditedProfile(response.profile);
        setProfileImagePreview(response.profile.profileImage);

        // Update global user state with name and profile image if available
        updateUser({
          full_name: response.profile.name,
          profileImage: response.profile.profileImage
        });
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      setProfileMessage('Failed to load your profile.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const calculateCompleteness = (p: ProfileData | null): number => {
    if (!p) return 0;
    let score = 0;
    if (p.name) score += 10;
    if (p.location) score += 10;
    if (p.experienceYears) score += 10;
    if (p.skills?.length > 0) score += 20;
    if (p.education) score += 10;
    if (p.preferredJobType) score += 10;
    if (p.cvUrl || newCvFile) score += 15;
    if ((p.certificates && p.certificates.length > 0) || newCertificates.length > 0) score += 15;
    return Math.min(100, score);
  };

  const handlePickDocument = async (type: 'cv' | 'cert') => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        if (type === 'cv') {
          setNewCvFile(result.assets[0]);
        } else {
          setNewCertFile(result.assets[0]);
        }
      }
    } catch (err) {
      console.log('Error picking document', err);
    }
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      setProfileImagePreview(asset.uri);

      // Prepare for FormData upload
      const localUri = asset.uri;
      const filename = localUri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename || '');
      const type = match ? `image/${match[1]}` : `image`;

      setNewProfilePhoto({ uri: localUri, name: filename, type });
    }
  };

  const handleRemovePhoto = () => {
    setNewProfilePhoto(null);
    setProfileImagePreview(null);
  };

  const handleAddCertificate = () => {
    if (newCertName && newCertFile) {
      setNewCertificates([
        ...newCertificates,
        { name: newCertName, file: newCertFile },
      ]);
      setNewCertName('');
      setNewCertFile(null);
    } else {
      Alert.alert('Error', 'Please provide both certificate name and file.');
    }
  };

  const handleUpdateProfile = async () => {
    if (!editedProfile || !token) return;

    setLoading(true);
    setProfileMessage(null);
    try {
      const formData = new FormData();

      Object.entries(editedProfile).forEach(([key, value]) => {
        if (
          !['skills', 'additionalDetails', 'certificates', 'applications', 'cvUrl', 'profileImage'].includes(key) &&
          value !== null && value !== undefined
        ) {
          formData.append(key, String(value));
        }
      });

      formData.append('skills', JSON.stringify(editedProfile.skills));
      formData.append('additionalDetails', JSON.stringify(editedProfile.additionalDetails || {}));

      if (newCvFile) {
        formData.append('cv', {
          uri: Platform.OS === 'ios' ? newCvFile.uri.replace('file://', '') : newCvFile.uri,
          name: newCvFile.name,
          type: newCvFile.mimeType || 'application/pdf',
        } as any);
      }

      if (newProfilePhoto) {
        formData.append('profilePhoto', {
          uri: newProfilePhoto.uri,
          name: newProfilePhoto.name,
          type: newProfilePhoto.type,
        } as any);
      } else if (profileImagePreview === null && profile?.profileImage) {
        // If user explicitly removed the photo
        formData.append('removeProfilePhoto', 'true');
      }

      newCertificates.forEach((cert) => {
        formData.append('certificates', {
          uri: Platform.OS === 'ios' ? cert.file.uri.replace('file://', '') : cert.file.uri,
          name: cert.file.name,
          type: cert.file.mimeType || 'application/pdf',
        } as any);
        formData.append('certNames', cert.name);
      });

      const response = await updateCandidateProfile(formData, token);

      // Update global state after success
      if (response.profile) {
        updateUser({
          full_name: response.profile.name,
          profileImage: response.profile.profileImage
        });
      }

      Alert.alert('Success', 'Profile updated successfully!');
      setIsEditing(false);
      setNewCvFile(null);
      setNewCertificates([]);
      fetchProfile();
    } catch (error) {
      console.error('Failed to update profile:', error);
      setProfileMessage('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#fbb040" />
      </View>
    );
  }

  if (!profile && !loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header />
        <View style={styles.centerContainer}>
          <CheckCircleIcon size={60} color="#cbd5e1" style={{ marginBottom: 16 }} />
          <Text style={[styles.profileName, { marginBottom: 8 }]}>Profile Incomplete</Text>
          <Text style={[styles.errorText, { textAlign: 'center', marginBottom: 20 }]}>
            {profileMessage || 'You need to complete your profile to access this section.'}
          </Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => navigation.navigate('CandidateRegistration', {
              token,
              phone: user?.phone,
              user
            })}
          >
            <Text style={styles.retryBtnText}>Complete Profile Now</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const completeness = calculateCompleteness(profile);
  const data = isEditing ? editedProfile! : profile!;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Header />

      <View style={styles.topNav}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Svg width={24} height={24} fill="none" viewBox="0 0 24 24" stroke="#1e293b" strokeWidth={2}>
            <Path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </Svg>
          <Text style={styles.backBtnText}>Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Profile Header Card */}
        <View style={styles.profileHeaderCard}>
          <View style={styles.headerInfo}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatarLarge}>
                {profileImagePreview ? (
                  <Image source={{ uri: profileImagePreview }} style={styles.avatarImage} />
                ) : (
                  <Text style={styles.avatarLargeText}>{data.name?.charAt(0) || 'C'}</Text>
                )}
                {isEditing && profileImagePreview && (
                  <TouchableOpacity style={styles.removePhotoOverlay} onPress={handleRemovePhoto}>
                    <TrashIcon size={24} color="#fff" />
                  </TouchableOpacity>
                )}
              </View>
              {isEditing && (
                <TouchableOpacity style={styles.uploadBadge} onPress={handlePickImage}>
                  <ArrowUpTrayIcon size={14} color="#fff" />
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.headerTextWrap}>
              <Text style={styles.profileName}>{data.name}</Text>
              <View style={styles.locationRow}>
                <MapPinIcon size={14} color="#64748b" />
                <Text style={styles.profileLocation}>{data.location}</Text>
              </View>
            </View>
          </View>

          {!isEditing ? (
            <TouchableOpacity style={styles.editBtn} onPress={() => setIsEditing(true)}>
              <PencilIcon size={18} color="#fff" />
              <Text style={styles.editBtnText}>Edit Profile</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.editActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => { setIsEditing(false); setEditedProfile(profile); }}>
                <XMarkIcon size={18} color="#475569" />
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleUpdateProfile} disabled={loading}>
                {loading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.saveBtnText}>Save</Text>}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Profile Completeness */}
        <View style={styles.completenessCard}>
          <View style={styles.completenessHeader}>
            <Text style={styles.completenessTitle}>Profile Completeness</Text>
            <Text style={styles.completenessValue}>{completeness}%</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${completeness}%` }]} />
          </View>
        </View>

        {/* Main Content Grid (Mobile Vertical) */}
        <View style={styles.mainContent}>

          <ProfileSection title="Experience" icon={<BriefcaseIcon size={20} color="#fbb040" />}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Profile Type</Text>
              {isEditing ? (
                <View style={styles.pickerWrapper}>
                  {['FRESHER', 'EXPERIENCED'].map(opt => (
                    <TouchableOpacity
                      key={opt}
                      style={[styles.pickerOption, data.type === opt && styles.pickerOptionSelected]}
                      onPress={() => setEditedProfile({ ...data, type: opt })}
                    >
                      <Text style={[styles.pickerOptionText, data.type === opt && styles.pickerOptionTextSelected]}>
                        {opt === 'FRESHER' ? 'Fresher' : 'Experienced'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <Text style={styles.valueText}>{data.type === 'FRESHER' ? 'Fresher' : 'Experienced'}</Text>
              )}
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Experience (Years)</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={String(data.experienceYears)}
                  onChangeText={(val) => setEditedProfile({ ...data, experienceYears: val })}
                  keyboardType="numeric"
                  placeholderTextColor="#64748b"
                />
              ) : (
                <Text style={styles.valueText}>{data.experienceYears} years</Text>
              )}
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Expected Salary (Annual)</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={String(data.expectedSalary)}
                  onChangeText={(val) => setEditedProfile({ ...data, expectedSalary: val })}
                  keyboardType="numeric"
                  placeholderTextColor="#64748b"
                />
              ) : (
                <Text style={styles.valueText}>₹{Number(data.expectedSalary).toLocaleString()}</Text>
              )}
            </View>
          </ProfileSection>

          <ProfileSection title="Education" icon={<AcademicCapIcon size={20} color="#fbb040" />}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Highest Education</Text>
              {isEditing ? (
                <View style={styles.pickerWrapper}>
                  {[
                    { label: '10th', value: 'TENTH' },
                    { label: '12th', value: 'TWELFTH' },
                    { label: 'ITI', value: 'ITI' },
                    { label: 'Diploma', value: 'DIPLOMA' },
                    { label: 'Graduate', value: 'GRADUATE' },
                    { label: 'Post Graduate', value: 'POST_GRADUATE' },
                  ].map(opt => (
                    <TouchableOpacity
                      key={opt.value}
                      style={[styles.pickerOption, data.education === opt.value && styles.pickerOptionSelected]}
                      onPress={() => setEditedProfile({ ...data, education: opt.value })}
                    >
                      <Text style={[styles.pickerOptionText, data.education === opt.value && styles.pickerOptionTextSelected]}>{opt.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <Text style={styles.valueText}>
                  {(() => {
                    const opt = [
                      { label: '10th', value: 'TENTH' },
                      { label: '12th', value: 'TWELFTH' },
                      { label: 'ITI', value: 'ITI' },
                      { label: 'Diploma', value: 'DIPLOMA' },
                      { label: 'Graduate', value: 'GRADUATE' },
                      { label: 'Post Graduate', value: 'POST_GRADUATE' },
                    ].find(o => o.value === data.education);
                    return opt ? opt.label : data.education;
                  })()}
                </Text>
              )}
            </View>
            {(data.education === 'DIPLOMA' || data.education === 'GRADUATE' || data.education === 'POST_GRADUATE') && (
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Field of Study</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.input}
                    value={data.education === 'DIPLOMA' ? data.diplomaField : (data.education === 'GRADUATE' ? data.graduationField : data.postGraduateField)}
                    onChangeText={(val) => {
                      if(data.education === 'DIPLOMA') setEditedProfile({...data, diplomaField: val});
                      else if(data.education === 'GRADUATE') setEditedProfile({...data, graduationField: val});
                      else setEditedProfile({...data, postGraduateField: val});
                    }}
                    placeholderTextColor="#64748b"
                  />
                ) : (
                  <Text style={styles.valueText}>
                    {data.education === 'DIPLOMA' ? data.diplomaField : (data.education === 'GRADUATE' ? data.graduationField : data.postGraduateField) || 'Not specified'}
                  </Text>
                )}
              </View>
            )}
          </ProfileSection>

          <ProfileSection title="Skills & Preferences" icon={<LightBulbIcon size={20} color="#fbb040" />}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Keywords</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  placeholder="e.g. React, Developer, Marketing"
                  value={data.keywords}
                  onChangeText={(val) => setEditedProfile({ ...data, keywords: val })}
                  placeholderTextColor="#64748b"
                />
              ) : (
                <Text style={styles.valueText}>{data.keywords || 'None specified'}</Text>
              )}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Skills</Text>
              {isEditing ? (
                <TextInput
                  style={[styles.input, { height: 80 }]}
                  multiline
                  placeholder="e.g. React, Node.js (comma separated)"
                  value={data.skills.join(', ')}
                  onChangeText={(val) => setEditedProfile({ ...data, skills: val.split(',').map(s => s.trim()) })}
                  placeholderTextColor="#64748b"
                />
              ) : (
                <View style={styles.skillsWrapper}>
                  {data.skills.map((skill, idx) => (
                    <View key={idx} style={styles.skillTag}>
                      <Text style={styles.skillTagText}>{skill}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Preferred Job Type</Text>
              {isEditing ? (
                <View style={styles.pickerWrapper}>
                  {['Full Time', 'Part Time', 'Both'].map(opt => (
                    <TouchableOpacity
                      key={opt}
                      style={[styles.pickerOption, data.preferredJobType === opt && styles.pickerOptionSelected]}
                      onPress={() => setEditedProfile({ ...data, preferredJobType: opt })}
                    >
                      <Text style={[styles.pickerOptionText, data.preferredJobType === opt && styles.pickerOptionTextSelected]}>{opt}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <Text style={styles.valueText}>{data.preferredJobType}</Text>
              )}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Work Location</Text>
              {isEditing ? (
                <View style={styles.pickerWrapper}>
                  {['Office', 'Home', 'Remote', 'Hybrid'].map(opt => (
                    <TouchableOpacity
                      key={opt}
                      style={[styles.pickerOption, data.preferredWorkLocation === opt && styles.pickerOptionSelected]}
                      onPress={() => setEditedProfile({ ...data, preferredWorkLocation: opt })}
                    >
                      <Text style={[styles.pickerOptionText, data.preferredWorkLocation === opt && styles.pickerOptionTextSelected]}>{opt}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <Text style={styles.valueText}>{data.preferredWorkLocation}</Text>
              )}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>English Level</Text>
              {isEditing ? (
                <View style={styles.pickerWrapper}>
                  {['Basic', 'Intermediate', 'Fluent', 'Native'].map(opt => (
                    <TouchableOpacity
                      key={opt}
                      style={[styles.pickerOption, data.englishLevel === opt && styles.pickerOptionSelected]}
                      onPress={() => setEditedProfile({ ...data, englishLevel: opt })}
                    >
                      <Text style={[styles.pickerOptionText, data.englishLevel === opt && styles.pickerOptionTextSelected]}>{opt}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <Text style={styles.valueText}>{data.englishLevel}</Text>
              )}
            </View>
          </ProfileSection>

          <ProfileSection title="Certifications" icon={<CheckCircleIcon size={20} color="#fbb040" />}>
            <View style={styles.certList}>
              {profile!.certificates?.map((cert, i) => (
                <TouchableOpacity key={i} style={styles.certItem} onPress={() => Linking.openURL(cert.fileUrl)}>
                  <DocumentTextIcon size={16} color="#2563eb" />
                  <Text style={styles.certName}>{cert.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {isEditing && (
              <View style={styles.addCertSection}>
                <Text style={styles.addSubTitle}>Add New Certificate</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Certificate Name"
                  value={newCertName}
                  onChangeText={setNewCertName}
                  placeholderTextColor="#64748b"
                />
                <TouchableOpacity style={styles.filePicker} onPress={() => handlePickDocument('cert')}>
                  <Text style={styles.filePickerText}>{newCertFile ? newCertFile.name : 'Choose File'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.addBtn} onPress={handleAddCertificate}>
                  <PlusIcon size={18} color="#fff" />
                  <Text style={styles.addBtnText}>Add to Profile</Text>
                </TouchableOpacity>
                {newCertificates.length > 0 && (
                  <View style={styles.pendingCerts}>
                    {newCertificates.map((c, i) => (
                      <View key={i} style={styles.pendingCertItem}>
                        <Text style={styles.pendingCertName}>{c.name}</Text>
                        <TouchableOpacity onPress={() => setNewCertificates(newCertificates.filter((_, idx) => idx !== i))}>
                          <XMarkIcon size={16} color="#ef4444" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}
          </ProfileSection>

          <View style={styles.sectionCard}>
            <Text style={styles.sidebarTitle}>Your CV</Text>
            {profile!.cvUrl && (
              <TouchableOpacity style={styles.cvDisplay} onPress={() => Linking.openURL(profile!.cvUrl!)}>
                <DocumentTextIcon size={24} color="#fbb040" />
                <Text style={styles.cvLinkText}>View Current CV</Text>
                <ArrowTopRightOnSquareIcon size={16} color="#94a3b8" />
              </TouchableOpacity>
            )}
            {isEditing && (
              <TouchableOpacity style={styles.cvUploadBtn} onPress={() => handlePickDocument('cv')}>
                <Text style={styles.cvUploadBtnText}>{newCvFile ? newCvFile.name : 'Upload New CV'}</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sidebarTitle}>Recent Applications</Text>
            <View style={styles.appLinks}>
              {profile!.applications?.length ? (
                profile!.applications.slice(0, 3).map((app) => (
                  <View key={app.id} style={styles.appItem}>
                    <Text style={styles.appJobTitle}>{app.job.jobTitle}</Text>
                    <Text style={styles.appCompany}>{app.job.employer.companyName}</Text>
                    <Text style={styles.appDate}>Applied on {new Date(app.createdAt).toLocaleDateString()}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No applications yet.</Text>
              )}
            </View>
          </View>

        </View>
        <View style={{ height: 40 }} />
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
    padding: 20,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 0,
  },
  topNav: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8fafc',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  profileHeaderCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    gap: 12,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: '65%',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarLarge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fef3c7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fde68a',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  uploadBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#fbb040',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  removePhotoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLargeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fbb040',
  },
  headerTextWrap: {
    marginLeft: 16,
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    flexShrink: 1,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
    flexShrink: 1,
  },
  profileLocation: {
    fontSize: 14,
    color: '#64748b',
    flexShrink: 1,
  },
  editBtn: {
    backgroundColor: '#fbb040',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  editBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  editActions: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 4,
  },
  cancelBtnText: {
    color: '#475569',
    fontWeight: '600',
    fontSize: 13,
  },
  saveBtn: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  completenessCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  completenessHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  completenessTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  completenessValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10b981',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 4,
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  sectionIconWrapper: {
    backgroundColor: '#fef3c7',
    padding: 8,
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  sectionContent: {
    gap: 16,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  valueText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1e293b',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
    color: '#1e293b',
    backgroundColor: '#e2e8f0',
  },
  pickerWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pickerOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e6f4ea',
    backgroundColor: '#e6f4ea',
    marginRight: 4,
    marginBottom: 4,
  },
  pickerOptionSelected: {
    backgroundColor: '#39b54a',
    borderColor: '#2f9e40',
  },
  pickerOptionText: {
    fontSize: 13,
    color: '#39b54a',
    fontWeight: '500',
  },
  pickerOptionTextSelected: {
    color: '#fff',
  },
  skillsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillTag: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  skillTagText: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '500',
  },
  certList: {
    gap: 10,
  },
  certItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  certName: {
    fontSize: 14,
    color: '#2563eb',
    textDecorationLine: 'underline',
  },
  addCertSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    gap: 12,
  },
  addSubTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  filePicker: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderStyle: 'dashed',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  filePickerText: {
    color: '#64748b',
    fontSize: 14,
  },
  addBtn: {
    backgroundColor: '#1e293b',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  addBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  pendingCerts: {
    marginTop: 8,
    gap: 6,
  },
  pendingCertItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 8,
    borderRadius: 8,
  },
  pendingCertName: {
    fontSize: 12,
    color: '#475569',
    flex: 1,
  },
  sidebarTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  cvDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  cvLinkText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#b97a13',
  },
  cvUploadBtn: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#fbb040',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  cvUploadBtnText: {
    color: '#fbb040',
    fontWeight: '700',
    fontSize: 13,
  },
  appLinks: {
    gap: 12,
  },
  appItem: {
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  appJobTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
  },
  appCompany: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  appDate: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 4,
  },
  emptyText: {
    fontSize: 13,
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  errorText: {
    color: '#ef4444',
    marginBottom: 12,
  },
  retryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#fbb040',
    borderRadius: 10,
  },
  retryBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default CandidateProfileScreen;
