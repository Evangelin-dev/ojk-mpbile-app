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
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import { createCandidateProfile } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import Svg, { Path } from 'react-native-svg';

const STEPS = [
  'Basic Info',
  'Experience',
  'Education',
  'Preferences',
  'Skills',
  'Certifications',
  'Languages',
];

export default function CandidateRegistrationScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { login } = useAuth();
  
  const token = route.params?.token || '';
  const initialPhone = route.params?.phone || '';
  const initialUser = route.params?.user || {};

  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 0: Basic Info
  const [fullName, setFullName] = useState(initialUser.full_name || '');
  const [jobCategory, setJobCategory] = useState<'white-collar' | 'blue-collar'>('white-collar');
  const [profileType, setProfileType] = useState<'FRESHER' | 'EXPERIENCED'>('FRESHER');
  const [keywords, setKeywords] = useState('');
  const [cvFile, setCvFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);

  // Step 1: Experience
  const [previousCompany, setPreviousCompany] = useState('');
  const [previousPosition, setPreviousPosition] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [expectedSalary, setExpectedSalary] = useState('');

  // Step 2: Education
  const [educationLevel, setEducationLevel] = useState('');
  const [fieldOfStudy, setFieldOfStudy] = useState('');

  // Step 3: Preferences
  const [preferredJobType, setPreferredJobType] = useState('');
  const [preferredWorkLocation, setPreferredWorkLocation] = useState('');

  // Step 4: Skills
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');

  // Step 5: Certifications
  const [certificates, setCertificates] = useState<{name: string, file: DocumentPicker.DocumentPickerAsset}[]>([]);
  const [certNameInput, setCertNameInput] = useState('');
  const [certFileInput, setCertFileInput] = useState<DocumentPicker.DocumentPickerAsset | null>(null);

  // Step 6: Languages
  const [englishLevel, setEnglishLevel] = useState('');
  const [languages, setLanguages] = useState<string[]>([]);
  const [languageInput, setLanguageInput] = useState('');

  const pickDocument = async (type: 'cv' | 'cert') => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        if (type === 'cv') {
          setCvFile(result.assets[0]);
        } else {
          setCertFileInput(result.assets[0]);
        }
      }
    } catch (err) {
      console.log('Error picking document', err);
    }
  };

  const addSkill = () => {
    if (skillInput.trim()) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const addLanguage = () => {
    if (languageInput.trim()) {
      setLanguages([...languages, languageInput.trim()]);
      setLanguageInput('');
    }
  };

  const removeLanguage = (index: number) => {
    setLanguages(languages.filter((_, i) => i !== index));
  };

  const addCertificate = () => {
    if (certNameInput.trim() && certFileInput) {
      setCertificates([...certificates, { name: certNameInput.trim(), file: certFileInput }]);
      setCertNameInput('');
      setCertFileInput(null);
    }
  };

  const removeCertificate = (index: number) => {
    setCertificates(certificates.filter((_, i) => i !== index));
  };

  const handleNext = async () => {
    setError('');

    // Validation for Step 0
    if (step === 0) {
      if (!fullName) {
        setError('Full Name is required.');
        return;
      }
      if (jobCategory === 'white-collar' && !cvFile) {
        setError('CV is required for white-collar positions.');
        return;
      }
    }

    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      // Submit
      await submitProfile();
    }
  };

  const handlePrev = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSkip = async () => {
    // Save user with hasProfile: false and navigate home
    await login(token, { ...initialUser, hasProfile: false });
    navigation.navigate('MainTabs', { screen: 'Home' });
  };

  const submitProfile = async () => {
    setIsLoading(true);
    setError('');

    try {
      const formData = new FormData();

      // Basic Info
      formData.append('name', fullName);
      formData.append('type', profileType); // 'FRESHER' or 'EXPERIENCED'
      formData.append('keywords', keywords);
      
      if (cvFile) {
        formData.append('cv', {
          uri: Platform.OS === 'ios' ? cvFile.uri.replace('file://', '') : cvFile.uri,
          name: cvFile.name,
          type: cvFile.mimeType || 'application/pdf',
        } as any);
      }

      // Experience
      if (previousCompany) formData.append('previousCompany', previousCompany);
      if (previousPosition) formData.append('previousPosition', previousPosition);
      if (experienceYears) formData.append('experienceYears', experienceYears);
      if (expectedSalary) formData.append('expectedSalary', expectedSalary);

      // Education
      if (educationLevel) formData.append('education', educationLevel);
      if (fieldOfStudy) formData.append('graduationField', fieldOfStudy); // assuming graduationField for now

      // Preferences
      if (preferredJobType) formData.append('preferredJobType', preferredJobType);
      if (preferredWorkLocation) formData.append('preferredWorkLocation', preferredWorkLocation);
      formData.append('location', preferredWorkLocation || 'Not specified');

      // Skills
      formData.append('skills', JSON.stringify(skills));

      // Certifications
      certificates.forEach((cert) => {
        formData.append('certificates', {
          uri: Platform.OS === 'ios' ? cert.file.uri.replace('file://', '') : cert.file.uri,
          name: cert.file.name,
          type: cert.file.mimeType || 'application/pdf',
        } as any);
        formData.append('certNames', cert.name);
      });

      // Languages & English Level
      if (englishLevel) formData.append('englishLevel', englishLevel);
      formData.append('additionalDetails', JSON.stringify({ languages }));

      // API Call
      const payload = await createCandidateProfile(formData, token);

      // Save user with latest profile info
      const profileData = payload.data?.profile || payload.profile || payload;
      await login(token, {
        ...initialUser,
        ...profileData,
        full_name: profileData.name || initialUser.full_name,
        profileImage: profileData.profileImage,
        hasProfile: true
      });

      // Navigate home
      navigation.navigate('MainTabs', { screen: 'Home' });

    } catch (err: any) {
      let errorMsg = 'Profile creation failed';
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

  const renderStepIndicator = () => (
    <View style={styles.stepIndicatorContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.stepIndicatorScroll}>
        {STEPS.map((label, idx) => (
          <View key={label} style={styles.stepDotWrapper}>
            <View style={[styles.stepDot, step >= idx && styles.stepDotActive]}>
              <Text style={[styles.stepDotText, step >= idx && styles.stepDotTextActive]}>{idx + 1}</Text>
            </View>
            <Text style={[styles.stepLabel, step >= idx && styles.stepLabelActive]} numberOfLines={1}>{label}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Candidate Setup</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={styles.subtitle}>Step {step + 1} of {STEPS.length}</Text>
          <TouchableOpacity onPress={handleSkip}>
            <Text style={{ color: '#39b54a', fontWeight: 'bold' }}>Skip for now</Text>
          </TouchableOpacity>
        </View>
      </View>

      {renderStepIndicator()}

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.formCard}>
          
          {step === 0 && (
            <View>
              <View style={styles.field}>
                <Text style={styles.label}>Full Name *</Text>
                <TextInput
                  style={styles.input}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Enter your full name"
                  placeholderTextColor="#64748b"
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Job Category *</Text>
                <View style={styles.row}>
                  <TouchableOpacity 
                    style={[styles.toggleBtn, jobCategory === 'white-collar' && styles.toggleBtnActive]}
                    onPress={() => setJobCategory('white-collar')}
                  >
                    <Text style={[styles.toggleBtnText, jobCategory === 'white-collar' && styles.toggleBtnTextActive]}>White Collar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.toggleBtn, jobCategory === 'blue-collar' && styles.toggleBtnActive]}
                    onPress={() => setJobCategory('blue-collar')}
                  >
                    <Text style={[styles.toggleBtnText, jobCategory === 'blue-collar' && styles.toggleBtnTextActive]}>Blue Collar</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Profile Type *</Text>
                <View style={styles.row}>
                  <TouchableOpacity 
                    style={[styles.toggleBtn, profileType === 'FRESHER' && styles.toggleBtnActive]}
                    onPress={() => setProfileType('FRESHER')}
                  >
                    <Text style={[styles.toggleBtnText, profileType === 'FRESHER' && styles.toggleBtnTextActive]}>Fresher</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.toggleBtn, profileType === 'EXPERIENCED' && styles.toggleBtnActive]}
                    onPress={() => setProfileType('EXPERIENCED')}
                  >
                    <Text style={[styles.toggleBtnText, profileType === 'EXPERIENCED' && styles.toggleBtnTextActive]}>Experienced</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Keywords</Text>
                <TextInput
                  style={styles.input}
                  value={keywords}
                  onChangeText={setKeywords}
                  placeholder="e.g. React, Developer, Marketing"
                  placeholderTextColor="#64748b"
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>
                  Upload CV (PDF) {jobCategory === 'white-collar' ? '*' : '(Optional)'}
                </Text>
                <TouchableOpacity style={styles.uploadBtn} onPress={() => pickDocument('cv')}>
                  <Text style={styles.uploadBtnText}>
                    {cvFile ? cvFile.name : 'Choose PDF/Doc'}
                  </Text>
                </TouchableOpacity>
                {cvFile && (
                  <TouchableOpacity onPress={() => setCvFile(null)} style={{marginTop: 8}}>
                    <Text style={{color: '#ef4444', fontSize: 13}}>Remove CV</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {step === 1 && (
            <View>
              <View style={styles.field}>
                <Text style={styles.label}>Previous Company</Text>
                <TextInput
                  style={styles.input}
                  value={previousCompany}
                  onChangeText={setPreviousCompany}
                  placeholder="e.g. Google"
                  placeholderTextColor="#64748b"
                />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Previous Position</Text>
                <TextInput
                  style={styles.input}
                  value={previousPosition}
                  onChangeText={setPreviousPosition}
                  placeholder="e.g. Software Engineer"
                  placeholderTextColor="#64748b"
                />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Years of Experience</Text>
                <TextInput
                  style={styles.input}
                  value={experienceYears}
                  onChangeText={setExperienceYears}
                  keyboardType="numeric"
                  placeholder="e.g. 3"
                  placeholderTextColor="#64748b"
                />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Expected Salary</Text>
                <TextInput
                  style={styles.input}
                  value={expectedSalary}
                  onChangeText={setExpectedSalary}
                  keyboardType="numeric"
                  placeholder="e.g. 50000"
                  placeholderTextColor="#64748b"
                />
              </View>
            </View>
          )}

          {step === 2 && (
            <View>
              <View style={styles.field}>
                <Text style={styles.label}>Highest Education Level</Text>
                <View style={styles.tagsContainer}>
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
                      style={[styles.tag, educationLevel === opt.value && styles.tagActive]}
                      onPress={() => setEducationLevel(opt.value)}
                    >
                      <Text style={[styles.tagText, educationLevel === opt.value && styles.tagTextActive]}>{opt.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Field of Study</Text>
                <TextInput
                  style={styles.input}
                  value={fieldOfStudy}
                  onChangeText={setFieldOfStudy}
                  placeholder="e.g. Computer Science"
                  placeholderTextColor="#64748b"
                />
              </View>
            </View>
          )}

          {step === 3 && (
            <View>
              <View style={styles.field}>
                <Text style={styles.label}>Preferred Job Type</Text>
                <TextInput
                  style={styles.input}
                  value={preferredJobType}
                  onChangeText={setPreferredJobType}
                  placeholder="e.g. Full-time, Remote"
                  placeholderTextColor="#64748b"
                />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Preferred Work Location</Text>
                <TextInput
                  style={styles.input}
                  value={preferredWorkLocation}
                  onChangeText={setPreferredWorkLocation}
                  placeholder="e.g. New York, NY"
                  placeholderTextColor="#64748b"
                />
              </View>
            </View>
          )}

          {step === 4 && (
            <View>
              <View style={styles.field}>
                <Text style={styles.label}>Add Skills</Text>
                <View style={styles.row}>
                  <TextInput
                    style={[styles.input, { flex: 1, marginRight: 8 }]}
                    value={skillInput}
                    onChangeText={setSkillInput}
                    placeholder="e.g. React Native"
                    onSubmitEditing={addSkill}
                    placeholderTextColor="#64748b"
                  />
                  <TouchableOpacity style={styles.addBtn} onPress={addSkill}>
                    <Text style={styles.addBtnText}>Add</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.tagsContainer}>
                {skills.map((skill, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{skill}</Text>
                    <TouchableOpacity onPress={() => removeSkill(index)}>
                      <Text style={styles.tagClose}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}

          {step === 5 && (
            <View>
              <View style={styles.field}>
                <Text style={styles.label}>Add Certifications</Text>
                <TextInput
                  style={[styles.input, { marginBottom: 8 }]}
                  value={certNameInput}
                  onChangeText={setCertNameInput}
                  placeholder="Certificate Name (e.g. AWS Certified)"
                  placeholderTextColor="#64748b"
                />
                <TouchableOpacity style={styles.uploadBtn} onPress={() => pickDocument('cert')}>
                  <Text style={styles.uploadBtnText}>
                    {certFileInput ? certFileInput.name : 'Choose Certificate File'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.addBtn, { marginTop: 12, paddingVertical: 12, width: '100%' }]} 
                  onPress={addCertificate}
                  disabled={!certNameInput || !certFileInput}
                >
                  <Text style={styles.addBtnText}>Add Certificate</Text>
                </TouchableOpacity>
              </View>

              {certificates.map((cert, index) => (
                <View key={index} style={styles.certCard}>
                  <Text style={styles.certName}>{cert.name}</Text>
                  <Text style={styles.certFileName} numberOfLines={1}>{cert.file.name}</Text>
                  <TouchableOpacity onPress={() => removeCertificate(index)} style={styles.certRemove}>
                    <Text style={{color: '#ef4444'}}>Remove</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {step === 6 && (
            <View>
              <View style={styles.field}>
                <Text style={styles.label}>English Level</Text>
                <View style={styles.tagsContainer}>
                  {['Basic', 'Intermediate', 'Fluent', 'Native'].map(lvl => (
                    <TouchableOpacity 
                      key={lvl}
                      style={[styles.tag, englishLevel === lvl && styles.tagActive]}
                      onPress={() => setEnglishLevel(lvl)}
                    >
                      <Text style={[styles.tagText, englishLevel === lvl && styles.tagTextActive]}>{lvl}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Other Languages</Text>
                <View style={styles.row}>
                  <TextInput
                    style={[styles.input, { flex: 1, marginRight: 8 }]}
                    value={languageInput}
                    onChangeText={setLanguageInput}
                    placeholder="e.g. Spanish"
                    onSubmitEditing={addLanguage}
                    placeholderTextColor="#64748b"
                  />
                  <TouchableOpacity style={styles.addBtn} onPress={addLanguage}>
                    <Text style={styles.addBtnText}>Add</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.tagsContainer}>
                {languages.map((lang, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{lang}</Text>
                    <TouchableOpacity onPress={() => removeLanguage(index)}>
                      <Text style={styles.tagClose}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

        </View>
      </ScrollView>

      {/* Footer Navigation */}
      <View style={styles.footer}>
        {step > 0 ? (
          <TouchableOpacity style={styles.prevBtn} onPress={handlePrev} disabled={isLoading}>
            <Text style={styles.prevBtnText}>Back</Text>
          </TouchableOpacity>
        ) : <View style={{flex: 1}} />}
        
        <TouchableOpacity 
          style={[styles.nextBtn, isLoading && { opacity: 0.7 }]} 
          onPress={handleNext}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.nextBtnText}>
              {step === STEPS.length - 1 ? 'Submit' : 'Next'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0fdf4', // light green tint
  },
  header: {
    paddingTop: Platform.OS === 'android' ? 40 : 20,
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: '#fff',
  },
  closeBtn: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 40 : 20,
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
    color: '#39b54a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: '#6b7280',
  },
  stepIndicatorContainer: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  stepIndicatorScroll: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  stepDotWrapper: {
    alignItems: 'center',
    marginHorizontal: 8,
    width: 60,
  },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  stepDotActive: {
    backgroundColor: '#39b54a',
  },
  stepDotText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#9ca3af',
  },
  stepDotTextActive: {
    color: '#fff',
  },
  stepLabel: {
    fontSize: 10,
    color: '#9ca3af',
    textAlign: 'center',
  },
  stepLabelActive: {
    color: '#39b54a',
    fontWeight: '600',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#39b54a',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(57, 181, 74, 0.2)',
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
    backgroundColor: '#e2e8f0',
    color: '#1f2937',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleBtn: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  toggleBtnActive: {
    backgroundColor: '#39b54a',
    borderColor: '#39b54a',
  },
  toggleBtnText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  toggleBtnTextActive: {
    color: '#fff',
  },
  uploadBtn: {
    height: 48,
    borderWidth: 1,
    borderColor: '#39b54a',
    borderStyle: 'dashed',
    borderRadius: 8,
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadBtnText: {
    color: '#39b54a',
    fontSize: 14,
    fontWeight: '500',
  },
  addBtn: {
    backgroundColor: '#39b54a',
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e6f4ea',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tagActive: {
    backgroundColor: '#39b54a',
    borderColor: '#2f9e40',
  },
  tagText: {
    color: '#39b54a',
    fontSize: 13,
    fontWeight: '500',
    marginRight: 6,
  },
  tagTextActive: {
    color: '#fff',
  },
  tagClose: {
    color: '#39b54a',
    fontSize: 14,
    fontWeight: 'bold',
  },
  certCard: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  certName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  certFileName: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  certRemove: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  prevBtn: {
    flex: 1,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  prevBtnText: {
    color: '#4b5563',
    fontSize: 16,
    fontWeight: '600',
  },
  nextBtn: {
    flex: 1,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#39b54a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
