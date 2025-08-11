import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:3101/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging and auth
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, config.data);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for logging and error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', error);
    return Promise.reject(error);
  }
);

// Federation API endpoints
export const federationApi = {
  // Create Federation
  createFederation: async (data: {
    pid: string;
    natsHosts: string;
    syncSchedule: string;
    processingType: 'cpu' | 'gpu';
    persistData: boolean;
    enableHistogram: boolean;
    targetList: string[];
    conditionList: string[];
  }) => {
    return api.post('/fed/create', data);
  },

  // Generate Invite
  generateInvite: async (pid: string, password: string) => {
    return api.post(`/fed/${pid}/invite`, { password });
  },

  // Join Federation
  joinFederation: async (data: {
    pid: string;
    inviteJson: string;
    processingType: 'cpu' | 'gpu';
    persistData: boolean;
    enableHistogram: boolean;
    targetList: string[];
    conditionList: string[];
  }) => {
    return api.post('/fed/join', data);
  },

  // Sync Control
  startPulsing: async (pid: string) => {
    return api.get(`/fed/${pid}/startPulsing`);
  },

  stopPulsing: async (pid: string) => {
    return api.get(`/fed/${pid}/stopPulsing`);
  },

  // Sync Stats
  getSyncStats: async (pid: string) => {
    return api.get(`/fed/${pid}/syncStats`);
  },
};

// Project API endpoints
export const projectApi = {
  // Push Data
  pushData: async (pid: string, csvData: string) => {
    return api.post(`/projects/${pid}/learn`, csvData, {
      headers: {
        'Content-Type': 'text/csv',
      },
    });
  },

  // Get Project Info
  getProjectInfo: async (pid: string) => {
    return api.get(`/projects/${pid}`);
  },

  // Exploration APIs
  explore: async (pid: string, metric: string, body: any) => {
    return api.post(`/projects/${pid}/explore?metric=${metric}`, body);
  },

  // Univariate exploration
  exploreUnivariate: async (pid: string, attributes: string[]) => {
    return api.post(`/projects/${pid}/explore?metric=uni`, {
      inputAttributeNames: attributes,
    });
  },

  // Bivariate exploration
  exploreBivariate: async (pid: string, attributes: string[], cohort?: string) => {
    const body: any = {
      inputAttributeNames: cohort ? [cohort, ...attributes] : attributes,
    };
    
    if (cohort) {
      body.extraParameters = {
        need_bi_conditional: true,
        need_bi_conditional_td: true,
      };
    }

    return api.post(`/projects/${pid}/explore?metric=bi`, body);
  },

  // Predictive modeling
  buildModel: async (pid: string, data: {
    algorithm: string;
    inputs: string[];
    targets: string[];
  }) => {
    return api.post(`/projects/${pid}/build`, data);
  },

  predict: async (pid: string, data: any) => {
    return api.post(`/projects/${pid}/predict`, data);
  },
};

export { api };