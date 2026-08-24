import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { sendRegisterOtp, verifyRegisterOtp } from '../api/auth';

export default function JobseekerLoginScreen() {
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [localError, setLocalError] = useState('');
  
  const navigation = useNavigation();

  useEffect(() => {
    if (!otpSent) return;
    let timer: NodeJS.Timeout;
    if (resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [otpSent, resendTimer]);

  const handleSendOtp = async () => {
    if (mobile.length !== 10) {
      setLocalError('Please enter a valid 10-digit mobile number.');
      return;
    }
    
    setIsLoading(true);
    setLocalError('');

    try {
      const phone = `+91${mobile.trim()}`;
      console.log('[OTP] Sending OTP to:', phone);
      const result = await sendRegisterOtp(phone, 'CANDIDATE');
      console.log('[OTP] Response:', JSON.stringify(result));
      
      setOtpSent(true);
      setResendTimer(100);
    } catch (err: any) {
      console.log('[OTP] Error:', JSON.stringify(err?.response?.data || err?.message || err));
      
      // Extract error message properly from axios error
      let errorMsg = 'Failed to send OTP';
      if (err?.response?.data) {
        const data = err.response.data;
        if (typeof data === 'string') errorMsg = data;
        else if (data.message) errorMsg = data.message;
        else if (data.error) errorMsg = data.error;
        else errorMsg = JSON.stringify(data);
      } else if (err?.message) {
        errorMsg = err.message;
      }
      
      // User exists scenario — still proceed to OTP screen
      if (errorMsg.toLowerCase().includes('exist')) {
        setOtpSent(true);
        setResendTimer(300);
      } else {
        setLocalError(errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setLocalError('Please enter a 6-digit OTP.');
      return;
    }

    setIsLoading(true);
    setLocalError('');

    try {
      const phone = `+91${mobile.trim()}`;
      const payload = await verifyRegisterOtp(phone, otp, 'CANDIDATE');

      if (payload?.user?.role === 'EMPLOYER') {
        setLocalError('This portal is for Job Seekers. Please use the Employer portal to log in.');
        setOtpSent(false);
        setOtp('');
        return;
      }

      if (payload.token) {
        await AsyncStorage.setItem('token', payload.token);
      }
      if (payload.user) {
        await AsyncStorage.setItem('user', JSON.stringify(payload.user));
      }

      // Navigate back to the home/browse jobs screen upon success
      navigation.goBack();
      
    } catch (err: any) {
      setLocalError(String(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setOtpSent(false);
    setOtp('');
    setLocalError('');
    setResendTimer(0);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Candidate Login</Text>
        <Text style={styles.subtitle}>Find jobs near your location</Text>

        {!otpSent ? (
          <>
            <Text style={styles.label}>Mobile Number</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.prefix}>+91</Text>
              <TextInput
                style={styles.input}
                value={mobile}
                onChangeText={(text) => {
                  setMobile(text.replace(/[^0-9]/g, '').slice(0, 10));
                  setLocalError('');
                }}
                keyboardType="number-pad"
                placeholder="10-digit mobile number"
                maxLength={10}
              />
            </View>

            {localError ? <Text style={styles.errorText}>{localError}</Text> : null}

            <TouchableOpacity 
              style={styles.button} 
              onPress={handleSendOtp}
              disabled={isLoading || mobile.length !== 10}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Send OTP</Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.label}>Enter OTP</Text>
            <TextInput
              style={styles.otpInput}
              value={otp}
              onChangeText={(text) => {
                setOtp(text.replace(/[^0-9]/g, '').slice(0, 6));
                setLocalError('');
              }}
              keyboardType="number-pad"
              placeholder="000000"
              maxLength={6}
              textAlign="center"
            />
            
            {localError ? <Text style={styles.errorText}>{localError}</Text> : null}

            <View style={styles.actionRow}>
              <TouchableOpacity onPress={handleBack}>
                <Text style={styles.linkText}>← Change Number</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleSendOtp}
                disabled={resendTimer > 0}
              >
                <Text style={[styles.linkText, resendTimer > 0 && styles.disabledLink]}>
                  {resendTimer > 0 ? `Resend OTP (${resendTimer}s)` : 'Resend OTP'}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.button} 
              onPress={handleVerifyOtp}
              disabled={isLoading || otp.length !== 6}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Verify OTP</Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#39b54a',
    shadowOpacity: 0.15,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(57, 181, 74, 0.3)',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#39b54a',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#39b54a',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(57, 181, 74, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(57, 181, 74, 0.3)',
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  prefix: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '600',
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#1f2937',
  },
  otpInput: {
    backgroundColor: 'rgba(57, 181, 74, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(57, 181, 74, 0.3)',
    borderRadius: 8,
    height: 56,
    fontSize: 24,
    letterSpacing: 8,
    color: '#1f2937',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#39b54a',
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  linkText: {
    color: '#6b7280',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  disabledLink: {
    opacity: 0.5,
    textDecorationLine: 'none',
  },
});
