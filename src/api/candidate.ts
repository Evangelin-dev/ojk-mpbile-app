import axios from 'axios';

// Fallback to local machine for Android Emulator
const rawBase = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:5000';
const API_BASE_URL = rawBase.replace(/\/api\/?$/, '').replace(/\/$/, '');

/**
 * Fetch candidate's applications
 */
export const getMyApplications = async (token: string) => {
  const url = `${API_BASE_URL}/api/candidate/my-applications`;
  const response = await axios.get(url, {
    timeout: 10000,
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return response.data;
};

/**
 * Fetch candidate profile
 */
export const fetchCandidateProfile = async (token: string) => {
  const url = `${API_BASE_URL}/api/candidate/profile`;
  const response = await axios.get(url, {
    timeout: 10000,
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return response.data;
};

/**
 * Update candidate profile
 */
export const updateCandidateProfile = async (formData: any, token: string) => {
  const url = `${API_BASE_URL}/api/candidate/profile`;
  const response = await axios.put(url, formData, {
    timeout: 10000,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Fetch candidate dashboard stats
 */
export const fetchCandidateDashboard = async (token: string) => {
  const url = `${API_BASE_URL}/api/candidate/dashboard`;
  const response = await axios.get(url, {
    timeout: 10000,
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return response.data;
};

/**
 * Sign S3 URL for CV viewing
 */
export const signUrl = async (key: string, token: string) => {
  const url = `${API_BASE_URL}/api/candidate/sign-url?key=${encodeURIComponent(key)}`;
  const response = await axios.get(url, {
    timeout: 10000,
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return response.data;
};
