const API_BASE_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8080';

export const api = {
  getToken: () => localStorage.getItem('token'),
  setToken: (token) => localStorage.setItem('token', token),
  clearAuth: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  getUser: () => {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  },
  setUser: (user) => localStorage.setItem('user', JSON.stringify(user)),

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = this.getToken();

    const headers = {
      ...(options.headers || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (response.status === 401) {
        // Token expired or invalid
        console.warn('Unauthorized request to', endpoint);
      }

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error((data && data.error) || (data && data.message) || `HTTP error ${response.status}`);
      }

      return data;
    } catch (err) {
      console.error(`API Error on [${options.method || 'GET'} ${endpoint}]:`, err);
      throw err;
    }
  },

  // Auth endpoints
  async register(fullName, email, password, role) {
    return this.request('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({ fullName, email, password, role }),
    });
  },

  async login(email, password) {
    const data = await this.request('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data && data.token) {
      this.setToken(data.token);
      this.setUser(data);
    }
    return data;
  },

  async getMe() {
    return this.request('/api/v1/auth/me');
  },

  // Job endpoints
  async getJobs() {
    return this.request('/api/v1/jobs');
  },

  async getJobById(id) {
    return this.request(`/api/v1/jobs/${id}`);
  },

  async createJob(jobData) {
    return this.request('/api/v1/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData),
    });
  },

  // Resume endpoints
  async uploadResume(file) {
    const formData = new FormData();
    formData.append('file', file);
    return this.request('/api/v1/resumes/upload', {
      method: 'POST',
      body: formData,
    });
  },

  async getResumeStatus(resumeId) {
    return this.request(`/api/v1/resumes/${resumeId}/status`);
  },

  async getMyProfile() {
    return this.request('/api/v1/resumes/my-profile');
  },

  // Matching endpoints
  async rankCandidates(jobId) {
    return this.request(`/api/v1/matches/rank/${jobId}`, {
      method: 'POST',
    });
  },

  async getRankings(jobId) {
    return this.request(`/api/v1/matches/rankings/${jobId}`);
  },

  async getRecommendations() {
    return this.request('/api/v1/matches/recommendations');
  },
};
