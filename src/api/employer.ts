import axios from 'axios';

const rawBase = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:5000';
const API_BASE_URL = rawBase.replace(/\/api\/?$/, '').replace(/\/$/, '');

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
