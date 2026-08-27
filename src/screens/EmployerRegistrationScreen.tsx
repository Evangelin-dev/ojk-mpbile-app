import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { createEmployerProfile } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import Svg, { Path } from 'react-native-svg';

export default function EmployerRegistrationScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { login } = useAuth();
  
  // Passed from LoginScreen
  const token = route.params?.token || '';
  const initialPhone = route.params?.phone || '';
  const initialUser = route.params?.user || {};

  const [form, setForm] = useState({
    fullName: '',
    companyName: '',
    isConsultancy: false,
    employees: '',
    workEmail: '',
    gstNumber: '',
    mobile: initialPhone.replace('+91', ''),
  });

  const [profilePhoto, setProfilePhoto] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [agree, setAgree] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
        setError('File size exceeds 5MB. Please choose a smaller image.');
        return;
      }
      setProfilePhoto(asset);
      setError('');
    }
  };

  const handleRegister = async () => {
    if (!form.fullName || !form.companyName || !form.employees || !form.mobile) {
      setError('Please fill in all required fields.');
      return;
    }
    if (!agree) {
      setError('You must agree to the Terms of Service and Privacy Policy.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('fullName', form.fullName);
      formData.append('mobileNumber', `+91${form.mobile}`);
      formData.append('companyName', form.companyName);
      formData.append('employeesCount', form.employees);
      if (form.workEmail) formData.append('workEmail', form.workEmail);
      if (form.gstNumber) formData.append('gstNumber', form.gstNumber);
      
      // We pass the isConsultancy flag as true/false string based on backend design, assuming backend needs it
      formData.append('isConsultancy', String(form.isConsultancy));

      if (profilePhoto) {
        const uriParts = profilePhoto.uri.split('.');
        const fileType = uriParts[uriParts.length - 1];
        
        // Append the image as a file
        formData.append('profilePhoto', {
          uri: Platform.OS === 'ios' ? profilePhoto.uri.replace('file://', '') : profilePhoto.uri,
          name: `photo.${fileType}`,
          type: `image/${fileType}`,
        } as any);
      }

      // Add Authorization header manually here since the auth interceptor doesn't exist yet
      // Or we can rely on our login context if it sets the global axios header (but we just passed token)
      // Actually, since createEmployerProfile doesn't accept token right now, let's just pass it to the api
      // For now, let's update createEmployerProfile in auth.ts to accept token, or we just set it in AsyncStorage and read it.
      
      // Better approach: pass token directly to createEmployerProfile if needed. 
      const payload = await createEmployerProfile(formData, token);
      
      // payload usually contains { profile: EmployerProfile }
      // The web app did: localStorage.setItem("profile", JSON.stringify(actionResult.payload));
      
      // Complete the login process
      await login(token, { ...initialUser, ...payload, hasProfile: true });

      // Navigate home
      navigation.navigate('MainTabs', { screen: 'Home' });

    } catch (err: any) {
      let errorMsg = 'Registration failed';
      if (err?.response?.data) {
        const data = err.response.data;
        if (typeof data === 'string') errorMsg = data;
        else if (data.message) errorMsg = data.message;
        else if (data.error) errorMsg = data.error;
      } else if (err?.message) {
        errorMsg = err.message;
      }
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Close Button */}
        <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Employer Setup</Text>
        <Text style={styles.subtitle}>Complete your profile to start hiring.</Text>

        <View style={styles.formCard}>
          {/* Photo Upload */}
          <View style={styles.photoContainer}>
            <TouchableOpacity style={styles.photoBtn} onPress={pickImage}>
              {profilePhoto ? (
                <Image source={{ uri: profilePhoto.uri }} style={styles.photoImage} />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Svg width={32} height={32} fill="none" viewBox="0 0 24 24">
                    <Path stroke="#fbb040" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </Svg>
                  <Text style={styles.photoText}>Upload Logo</Text>
                </View>
              )}
            </TouchableOpacity>
            {profilePhoto && (
              <TouchableOpacity onPress={() => setProfilePhoto(null)}>
                <Text style={styles.removePhotoText}>Remove Photo</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Form Fields */}
          <View style={styles.field}>
            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              style={styles.input}
              value={form.fullName}
              onChangeText={(t) => setForm({ ...form, fullName: t })}
              placeholder="Enter full name"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Mobile Number *</Text>
            <TextInput
              style={styles.input}
              value={form.mobile}
              onChangeText={(t) => setForm({ ...form, mobile: t })}
              keyboardType="number-pad"
              maxLength={10}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Company Name *</Text>
            <TextInput
              style={styles.input}
              value={form.companyName}
              onChangeText={(t) => setForm({ ...form, companyName: t })}
              placeholder="Enter company name"
            />
          </View>

          <View style={styles.checkboxRow}>
            <TouchableOpacity style={styles.checkbox} onPress={() => setForm({ ...form, isConsultancy: !form.isConsultancy })}>
              {form.isConsultancy && <View style={styles.checkboxInner} />}
            </TouchableOpacity>
            <Text style={styles.checkboxLabel}>We are a Consultancy/Agency</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Number of Employees *</Text>
            <TextInput
              style={styles.input}
              value={form.employees}
              onChangeText={(t) => setForm({ ...form, employees: t.replace(/[^0-9]/g, '') })}
              keyboardType="number-pad"
              placeholder="e.g. 50"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Work Email (Optional)</Text>
            <TextInput
              style={styles.input}
              value={form.workEmail}
              onChangeText={(t) => setForm({ ...form, workEmail: t })}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="name@company.com"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>GST Number (Optional)</Text>
            <TextInput
              style={styles.input}
              value={form.gstNumber}
              onChangeText={(t) => setForm({ ...form, gstNumber: t })}
              placeholder="Enter GST Number"
              autoCapitalize="characters"
            />
          </View>

          <View style={[styles.checkboxRow, { marginTop: 16, alignItems: 'flex-start' }]}>
            <TouchableOpacity style={[styles.checkbox, { marginTop: 2 }]} onPress={() => setAgree(!agree)}>
              {agree && <View style={styles.checkboxInner} />}
            </TouchableOpacity>
            <Text style={styles.checkboxLabel}>
              I agree to the Terms of Service and Privacy Policy
            </Text>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity 
            style={[styles.button, isLoading && { opacity: 0.7 }]} 
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Create Account</Text>
            )}
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff7ed', // light orange tint
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  closeBtn: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fbb040',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: '#6b7280',
    marginBottom: 24,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#fbb040',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(251, 176, 64, 0.2)',
  },
  photoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  photoBtn: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fff7ed',
    borderWidth: 2,
    borderColor: '#fbb040',
    borderStyle: 'dashed',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoText: {
    fontSize: 12,
    color: '#fbb040',
    marginTop: 4,
    fontWeight: '500',
  },
  removePhotoText: {
    fontSize: 13,
    color: '#ef4444',
    marginTop: 8,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 15,
    backgroundColor: '#f9fafb',
    color: '#1f2937',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#fbb040',
    borderRadius: 4,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxInner: {
    width: 10,
    height: 10,
    backgroundColor: '#fbb040',
    borderRadius: 2,
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#4b5563',
    flex: 1,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#fbb040',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
