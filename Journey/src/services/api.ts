import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../stores/authStore';
import { API_URL } from '../config/env';
import { showToast } from '../components/Toast';

// Use validated API URL from environment config
const API_BASE_URL = API_URL;

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

// Request interceptor - add auth token and check expiry
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const store = useAuthStore.getState();
    const token = store.accessToken;

    // Check if token is expired before making request
    if (token && store.isTokenExpired()) {
      // Token expired, try to refresh
      const refreshToken = store.refreshToken;
      if (refreshToken && !isRefreshing) {
        isRefreshing = true;
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken, expiresIn } = response.data;
          store.updateTokens(accessToken, newRefreshToken, expiresIn);
          config.headers.Authorization = `Bearer ${accessToken}`;
          onTokenRefreshed(accessToken);
        } catch {
          store.logout('forced');
          return Promise.reject(new Error('Session expired. Please login again.'));
        } finally {
          isRefreshing = false;
        }
      } else if (isRefreshing) {
        // Wait for token refresh to complete
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((newToken: string) => {
            config.headers.Authorization = `Bearer ${newToken}`;
            resolve(config);
          });
          setTimeout(() => reject(new Error('Token refresh timeout')), 10000);
        });
      }
    } else if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401 errors and show toast notifications
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle network errors
    if (!error.response) {
      showToast.error(
        'Unable to connect to server',
        'Please check your internet connection and try again.'
      );
      return Promise.reject(error);
    }

    // Handle other HTTP errors with toast notifications
    if (error.response?.status === 403) {
      showToast.error('You do not have permission to perform this action.');
    } else if (error.response?.status === 429) {
      showToast.warning('Too many requests. Please wait a moment and try again.');
    } else if (error.response?.status && error.response.status >= 500) {
      showToast.error('Server error. Please try again later.');
    }

    // If 401 and not already retried, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const store = useAuthStore.getState();
      const refreshToken = store.refreshToken;

      if (refreshToken && !isRefreshing) {
        isRefreshing = true;
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken, expiresIn } = response.data;
          store.updateTokens(accessToken, newRefreshToken, expiresIn);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          onTokenRefreshed(accessToken);
          return api(originalRequest);
        } catch {
          // Refresh failed, logout user
          store.logout('forced');
          showToast.warning('Your session has expired. Please log in again.');
          return Promise.reject(new Error('Session expired. Please login again.'));
        } finally {
          isRefreshing = false;
        }
      } else if (isRefreshing) {
        // Wait for token refresh to complete
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((newToken: string) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(api(originalRequest));
          });
          // Timeout after 10 seconds
          setTimeout(() => reject(new Error('Token refresh timeout')), 10000);
        });
      }
    }

    return Promise.reject(error);
  }
);

// ============================================================================
// AUTH API
// ============================================================================

export const authAPI = {
  staffLogin: async (email: string, password: string) => {
    const response = await api.post('/auth/staff/login', { email, password });
    return response.data;
  },

  staffLogin2fa: async (pendingToken: string, code: string) => {
    const response = await api.post('/auth/staff/login/2fa', { pendingToken, code });
    return response.data;
  },

  logout: async (refreshToken?: string) => {
    const response = await api.post('/auth/logout', { refreshToken: refreshToken ?? '' });
    return response.data;
  },

  refreshToken: async (refreshToken: string) => {
    const response = await api.post('/auth/refresh-token', { refreshToken });
    return response.data;
  },

  validateKey: async (registrationKey: string) => {
    const response = await api.post('/auth/validate-key', { registrationKey });
    return response.data;
  },
};

// ============================================================================
// PATIENTS API
// ============================================================================

export interface CreatePatientData {
  facilityId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phone?: string;
  email?: string;
  admissionDate?: string;
  sobrietyDate?: string;
  assignedCounselorId?: string;
  substancesOfChoice?: string[];
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
}

export interface PatientFilters {
  status?: string;
  counselorId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const patientsAPI = {
  getAll: async (filters: PatientFilters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.counselorId) params.append('counselorId', filters.counselorId);
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', String(filters.page));
    if (filters.limit) params.append('limit', String(filters.limit));

    const response = await api.get(`/patients?${params.toString()}`);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/patients/${id}`);
    return response.data;
  },

  getDashboard: async (id: string) => {
    const response = await api.get(`/patients/${id}/dashboard`);
    return response.data;
  },

  create: async (data: CreatePatientData) => {
    const response = await api.post('/patients', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreatePatientData>) => {
    const response = await api.put(`/patients/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/patients/${id}`);
    return response.data;
  },

  regenerateKey: async (id: string) => {
    const response = await api.post(`/patients/${id}/regenerate-key`);
    return response.data;
  },
};

// ============================================================================
// MESSAGES API
// ============================================================================

export interface SendMessageData {
  recipient_id: string;
  subject?: string;
  body: string;
  message_type?: string;
  priority?: string;
}

export const messagesAPI = {
  getAll: async (page: number = 1, limit: number = 50) => {
    const response = await api.get(`/messages?page=${page}&limit=${limit}`);
    return response.data;
  },

  getConversation: async (patientId: string) => {
    const response = await api.get(`/messages/conversations/${patientId}`);
    return response.data;
  },

  send: async (data: SendMessageData) => {
    // Map to backend expected format
    const backendData = {
      recipientId: data.recipient_id,
      content: data.body,
      messageType: data.message_type?.toUpperCase(),
      priority: data.priority?.toUpperCase(),
    };
    const response = await api.post('/messages', backendData);
    return response.data;
  },

  markAsRead: async (messageId: string) => {
    const response = await api.put(`/messages/${messageId}/read`);
    return response.data;
  },
};

// ============================================================================
// FACILITY API
// ============================================================================

export const facilityAPI = {
  getDashboard: async (_facilityId?: string) => {
    // Dashboard stats are now at /dashboard/stats (facility context from auth)
    const response = await api.get(`/dashboard/stats`);
    return response.data;
  },

  getStaff: async (_facilityId?: string) => {
    // Staff list now at /admin/staff (facility context from auth)
    const response = await api.get(`/admin/staff`);
    return response.data;
  },

  getAlerts: async () => {
    const response = await api.get(`/dashboard/alerts`);
    return response.data;
  },

  getAppointments: async () => {
    const response = await api.get(`/dashboard/appointments`);
    return response.data;
  },

  getRecentMessages: async () => {
    const response = await api.get(`/dashboard/recent-messages`);
    return response.data;
  },
};

// ============================================================================
// SUPER ADMIN API
// ============================================================================

export interface CreateFacilityData {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  license_number?: string;
}

export interface CreateAdminData {
  facility_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  temp_password: string;
}

export const superAdminAPI = {
  // Stats
  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  // Facilities
  getFacilities: async (filters: { status?: string } = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    const response = await api.get(`/admin/facilities?${params.toString()}`);
    return response.data;
  },

  getFacility: async (id: string) => {
    const response = await api.get(`/admin/facilities/${id}`);
    return response.data;
  },

  createFacility: async (data: CreateFacilityData) => {
    const response = await api.post('/admin/facilities', data);
    return response.data;
  },

  updateFacility: async (id: string, data: Partial<CreateFacilityData>) => {
    const response = await api.put(`/admin/facilities/${id}`, data);
    return response.data;
  },

  suspendFacility: async (id: string) => {
    const response = await api.post(`/admin/facilities/${id}/suspend`);
    return response.data;
  },

  // Administrators
  getAdministrators: async () => {
    const response = await api.get('/admin/administrators');
    return response.data;
  },

  createAdministrator: async (data: CreateAdminData) => {
    const response = await api.post('/admin/administrators', data);
    return response.data;
  },

  resetAdminPassword: async (id: string) => {
    const response = await api.post(`/admin/administrators/${id}/reset-password`);
    return response.data;
  },

  // Clinicians (all staff across facilities)
  getAllClinicians: async (filters: { role?: string; facility_id?: string } = {}) => {
    const params = new URLSearchParams();
    if (filters.role) params.append('role', filters.role);
    if (filters.facility_id) params.append('facility_id', filters.facility_id);
    const response = await api.get(`/admin/clinicians?${params.toString()}`);
    return response.data;
  },

  // Patients (all patients across facilities)
  getAllPatients: async (filters: { status?: string; facility_id?: string } = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.facility_id) params.append('facility_id', filters.facility_id);
    const response = await api.get(`/admin/patients?${params.toString()}`);
    return response.data;
  },

  // Analytics
  getAnalytics: async (timeframe: string = '30d') => {
    const response = await api.get(`/admin/analytics?timeframe=${timeframe}`);
    return response.data;
  },

  // Activity Feed
  getRecentActivity: async (limit: number = 20) => {
    const response = await api.get(`/admin/activity?limit=${limit}`);
    return response.data;
  },
};

// ============================================================================
// HEALTH CHECK
// ============================================================================

export const healthCheck = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    return { status: 'error', message: 'Cannot connect to server' };
  }
};

export default api;
