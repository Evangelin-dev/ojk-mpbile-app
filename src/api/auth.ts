import axios from 'axios';

// Base URL from .env — should be like http://10.0.2.2:5000
// Strip any trailing /api or / to prevent doubling
const rawBase = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:5000';
const API_BASE_URL = rawBase.replace(/\/api\/?$/, '').replace(/\/$/, '');

/**
 * Send OTP for login/registration
 */
export const sendRegisterOtp = async (phone: string, role: string) => {
  const url = `${API_BASE_URL}/api/auth/send-otp`;
  const response = await axios.post(url, { phone, role }, {
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
  });
  return response.data;
};

/**
 * Verify OTP for login/registration
 */
export const verifyRegisterOtp = async (phone: string, otp: string, role: string) => {
  const url = `${API_BASE_URL}/api/auth/verify-otp`;
  const response = await axios.post(url, { phone, otp, role }, {
    timeout: 10000,
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
    timeout: 10000,
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
    timeout: 10000,
    headers: {
      'Content-Type': 'multipart/form-data',
      'Authorization': `Bearer ${token}`
    },
  });
  return response.data;
};


/**
 * Blogs
 */
export const fetchBlogs = async () => {
  const url = `${API_BASE_URL}/api/blogs`;
  const response = await axios.get(url, { timeout: 10000 });
  return response.data;
};

export const fetchBlogById = async (id: number | string) => {
  const url = `${API_BASE_URL}/api/blogs/${id}`;
  const response = await axios.get(url, { timeout: 10000 });
  return response.data;
};

/**
 * Jobs
 */
export const fetchJobs = async (params: any = {}) => {
  const url = `${API_BASE_URL}/api/public/jobs`;
  const response = await axios.get(url, { params, timeout: 10000 });
  return response.data;
};

export const fetchJobById = async (id: number | string) => {
  const url = `${API_BASE_URL}/api/public/jobs/${id}`;
  const response = await axios.get(url, { timeout: 10000 });
  return response.data;
};

export const fetchSimilarJobs = async (id: number | string) => {
  const url = `${API_BASE_URL}/api/public/jobs/${id}/similar`;
  const response = await axios.get(url, { timeout: 10000 });
  return response.data;
};

export const applyForJob = async (jobId: number | string, formData: FormData, token: string) => {
  const url = `${API_BASE_URL}/api/candidate/apply/${jobId}`;
  const response = await axios.post(url, formData, {
    timeout: 10000,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Contact Us
 */
export const sendContactMessage = async (formData: any) => {
  const url = `${API_BASE_URL}/api/contact`;
  const response = await axios.post(url, formData, { timeout: 10000 });
  return response.data;
};

export const sendSupportTicket = async (formData: any, token: string) => {
  const url = `${API_BASE_URL}/api/support`;
  const response = await axios.post(url, formData, {
    timeout: 10000,
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.data;
};

/**
 * Testimonials
 */
export const fetchTestimonials = async () => {
  const url = `${API_BASE_URL}/api/testimonials`;
  const response = await axios.get(url, { timeout: 10000 });
  return response.data;
};

export const submitTestimonial = async (content: string, rating: number, token: string) => {
  const url = `${API_BASE_URL}/api/testimonials`;
  const response = await axios.post(url, { content, rating }, {
    timeout: 10000,
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.data;
};
