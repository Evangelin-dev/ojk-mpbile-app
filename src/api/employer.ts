import axios from 'axios';

// Fallback to local machine for Android Emulator
const API_BASE_URL = 'http://10.0.2.2:5000';

/**
 * Check employer credits
 */
export const fetchCredits = async (token: string) => {
  const url = `${API_BASE_URL}/api/employee/credits`;
  const response = await axios.get(url, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return response.data;
};

/**
 * Fetch wallet usage data
 */
export const fetchWalletUsage = async (token: string) => {
  const url = `${API_BASE_URL}/api/employee/credits-usage`;
  const response = await axios.get(url, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return response.data;
};

/**
 * Fetch employer profile
 */
export const fetchEmployerProfile = async (token: string) => {
  const url = `${API_BASE_URL}/api/employee/profile`;
  const response = await axios.get(url, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return response.data;
};

/**
 * Update employer profile
 */
export const updateEmployerProfile = async (formData: any, token: string) => {
  const url = `${API_BASE_URL}/api/employee/profile`;
  const isFormData = formData instanceof FormData;
  const response = await axios.put(url, formData, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': isFormData ? 'multipart/form-data' : 'application/json'
    },
  });
  return response.data;
};

/**
 * Fetch employer dashboard stats
 */
export const fetchDashboardStats = async (token: string) => {
  const url = `${API_BASE_URL}/api/employee/dashboard`;
  const response = await axios.get(url, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return response.data;
};

/**
 * Fetch job applications for employer's jobs
 */
export const fetchJobApplications = async (token: string) => {
  const url = `${API_BASE_URL}/api/employee/jobs/applications`;
  const response = await axios.get(url, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return response.data;
};

/**
 * Publish a new job
 */
export const publishJob = async (jobData: any, token: string) => {
  const url = `${API_BASE_URL}/api/employee/jobs`;
  const response = await axios.post(url, jobData, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
  });
  return response.data;
};
