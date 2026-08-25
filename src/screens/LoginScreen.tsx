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
import { useNavigation, useRoute } from '@react-navigation/native';
import { sendRegisterOtp, verifyRegisterOtp } from '../api/auth';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const route = useRoute<any>();
  const role: 'CANDIDATE' | 'EMPLOYER' = route.params?.role || 'CANDIDATE';
  
  const isCandidate = role === 'CANDIDATE';
  const themeColor = isCandidate ? '#39b54a' : '#fbb040';
  const titleText = isCandidate ? 'Candidate Login' : 'Employer Login';
  const subtitleText = isCandidate ? 'Find jobs near your location' : 'Hire the best talent';

  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [localError, setLocalError] = useState('');
  const [debugCode, setDebugCode] = useState<string | number | null>(null);
  
  const navigation = useNavigation<any>();
  const { login } = useAuth();

  useEffect(() => {
    if (!otpSent) return;
    let timer: ReturnType<typeof setInterval>;
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
    setDebugCode(null);

    try {
      const phone = `+91${mobile.trim()}`;
      console.log(`[OTP] Sending OTP to: ${phone} as ${role}`);
      const result = await sendRegisterOtp(phone, role);
      console.log('[OTP] Response:', JSON.stringify(result));
      
      // Check for debug_code in response
      if (result?.debug_code) {
        setDebugCode(result.debug_code);
      }
      
      setOtpSent(true);
      setResendTimer(100);
    } catch (err: any) {
      console.log('[OTP] Error:', JSON.stringify(err?.response?.data || err?.message || err));
      
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
      const payload = await verifyRegisterOtp(phone, otp, role);
      console.log('[OTP] Verify response:', JSON.stringify(payload));

      // Role mismatch check
      if (isCandidate && payload?.user?.role === 'EMPLOYER') {
        setLocalError('This portal is for Job Seekers. Please use the Employer login.');
        setOtpSent(false);
        setOtp('');
        return;
      }
      if (!isCandidate && payload?.user?.role === 'CANDIDATE') {
        setLocalError('This portal is for Employers. Please use the Candidate login.');
        setOtpSent(false);
        setOtp('');
        return;
      }

      // Check if it's a new Employer that needs to complete registration
      const isNewUser = payload.isNewUser || payload.hasProfile === false || payload?.user?.hasProfile === false;
      
      if (!isCandidate && isNewUser) {
        console.log('[OTP] New Employer detected. Routing to registration...');
        navigation.navigate('EmployerRegistration', { 
          token: payload.token, 
          phone, 
          user: payload.user 
        });
        return;
      }

      if (payload.token && payload.user) {
        await login(payload.token, payload.user);
      }

      navigation.goBack();
      
    } catch (err: any) {
      let errorMsg = 'Verification failed';
      if (err?.response?.data) {
        const data = err.response.data;
        if (typeof data === 'string') errorMsg = data;
        else if (data.message) errorMsg = data.message;
        else if (data.error) errorMsg = data.error;
      } else if (err?.message) {
        errorMsg = err.message;
      }
      setLocalError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setOtpSent(false);
    setOtp('');
    setDebugCode(null);
    setLocalError('');
    setResendTimer(0);
  };

  const dynamicStyles = {
    card: { borderColor: themeColor + '4D' },
    title: { color: themeColor },
    label: { color: themeColor },
    inputBorder: { borderColor: themeColor + '4D', backgroundColor: themeColor + '1A' },
    button: { backgroundColor: themeColor },
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={[styles.card, dynamicStyles.card]}>
        {/* Close button */}
        <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>

        <Text style={[styles.title, dynamicStyles.title]}>{titleText}</Text>
        <Text style={styles.subtitle}>{subtitleText}</Text>

        {!otpSent ? (
          <>
            <Text style={[styles.label, dynamicStyles.label]}>Mobile Number</Text>
            <View style={[styles.inputContainer, dynamicStyles.inputBorder]}>
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
                placeholderTextColor="#9ca3af"
                maxLength={10}
                autoFocus
              />
            </View>

            {localError ? <Text style={styles.errorText}>{localError}</Text> : null}

            <TouchableOpacity 
              style={[styles.button, dynamicStyles.button, (isLoading || mobile.length !== 10) && styles.buttonDisabled]} 
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
            <Text style={[styles.label, dynamicStyles.label]}>Enter OTP</Text>
            <TextInput
              style={[styles.otpInput, dynamicStyles.inputBorder]}
              value={otp}
              onChangeText={(text) => {
                setOtp(text.replace(/[^0-9]/g, '').slice(0, 6));
                setLocalError('');
              }}
              keyboardType="number-pad"
              placeholder="000000"
              placeholderTextColor="#9ca3af"
              maxLength={6}
              textAlign="center"
              autoFocus
            />

            {debugCode ? (
              <Text style={styles.debugText}>
                Debug OTP: <Text style={[styles.debugCode, { color: themeColor }]}>{String(debugCode)}</Text>
              </Text>
            ) : null}
            
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
              style={[styles.button, dynamicStyles.button, (isLoading || otp.length !== 6) && styles.buttonDisabled]} 
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
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
    borderWidth: 1,
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
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
    textAlign: 'center',
    marginBottom: 4,
    marginTop: 8,
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
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
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
    borderWidth: 2,
    borderRadius: 8,
    height: 56,
    fontSize: 24,
    letterSpacing: 8,
    color: '#1f2937',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  debugText: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 12,
  },
  debugCode: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  button: {
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
  buttonDisabled: {
    opacity: 0.6,
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
