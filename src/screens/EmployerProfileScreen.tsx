import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { fetchEmployerProfile, updateEmployerProfile } from '../api/employer';
import { Header } from '../components/Header';
import {
  UserCircleIcon,
  BuildingOfficeIcon,
  EnvelopeIcon,
  IdentificationIcon,
  UserGroupIcon,
  CalendarIcon,
  CheckCircleIcon,
  XMarkIcon,
  PhotoIcon,
  TrashIcon,
  ArrowUpTrayIcon,
  InformationCircleIcon,
  PhoneIcon,
  PencilSquareIcon,
} from 'react-native-heroicons/outline';

interface ApiEmployerProfile {
  id: number;
  fullName: string;
  mobileNumber: string;
  companyName: string;
  employeesCount: number;
  gstNumber: string;
  workEmail: string;
  approved: boolean;
  credits: number;
  profileImage: string | null;
  createdAt: string;
}

export default function EmployerProfileScreen() {
  const { token } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [profileData, setProfileData] = useState<ApiEmployerProfile | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    mobileNumber: '',
    companyName: '',
    employeesCount: '',
    gstNumber: '',
    workEmail: '',
    profilePhoto: null as any,
  });
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetchEmployerProfile(token);
      const userProfile = response.data?.profile || response.profile;

      setProfileData(userProfile);
      setFormData({
        fullName: userProfile.fullName || '',
        mobileNumber: userProfile.mobileNumber || '',
        companyName: userProfile.companyName || '',
        employeesCount: String(userProfile.employeesCount || 0),
        gstNumber: userProfile.gstNumber || '',
        workEmail: userProfile.workEmail || '',
        profilePhoto: null,
      });
      setProfileImagePreview(userProfile.profileImage);
    } catch (err: any) {
      if (err.response?.status === 404) {
        Alert.alert("Welcome!", "Please complete your profile to get started.");
        setIsEditing(true);
      } else {
        console.error("Failed to fetch profile", err);
        Alert.alert("Error", "Could not load profile data.");
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
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

      setFormData(prev => ({
        ...prev,
        profilePhoto: { uri: localUri, name: filename, type }
      }));
    }
  };

  const handleRemovePhoto = () => {
    setFormData(prev => ({ ...prev, profilePhoto: null }));
    setProfileImagePreview(null);
  };

  const handleSaveChanges = async () => {
    if (!formData.fullName || !formData.companyName || !formData.mobileNumber) {
      Alert.alert("Error", "Full Name, Company Name, and Mobile Number are required.");
      return;
    }
    if (!/^\d{10}$/.test(formData.mobileNumber)) {
      Alert.alert("Error", "Please enter a valid 10-digit mobile number.");
      return;
    }

    setSaving(true);
    try {
      let payload: any;

      if (formData.profilePhoto) {
        payload = new FormData();
        payload.append('fullName', formData.fullName);
        payload.append('mobileNumber', formData.mobileNumber);
        payload.append('companyName', formData.companyName);
        payload.append('employeesCount', formData.employeesCount);
        if (formData.gstNumber) payload.append('gstNumber', formData.gstNumber);
        if (formData.workEmail) payload.append('workEmail', formData.workEmail);
        payload.append('profilePhoto', formData.profilePhoto);
      } else {
        payload = {
          fullName: formData.fullName,
          mobileNumber: formData.mobileNumber,
          companyName: formData.companyName,
          employeesCount: Number(formData.employeesCount) || 0,
          gstNumber: formData.gstNumber,
          workEmail: formData.workEmail,
        };
      }

      const response = await updateEmployerProfile(payload, token!);

      const updatedProfile = response.data?.profile || response.profile;
      if (updatedProfile) {
        setProfileData(updatedProfile);
        setProfileImagePreview(updatedProfile.profileImage);
      }

      Alert.alert("Success", "Profile saved successfully!");
      setIsEditing(false);
    } catch (err: any) {
      console.error("Failed to save profile", err);
      Alert.alert("Error", err.response?.data?.message || "An error occurred while saving your profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f97316" />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        <Header />
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* Header Card */}
          <View style={styles.headerCard}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.headerTitle}>Employer Profile</Text>
              <Text style={styles.headerSubtitle} numberOfLines={1}>Manage your company and contact details.</Text>
            </View>

            {!isEditing ? (
              <TouchableOpacity style={styles.editBtn} onPress={() => setIsEditing(true)}>
                <PencilSquareIcon size={20} color="#fff" />
                <Text style={styles.editBtnText}>Edit Profile</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.editingActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => { setIsEditing(false); fetchProfile(); }}>
                  <XMarkIcon size={20} color="#64748b" />
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={handleSaveChanges} disabled={saving}>
                  {saving ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <CheckCircleIcon size={20} color="#fff" />
                      <Text style={styles.saveBtnText}>Save</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Profile Details Card */}
          <View style={styles.detailsCard}>

            {/* Profile Image Section */}
            <View style={styles.imageSection}>
              <Text style={styles.sectionLabel}>Company Logo / Profile Photo</Text>
              <View style={styles.imageContainer}>
                <View style={styles.avatarWrapper}>
                  {profileImagePreview ? (
                    <Image source={{ uri: profileImagePreview }} style={styles.avatarImage} />
                  ) : (
                    <PhotoIcon size={64} color="#94a3b8" />
                  )}
                  {isEditing && profileImagePreview && (
                    <TouchableOpacity style={styles.removePhotoOverlay} onPress={handleRemovePhoto}>
                      <TrashIcon size={32} color="#fff" />
                    </TouchableOpacity>
                  )}
                </View>

                {isEditing && (
                  <TouchableOpacity style={styles.uploadBtn} onPress={handlePickImage}>
                    <ArrowUpTrayIcon size={20} color="#f97316" />
                    <Text style={styles.uploadBtnText}>
                      {profileImagePreview ? 'Change Photo' : 'Upload Photo'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              {isEditing && (
                <View style={styles.hintRow}>
                  <InformationCircleIcon size={16} color="#3b82f6" />
                  <Text style={styles.hintText}>JPG, PNG, GIF recommended.</Text>
                </View>
              )}
            </View>

            {/* Form Fields */}
            <View style={styles.formGrid}>

              {/* Left Column */}
              <View style={styles.formColumn}>
                <Field
                  label="Full Name"
                  value={formData.fullName}
                  onChangeText={(t) => setFormData(p => ({...p, fullName: t}))}
                  icon={<UserCircleIcon size={18} color="#3b82f6" />}
                  isEditing={isEditing}
                />
                <Field
                  label="Mobile Number"
                  value={formData.mobileNumber}
                  onChangeText={(t) => setFormData(p => ({...p, mobileNumber: t}))}
                  icon={<PhoneIcon size={18} color="#3b82f6" />}
                  isEditing={isEditing}
                  keyboardType="phone-pad"
                  maxLength={10}
                />
                <Field
                  label="Work Email"
                  value={formData.workEmail}
                  onChangeText={(t) => setFormData(p => ({...p, workEmail: t}))}
                  icon={<EnvelopeIcon size={18} color="#3b82f6" />}
                  isEditing={isEditing}
                  keyboardType="email-address"
                />
              </View>

              {/* Right Column */}
              <View style={styles.formColumn}>
                <Field
                  label="Company Name"
                  value={formData.companyName}
                  onChangeText={(t) => setFormData(p => ({...p, companyName: t}))}
                  icon={<BuildingOfficeIcon size={18} color="#3b82f6" />}
                  isEditing={isEditing}
                />
                <Field
                  label="Employees Count"
                  value={formData.employeesCount}
                  onChangeText={(t) => setFormData(p => ({...p, employeesCount: t}))}
                  icon={<UserGroupIcon size={18} color="#3b82f6" />}
                  isEditing={isEditing}
                  keyboardType="numeric"
                />
                <Field
                  label="GST Number"
                  value={formData.gstNumber}
                  onChangeText={(t) => setFormData(p => ({...p, gstNumber: t}))}
                  icon={<IdentificationIcon size={18} color="#3b82f6" />}
                  isEditing={isEditing}
                />
              </View>
            </View>

            {profileData?.createdAt && (
              <View style={styles.footerInfo}>
                <CalendarIcon size={16} color="#94a3b8" />
                <Text style={styles.footerText}>
                  Profile created on: {new Date(profileData.createdAt).toLocaleDateString()}
                </Text>
              </View>
            )}
          </View>

        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  icon: React.ReactNode;
  isEditing: boolean;
  keyboardType?: any;
  maxLength?: number;
}

const Field = ({ label, value, onChangeText, icon, isEditing, keyboardType, maxLength }: FieldProps) => (
  <View style={styles.fieldContainer}>
    <View style={styles.fieldLabelRow}>
      {icon}
      <Text style={styles.fieldLabel}>{label}</Text>
    </View>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      editable={isEditing}
      style={[
        styles.fieldInput,
        !isEditing && styles.fieldInputReadOnly
      ]}
      keyboardType={keyboardType}
      maxLength={maxLength}
      placeholder={`Enter ${label.toLowerCase()}`}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff7ed', // orange-50
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff7ed',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#475569',
    fontWeight: '600',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  // Header Card
  headerCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#f97316',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ffedd5',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1e293b',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  editBtn: {
    backgroundColor: '#fbb040',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  editBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  editingActions: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelBtn: {
    backgroundColor: '#f1f5f9',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 4,
  },
  cancelBtnText: {
    color: '#475569',
    fontWeight: '700',
    fontSize: 14,
  },
  saveBtn: {
    backgroundColor: '#f97316',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
    minWidth: 80,
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  // Details Card
  detailsCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#f97316',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    borderWidth: 1,
    borderColor: '#ffedd5',
  },
  imageSection: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 12,
  },
  imageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  avatarWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#fdba74', // orange-300
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: '#fff7ed',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  removePhotoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    backgroundColor: '#fff7ed',
    borderWidth: 2,
    borderColor: '#fed7aa',
    borderRadius: 12,
    borderStyle: 'dashed',
    gap: 8,
  },
  uploadBtnText: {
    color: '#ea580c',
    fontWeight: '700',
    fontSize: 15,
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  hintText: {
    fontSize: 12,
    color: '#64748b',
  },
  // Form Grid
  formGrid: {
    flexDirection: 'column', // In mobile, we stack or use rows carefully
    gap: 16,
  },
  formColumn: {
    gap: 16,
  },
  fieldContainer: {
    gap: 6,
  },
  fieldLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  fieldInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1e293b',
  },
  fieldInputReadOnly: {
    backgroundColor: '#f1f5f9',
    borderColor: '#e2e8f0',
    color: '#64748b',
  },
  footerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  footerText: {
    fontSize: 13,
    color: '#94a3b8',
  },
});
