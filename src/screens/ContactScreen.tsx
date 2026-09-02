import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Header } from '../components/Header';
import { sendContactMessage, sendSupportTicket } from '../api/auth';
import {
  EnvelopeIcon,
  MapPinIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  ArrowRightIcon,
} from 'react-native-heroicons/outline';

export default function ContactScreen() {
  const { user, token } = useAuth();

  // State for general contact form
  const [generalFormData, setGeneralFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isGeneralLoading, setIsGeneralLoading] = useState(false);

  // State for support ticket form
  const [supportFormData, setSupportFormData] = useState({
    subject: '',
    message: '',
  });
  const [isSupportLoading, setIsSupportLoading] = useState(false);

  const handleGeneralSubmit = async () => {
    const { firstName, lastName, email, subject, message } = generalFormData;
    if (!firstName || !lastName || !email || !subject || !message) {
      Alert.alert('Error', 'Please fill out all required fields.');
      return;
    }

    setIsGeneralLoading(true);
    try {
      await sendContactMessage(generalFormData);
      Alert.alert('Success', 'Your message has been sent successfully!');
      setGeneralFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      });
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to send message.');
    } finally {
      setIsGeneralLoading(false);
    }
  };

  const handleSupportSubmit = async () => {
    if (!user || !token) {
      Alert.alert('Error', 'Please login to send a support ticket.');
      return;
    }
    const { subject, message } = supportFormData;
    if (!subject || !message) {
      Alert.alert('Error', 'Please fill out both subject and message.');
      return;
    }

    setIsSupportLoading(true);
    try {
      await sendSupportTicket(supportFormData, token);
      Alert.alert('Success', 'Your support ticket has been sent successfully!');
      setSupportFormData({ subject: '', message: '' });
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to send support ticket.');
    } finally {
      setIsSupportLoading(false);
    }
  };

  const InfoItem = ({ icon: Icon, title, content, color }: any) => (
    <View style={styles.infoItem}>
      <View style={[styles.infoIconContainer, { backgroundColor: color + '20' }]}>
        <Icon size={24} color={color} />
      </View>
      <View style={styles.infoTextContainer}>
        <Text style={styles.infoTitle}>{title}</Text>
        <Text style={styles.infoContent}>{content}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerSection}>
          <Text style={styles.pageTitle}>Get in Touch</Text>
          <Text style={styles.pageSubtitle}>
            We’re here to help. Have a question, problem, or feedback? Fill out the form below.
          </Text>
        </View>

        {/* General Contact Form */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Send us a Message</Text>
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>First Name</Text>
              <TextInput
                style={styles.input}
                value={generalFormData.firstName}
                onChangeText={(text) => setGeneralFormData({ ...generalFormData, firstName: text })}
                placeholder="First name"
                placeholderTextColor="#64748b"
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Last Name</Text>
              <TextInput
                style={styles.input}
                value={generalFormData.lastName}
                onChangeText={(text) => setGeneralFormData({ ...generalFormData, lastName: text })}
                placeholder="Last name"
                placeholderTextColor="#64748b"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              value={generalFormData.email}
              onChangeText={(text) => setGeneralFormData({ ...generalFormData, email: text })}
              placeholder="email@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#64748b"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={generalFormData.phone}
              onChangeText={(text) => setGeneralFormData({ ...generalFormData, phone: text })}
              placeholder="+91 XXXXX XXXXX"
              keyboardType="phone-pad"
              placeholderTextColor="#64748b"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Subject</Text>
            <TextInput
              style={styles.input}
              value={generalFormData.subject}
              onChangeText={(text) => setGeneralFormData({ ...generalFormData, subject: text })}
              placeholder="e.g., Question about job postings"
              placeholderTextColor="#64748b"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Message</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={generalFormData.message}
              onChangeText={(text) => setGeneralFormData({ ...generalFormData, message: text })}
              placeholder="Describe your issue or question..."
              multiline
              numberOfLines={4}
              placeholderTextColor="#64748b"
            />
          </View>

          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleGeneralSubmit}
            disabled={isGeneralLoading}
          >
            {isGeneralLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.submitBtnText}>Send Message</Text>
                <ArrowRightIcon size={20} color="#fff" style={{ marginLeft: 8 }} />
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Contact Information */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Contact Information</Text>
          <InfoItem
            icon={MapPinIcon}
            title="Our Office"
            content="OHM Jaikrishna Manpower Services, Kongu Nadu Region, Tiruppur, India"
            color="#f97316"
          />
          <InfoItem
            icon={EnvelopeIcon}
            title="Email Us"
            content="info@ojkjobs.com"
            color="#f97316"
          />
          <InfoItem
            icon={PhoneIcon}
            title="Call Us"
            content="+91 94423 74403"
            color="#f97316"
          />
          <InfoItem
            icon={ChatBubbleLeftRightIcon}
            title="WhatsApp"
            content="+91 81225 77694"
            color="#22c55e"
          />
          <InfoItem
            icon={ClockIcon}
            title="Working Hours"
            content="Mon - Sat: 9:00 AM - 6:00 PM"
            color="#3b82f6"
          />
        </View>

        {/* Support Ticket Section (If logged in) */}
        {user && (
          <View style={[styles.card, styles.supportCard]}>
            <Text style={styles.cardTitle}>Send a Support Ticket</Text>
            <Text style={styles.supportSubtitle}>
              If you are a registered user and need to send a support ticket, please use the form below.
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Subject</Text>
              <TextInput
                style={styles.input}
                value={supportFormData.subject}
                onChangeText={(text) => setSupportFormData({ ...supportFormData, subject: text })}
                placeholder="e.g., Issue with my profile"
                placeholderTextColor="#64748b"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Message</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={supportFormData.message}
                onChangeText={(text) => setSupportFormData({ ...supportFormData, message: text })}
                placeholder="Describe your issue or question..."
                multiline
                numberOfLines={4}
                placeholderTextColor="#64748b"
              />
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: '#f97316' }]}
              onPress={handleSupportSubmit}
              disabled={isSupportLoading}
            >
              {isSupportLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.submitBtnText}>Send Support Ticket</Text>
                  <ArrowRightIcon size={20} color="#fff" style={{ marginLeft: 8 }} />
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  headerSection: {
    padding: 20,
    alignItems: 'center',
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1e293b',
    textAlign: 'center',
  },
  pageSubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#e2e8f0',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#1e293b',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitBtn: {
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 8,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  infoIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
  },
  infoContent: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  supportCard: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    marginTop: 10,
  },
  supportSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 20,
  },
});
