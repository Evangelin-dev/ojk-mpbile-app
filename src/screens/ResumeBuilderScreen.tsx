import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import Svg, { Path as SvgPath } from 'react-native-svg';
import {
  DocumentTextIcon,
  PlusIcon,
  TrashIcon,
  SparklesIcon,
  ArrowDownTrayIcon,
  ChevronLeftIcon,
  EyeIcon,
} from 'react-native-heroicons/outline';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { fetchCandidateProfile } from '../api/candidate';
import { Header } from '../components/Header';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

interface ContactInfo {
  name: string;
  email: string;
  phone: string;
  linkedin: string;
}

interface Experience {
  id: number;
  jobTitle: string;
  company: string;
  date: string;
  description: string;
}

interface Education {
  id: number;
  degree: string;
  university: string;
  date: string;
}

interface ResumeData {
  contact: ContactInfo;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
}

const initialData: ResumeData = {
  contact: {
    name: 'Your Name',
    email: 'your.email@example.com',
    phone: 'Your Phone Number',
    linkedin: 'Your LinkedIn Profile URL',
  },
  summary:
    'A highly motivated and results-oriented professional with a passion for [Your Field]. Eager to apply skills in [Skill 1], [Skill 2], and [Skill 3] to contribute to a dynamic team and achieve organizational goals.',
  experience: [
    {
      id: 1,
      jobTitle: 'Your Job Title',
      company: 'Your Company',
      date: 'Month Year - Present',
      description:
        '- Summarize your key responsibilities and achievements.\n- Quantify your impact with metrics and results where possible.\n- Use action verbs to describe your contributions.',
    },
  ],
  education: [
    {
      id: 1,
      degree: 'Your Degree, Field of Study',
      university: 'Your University',
      date: 'Year - Year',
    },
  ],
  skills: ['Your Skill 1', 'Your Skill 2', 'Your Skill 3'],
};

const transformProfileToResumeData = (profile: any): ResumeData => {
  const contactInfo: ContactInfo = {
    name: profile.name || initialData.contact.name,
    email: profile.user?.workEmail || initialData.contact.email,
    phone: profile.user?.phone || initialData.contact.phone,
    linkedin: initialData.contact.linkedin,
  };

  let summaryText: string = initialData.summary;
  if (profile.keywords) {
    summaryText = `Experienced professional with expertise in ${profile.keywords}. Seeking to leverage skills in a challenging role.`;
  }

  const experienceData: Experience[] = [];
  if (profile.previousCompany && profile.previousPosition) {
    experienceData.push({
      id: 1,
      jobTitle: profile.previousPosition,
      company: profile.previousCompany,
      date: profile.experienceYears ? `${profile.experienceYears} Years Exp` : 'Year - Present',
      description: initialData.experience[0].description,
    });
  } else {
    experienceData.push(initialData.experience[0]);
  }

  const educationData: Education[] = [];
  let degreeText = initialData.education[0].degree;
  if (profile.education) {
    degreeText = `${profile.education} in ${profile.graduationField || profile.diplomaField || profile.postGraduateField || 'Field of Study'}`;
  }
  educationData.push({
    id: 1,
    degree: degreeText,
    university: 'University Name',
    date: 'Year - Year',
  });

  const skillsData = profile.skills && profile.skills.length > 0 ? profile.skills : initialData.skills;

  return {
    contact: contactInfo,
    summary: summaryText,
    experience: experienceData,
    education: educationData,
    skills: skillsData,
  };
};

const ResumeBuilderScreen = () => {
  const navigation = useNavigation<any>();
  const { token } = useAuth();
  const [resumeData, setResumeData] = useState<ResumeData>(initialData);
  const [template, setTemplate] = useState<'modern' | 'classic'>('modern');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const response = await fetchCandidateProfile(token);
        if (response.profile) {
          setResumeData(transformProfileToResumeData(response.profile));
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  const handleUpdateContact = (field: keyof ContactInfo, value: string) => {
    setResumeData(prev => ({
      ...prev,
      contact: { ...prev.contact, [field]: value }
    }));
  };

  const handleUpdateExperience = (id: number, field: keyof Experience, value: string) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map(exp => exp.id === id ? { ...exp, [field]: value } : exp)
    }));
  };

  const addExperience = () => {
    setResumeData(prev => ({
      ...prev,
      experience: [...prev.experience, {
        id: Date.now(),
        jobTitle: '',
        company: '',
        date: '',
        description: '',
      }]
    }));
  };

  const removeExperience = (id: number) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.filter(exp => exp.id !== id)
    }));
  };

  const handleUpdateEducation = (id: number, field: keyof Education, value: string) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.map(edu => edu.id === id ? { ...edu, [field]: value } : edu)
    }));
  };

  const addEducation = () => {
    setResumeData(prev => ({
      ...prev,
      education: [...prev.education, {
        id: Date.now(),
        degree: '',
        university: '',
        date: '',
      }]
    }));
  };

  const removeEducation = (id: number) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id)
    }));
  };

  const generateAISuggestion = () => {
    setResumeData(prev => ({
      ...prev,
      summary: 'Highly skilled professional with a proven track record of excellence. Seeking to leverage technical expertise and leadership skills to drive results in a challenging environment.'
    }));
  };

  const createHTML = () => {
    const isModern = template === 'modern';
    const primaryColor = isModern ? '#2563eb' : '#000000';
    const headerAlign = isModern ? 'center' : 'left';

    return `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
          <style>
            body { font-family: 'Helvetica', 'Arial', sans-serif; padding: 40px; color: #333; line-height: 1.6; }
            h1 { color: ${primaryColor}; margin-bottom: 5px; font-size: 32px; text-transform: uppercase; text-align: ${headerAlign}; }
            .contact {
              color: #64748b;
              font-size: 14px;
              margin-bottom: 30px;
              border-bottom: 2px solid ${primaryColor};
              padding-bottom: 10px;
              text-align: ${headerAlign};
            }
            .section-title {
              color: ${primaryColor};
              font-size: 18px;
              font-weight: bold;
              text-transform: uppercase;
              margin-top: 25px;
              border-bottom: 1px solid #e2e8f0;
              padding-bottom: 5px;
              margin-bottom: 15px;
            }
            .item { margin-bottom: 15px; }
            .item-header { display: flex; justify-content: space-between; font-weight: bold; font-size: 16px; }
            .item-sub { color: #64748b; font-style: italic; font-size: 14px; margin-bottom: 5px; }
            .description { font-size: 14px; white-space: pre-wrap; }
            .skills { display: flex; flex-wrap: wrap; gap: 8px; }
            .skill-tag {
              background: ${isModern ? '#eff6ff' : 'transparent'};
              color: ${isModern ? '#1d4ed8' : '#333'};
              padding: ${isModern ? '4px 12px' : '0'};
              border-radius: 20px;
              font-size: 12px;
              font-weight: bold;
              border: ${isModern ? '1px solid #dbeafe' : 'none'};
              ${!isModern ? 'margin-right: 15px;' : ''}
            }
          </style>
        </head>
        <body>
          <h1>${resumeData.contact.name}</h1>
          <div class="contact">
            ${resumeData.contact.email} | ${resumeData.contact.phone} ${resumeData.contact.linkedin ? `| ${resumeData.contact.linkedin}` : ''}
          </div>

          <div class="section-title">Professional Summary</div>
          <div class="description">${resumeData.summary}</div>

          <div class="section-title">Work Experience</div>
          ${resumeData.experience.map(exp => `
            <div class="item">
              <div class="item-header"><span>${exp.jobTitle}</span> <span>${exp.date}</span></div>
              <div class="item-sub">${exp.company}</div>
              <div class="description">${exp.description}</div>
            </div>
          `).join('')}

          <div class="section-title">Education</div>
          ${resumeData.education.map(edu => `
            <div class="item">
              <div class="item-header"><span>${edu.degree}</span> <span>${edu.date}</span></div>
              <div class="item-sub">${edu.university}</div>
            </div>
          `).join('')}

          <div class="section-title">Skills</div>
          <div class="skills">
            ${resumeData.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
          </div>
        </body>
      </html>
    `;
  };

  const handleDownload = async () => {
    setGenerating(true);
    try {
      // Using Print.printAsync is the most reliable way on mobile
      // On Android, it shows the system print UI where you can choose 'Save as PDF'
      // On iOS, it shows the system print UI where you can share as PDF
      await Print.printAsync({
        html: createHTML(),
      });
    } catch (error) {
      console.error('PDF Generation Error:', error);
      Alert.alert('Error', 'Failed to generate PDF. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

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

      <View style={styles.topNav}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Svg width={24} height={24} fill="none" viewBox="0 0 24 24" stroke="#1e293b" strokeWidth={2}>
            <SvgPath strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </Svg>
          <Text style={styles.backBtnText}>Back</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.pageTitle}>Resume Builder</Text>
              <Text style={styles.pageSubtitle}>Create a professional resume in minutes</Text>
            </View>
            <TouchableOpacity style={styles.downloadBtn} onPress={handleDownload} disabled={generating}>
              {generating ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <ArrowDownTrayIcon size={20} color="#fff" />
                  <Text style={styles.downloadBtnText}>Save PDF</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Template Selector */}
          <View style={styles.templateSection}>
            <Text style={styles.sectionTitle}>Choose Template</Text>
            <View style={styles.templateGrid}>
              <TouchableOpacity
                style={[styles.templateBtn, template === 'modern' && styles.templateBtnActive]}
                onPress={() => setTemplate('modern')}
              >
                <Text style={[styles.templateBtnText, template === 'modern' && styles.templateBtnTextActive]}>Modern</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.templateBtn, template === 'classic' && styles.templateBtnActive]}
                onPress={() => setTemplate('classic')}
              >
                <Text style={[styles.templateBtnText, template === 'classic' && styles.templateBtnTextActive]}>Classic</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Contact Section */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={resumeData.contact.name}
              onChangeText={(val) => handleUpdateContact('name', val)}
              placeholderTextColor="#64748b"
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={resumeData.contact.email}
              onChangeText={(val) => handleUpdateContact('email', val)}
              keyboardType="email-address"
              placeholderTextColor="#64748b"
            />
            <TextInput
              style={styles.input}
              placeholder="Phone"
              value={resumeData.contact.phone}
              onChangeText={(val) => handleUpdateContact('phone', val)}
              keyboardType="phone-pad"
              placeholderTextColor="#64748b"
            />
            <TextInput
              style={styles.input}
              placeholder="LinkedIn URL"
              value={resumeData.contact.linkedin}
              onChangeText={(val) => handleUpdateContact('linkedin', val)}
              placeholderTextColor="#64748b"
            />
          </View>

          {/* Summary Section */}
          <View style={styles.formSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Professional Summary</Text>
              <TouchableOpacity style={styles.aiBtn} onPress={generateAISuggestion}>
                <SparklesIcon size={16} color="#2563eb" />
                <Text style={styles.aiBtnText}>AI Suggest</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Write a brief summary about yourself..."
              multiline
              value={resumeData.summary}
              onChangeText={(val) => setResumeData(prev => ({ ...prev, summary: val }))}
              placeholderTextColor="#64748b"
            />
          </View>

          {/* Experience Section */}
          <View style={styles.formSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Work Experience</Text>
              <TouchableOpacity style={styles.addBtn} onPress={addExperience}>
                <PlusIcon size={18} color="#2563eb" />
                <Text style={styles.addBtnText}>Add</Text>
              </TouchableOpacity>
            </View>
            {resumeData.experience.map((exp, index) => (
              <View key={exp.id} style={styles.itemCard}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemIndex}>Experience #{index + 1}</Text>
                  <TouchableOpacity onPress={() => removeExperience(exp.id)}>
                    <TrashIcon size={18} color="#ef4444" />
                  </TouchableOpacity>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Job Title"
                  value={exp.jobTitle}
                  onChangeText={(val) => handleUpdateExperience(exp.id, 'jobTitle', val)}
                  placeholderTextColor="#64748b"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Company"
                  value={exp.company}
                  onChangeText={(val) => handleUpdateExperience(exp.id, 'company', val)}
                  placeholderTextColor="#64748b"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Dates (e.g. Jan 2022 - Present)"
                  value={exp.date}
                  onChangeText={(val) => handleUpdateExperience(exp.id, 'date', val)}
                  placeholderTextColor="#64748b"
                />
                <TextInput
                  style={[styles.input, styles.textAreaSm]}
                  placeholder="Description of responsibilities..."
                  multiline
                  value={exp.description}
                  onChangeText={(val) => handleUpdateExperience(exp.id, 'description', val)}
                  placeholderTextColor="#64748b"
                />
              </View>
            ))}
          </View>

          {/* Education Section */}
          <View style={styles.formSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Education</Text>
              <TouchableOpacity style={styles.addBtn} onPress={addEducation}>
                <PlusIcon size={18} color="#2563eb" />
                <Text style={styles.addBtnText}>Add</Text>
              </TouchableOpacity>
            </View>
            {resumeData.education.map((edu, index) => (
              <View key={edu.id} style={styles.itemCard}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemIndex}>Education #{index + 1}</Text>
                  <TouchableOpacity onPress={() => removeEducation(edu.id)}>
                    <TrashIcon size={18} color="#ef4444" />
                  </TouchableOpacity>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Degree"
                  value={edu.degree}
                  onChangeText={(val) => handleUpdateEducation(edu.id, 'degree', val)}
                  placeholderTextColor="#64748b"
                />
                <TextInput
                  style={styles.input}
                  placeholder="University"
                  value={edu.university}
                  onChangeText={(val) => handleUpdateEducation(edu.id, 'university', val)}
                  placeholderTextColor="#64748b"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Dates"
                  value={edu.date}
                  onChangeText={(val) => handleUpdateEducation(edu.id, 'date', val)}
                  placeholderTextColor="#64748b"
                />
              </View>
            ))}
          </View>

          {/* Skills Section */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <TextInput
              style={[styles.input, styles.textAreaSm]}
              placeholder="Enter skills separated by commas (e.g. React, Python, UI Design)"
              multiline
              value={resumeData.skills.join(', ')}
              onChangeText={(val) => setResumeData(prev => ({
                ...prev,
                skills: val.split(',').map(s => s.trim()).filter(s => s !== '')
              }))}
              placeholderTextColor="#64748b"
            />
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1e293b',
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  downloadBtn: {
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
    elevation: 2,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  downloadBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  formSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#e2e8f0',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1e293b',
    marginBottom: 12,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  textAreaSm: {
    height: 80,
    textAlignVertical: 'top',
  },
  aiBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#eff6ff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  aiBtnText: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '700',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  addBtnText: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '700',
  },
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    marginBottom: 16,
    elevation: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemIndex: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
  templateSection: {
    marginBottom: 24,
  },
  templateGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  templateBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#fff',
  },
  templateBtnActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  templateBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  templateBtnTextActive: {
    color: '#fff',
  },
});

export default ResumeBuilderScreen;
