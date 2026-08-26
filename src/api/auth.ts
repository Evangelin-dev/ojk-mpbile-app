import axios from 'axios';

// Base URL from .env — should be like http://10.0.2.2:5000
// Strip any trailing /api or / to prevent doubling
const rawBase = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:5000';
const API_BASE_URL = rawBase.replace(/\/api\/?$/, '').replace(/\/$/, '');

/**
 * Send OTP for login/registration
 * Endpoint: POST /api/auth/send-otp
 */
export const sendRegisterOtp = async (phone: string, role: string) => {
  const url = `${API_BASE_URL}/api/auth/send-otp`;
  console.log('[API] POST', url);
  const response = await axios.post(url, { phone, role }, {
    headers: { 'Content-Type': 'application/json' },
  });
  return response.data;
};

/**
 * Verify OTP for login/registration
 * Endpoint: POST /api/auth/verify-otp
 */
export const verifyRegisterOtp = async (phone: string, otp: string, role: string) => {
  const url = `${API_BASE_URL}/api/auth/verify-otp`;
  console.log('[API] POST', url);
  const response = await axios.post(url, { phone, otp, role }, {
    headers: { 'Content-Type': 'application/json' },
  });
  return response.data;
};

/**
 * Create Employer Profile
 * Endpoint: POST /api/employee/profile
 * Requires multipart/form-data
 */
export const createEmployerProfile = async (formData: FormData, token: string) => {
  const url = `${API_BASE_URL}/api/employee/profile`;
  console.log('[API] POST', url);
  const response = await axios.post(url, formData, {
    headers: { 
      'Content-Type': 'multipart/form-data',
      'Authorization': `Bearer ${token}`
    },
  });
  return response.data;
};

/**
 * Create Candidate Profile
 * Endpoint: POST /api/candidate/profile
 * Requires multipart/form-data
 */
export const createCandidateProfile = async (formData: FormData, token: string) => {
  const url = `${API_BASE_URL}/api/candidate/profile`;
  console.log('[API] POST', url);
  const response = await axios.post(url, formData, {
    headers: { 
      'Content-Type': 'multipart/form-data',
      'Authorization': `Bearer ${token}`
    },
  });
  return response.data;
};

