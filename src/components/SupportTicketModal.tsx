import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from 'react-native';
import {
  XMarkIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from 'react-native-heroicons/solid';
import { createSupportTicket } from '../api/employer';
import { useAuth } from '../context/AuthContext';

interface SupportTicketModalProps {
  visible: boolean;
  onClose: () => void;
}

const SupportTicketModal: React.FC<SupportTicketModalProps> = ({ visible, onClose }) => {
  const { token } = useAuth();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleClose = () => {
    setSubject('');
    setMessage('');
    setLoading(false);
    setError(null);
    setSuccess(false);
    onClose();
  };

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) {
      setError('Please fill out both fields.');
      return;
    }

    if (!token) {
      setError('Authentication required. Please login.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createSupportTicket({ subject, message }, token);
      setSuccess(true);
    } catch (err: any) {
      console.error('Failed to submit support ticket:', err);
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalContainer}>
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
              >
                <View style={styles.content}>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={handleClose}
                  >
                    <XMarkIcon size={24} color="#b97a13" />
                  </TouchableOpacity>

                  {success ? (
                    <View style={styles.successContainer}>
                      <View style={styles.successIconWrapper}>
                        <CheckCircleIcon size={60} color="#fbb040" />
                      </View>
                      <Text style={styles.title}>Ticket Submitted!</Text>
                      <Text style={styles.successMessage}>
                        We have received your request and will get back to you soon.
                      </Text>
                      <TouchableOpacity
                        style={styles.submitButton}
                        onPress={handleClose}
                      >
                        <Text style={styles.submitButtonText}>Done</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <ScrollView showsVerticalScrollIndicator={false}>
                      <Text style={styles.title}>Create a Support Ticket</Text>

                      <View style={styles.inputGroup}>
                        <Text style={styles.label}>Subject</Text>
                        <TextInput
                          style={styles.input}
                          value={subject}
                          onChangeText={setSubject}
                          placeholder="e.g., Unable to apply for job"
                          placeholderTextColor="#94a3b8"
                        />
                      </View>

                      <View style={styles.inputGroup}>
                        <Text style={styles.label}>Message</Text>
                        <TextInput
                          style={[styles.input, styles.textArea]}
                          value={message}
                          onChangeText={setMessage}
                          placeholder="Please describe your issue in detail..."
                          placeholderTextColor="#94a3b8"
                          multiline
                          numberOfLines={5}
                          textAlignVertical="top"
                        />
                      </View>

                      {error && (
                        <View style={styles.errorContainer}>
                          <ExclamationCircleIcon size={20} color="#ef4444" />
                          <Text style={styles.errorText}>{error}</Text>
                        </View>
                      )}

                      <TouchableOpacity
                        style={[styles.submitButton, loading && styles.disabledButton]}
                        onPress={handleSubmit}
                        disabled={loading}
                      >
                        {loading ? (
                          <ActivityIndicator color="#fff" />
                        ) : (
                          <Text style={styles.submitButtonText}>Submit Ticket</Text>
                        )}
                      </TouchableOpacity>
                    </ScrollView>
                  )}
                </View>
              </KeyboardAvoidingView>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 24,
    overflow: 'hidden',
  },
  keyboardView: {
    width: '100%',
  },
  content: {
    padding: 24,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF7E0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fbb040',
    zIndex: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#253858',
    textAlign: 'center',
    marginBottom: 24,
    marginTop: 10,
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
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1e293b',
    backgroundColor: '#f8fafc',
  },
  textArea: {
    height: 120,
  },
  submitButton: {
    backgroundColor: '#fbb040',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    width: '100%',
    shadowColor: '#fbb040',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  disabledButton: {
    backgroundColor: '#fcd39a',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 14,
    flex: 1,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    width: '100%',
  },
  successIconWrapper: {
    backgroundColor: '#FFF7E0',
    padding: 20,
    borderRadius: 100,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(251, 176, 64, 0.4)',
  },
  successMessage: {
    fontSize: 16,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
});

export default SupportTicketModal;
