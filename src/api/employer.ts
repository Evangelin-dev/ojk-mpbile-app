import axios from 'axios';

// Fallback to local machine for Android Emulator
const rawBase = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:5000';
const API_BASE_URL = rawBase.replace(/\/api\/?$/, '').replace(/\/$/, '');

/**
 * Check employer credits
 */
export const fetchCredits = async (token: string) => {
  const url = `${API_BASE_URL}/api/employee/credits`;
  const response = await axios.get(url, {
    timeout: 10000,
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
    timeout: 10000,
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
    timeout: 10000,
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
    timeout: 10000,
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
    timeout: 10000,
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
    timeout: 10000,
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
    timeout: 10000,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
  });
  return response.data;
};

/**
 * Fetch current active plan for employer
 */
export const fetchCurrentPlan = async (token: string) => {
  const url = `${API_BASE_URL}/api/employee/current-plan`;
  const response = await axios.get(url, {
    timeout: 10000,
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return response.data;
};

/**
 * Create a Razorpay order for a plan
 */
export const createPlanOrder = async (planType: string, token: string) => {
  const url = `${API_BASE_URL}/api/payments/plan/create-order`;
  const response = await axios.post(url, { planType }, {
    timeout: 10000,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
  });
  return response.data;
};

/**
 * Verify Razorpay payment signature
 */
export const verifyPlanPayment = async (verificationPayload: any, token: string) => {
  const url = `${API_BASE_URL}/api/payments/plan/verify-payment`;
  const response = await axios.post(url, verificationPayload, {
    timeout: 10000,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
  });
  return response.data;
};

/**
 * Create a support ticket
 */
export const createSupportTicket = async (ticketData: { subject: string; message: string }, token: string) => {
  const url = `${API_BASE_URL}/api/support`;
  const response = await axios.post(url, ticketData, {
    timeout: 10000,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
  });
  return response.data;
};

/**
 * Search candidates
 */
export const searchCandidates = async (searchCriteria: any, token: string) => {
  const url = `${API_BASE_URL}/api/employee/search`;
  const response = await axios.post(url, searchCriteria, {
    timeout: 10000,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
  });
  return response.data;
};

/**
 * Fetch employer's jobs
 */
export const fetchEmployerJobs = async (token: string) => {
  const url = `${API_BASE_URL}/api/employee/jobs`;
  const response = await axios.get(url, {
    timeout: 10000,
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return response.data;
};

/**
 * Delete a job
 */
export const deleteJob = async (jobId: number, token: string) => {
  const url = `${API_BASE_URL}/api/employee/job/${jobId}/`;
  const response = await axios.delete(url, {
    timeout: 10000,
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return response.data;
};

/**
 * Update a job
 */
export const updateJob = async (jobId: number, jobData: any, token: string) => {
  const url = `${API_BASE_URL}/api/employee/jobs/${jobId}/`;
  const response = await axios.put(url, jobData, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
  });
  return response.data;
};

/**
 * Add a candidate to shortlist
 */
export const addToShortlist = async (candidateId: number, token: string) => {
  const url = `${API_BASE_URL}/api/shortlist/candidates/${candidateId}`;
  const response = await axios.post(url, {}, {
    timeout: 10000,
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return response.data;
};

/**
 * Remove a candidate from shortlist
 */
export const removeFromShortlist = async (candidateId: number, token: string) => {
  const url = `${API_BASE_URL}/api/shortlist/candidates/${candidateId}`;
  const response = await axios.delete(url, {
    timeout: 10000,
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return response.data;
};

/**
 * Fetch shortlisted candidates
 */
export const fetchShortlistedCandidates = async (token: string) => {
  const url = `${API_BASE_URL}/api/shortlist/candidates`;
  const response = await axios.get(url, {
    timeout: 10000,
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return response.data;
};

/**
 * Fetch billing history for employer
 */
export const fetchBillingHistory = async (params: { page: number; limit: number; status?: string }, token: string) => {
  const url = `${API_BASE_URL}/api/payments/employer/billing`;
  const response = await axios.get(url, {
    params,
    timeout: 10000,
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return response.data;
};
