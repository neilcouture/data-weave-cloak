import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  // Theme
  isDarkMode: boolean;
  toggleTheme: () => void;

  // Global Project State
  currentProjectId: string;
  setCurrentProjectId: (projectId: string) => void;

  // Navigation
  activeTab: number;
  setActiveTab: (tab: number) => void;

  // Federation State
  federationStatus: 'idle' | 'creating' | 'joining' | 'active' | 'error';
  setFederationStatus: (status: AppState['federationStatus']) => void;
  
  // Sync Status
  isSyncing: boolean;
  setIsSyncing: (syncing: boolean) => void;
  syncStats: Array<{
    timestamp: string;
    status: string;
    mergedCount: number;
  }>;
  addSyncStats: (stats: AppState['syncStats'][0]) => void;
  clearSyncStats: () => void;

  // Upload History
  uploadHistory: Array<{
    id: string;
    timestamp: string;
    fileName: string;
    status: 'success' | 'error' | 'pending';
    rowCount: number;
  }>;
  addUpload: (upload: Omit<AppState['uploadHistory'][0], 'id' | 'timestamp'>) => void;
  
  // Project Properties
  projectProperties: {
    processingType: 'cpu' | 'gpu';
    persistData: boolean;
    enableHistogram: boolean;
    targetList: string[];
    conditionList: string[];
  };
  setProjectProperties: (properties: Partial<AppState['projectProperties']>) => void;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Theme
      isDarkMode: false,
      toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })),

      // Global Project State
      currentProjectId: '',
      setCurrentProjectId: (projectId) => set({ currentProjectId: projectId }),

      // Navigation
      activeTab: 0,
      setActiveTab: (tab) => set({ activeTab: tab }),

      // Federation State
      federationStatus: 'idle',
      setFederationStatus: (status) => set({ federationStatus: status }),
      
      // Sync Status
      isSyncing: false,
      setIsSyncing: (syncing) => set({ isSyncing: syncing }),
      syncStats: [],
      addSyncStats: (stats) => 
        set((state) => ({ 
          syncStats: [...state.syncStats, stats].slice(-50) // Keep last 50 entries
        })),
      clearSyncStats: () => set({ syncStats: [] }),

      // Upload History
      uploadHistory: [],
      addUpload: (upload) =>
        set((state) => ({
          uploadHistory: [
            {
              ...upload,
              id: Math.random().toString(36).substr(2, 9),
              timestamp: new Date().toISOString(),
            },
            ...state.uploadHistory,
          ].slice(0, 100), // Keep last 100 uploads
        })),

      // Project Properties
      projectProperties: {
        processingType: 'cpu',
        persistData: true,
        enableHistogram: false,
        targetList: ['age', 'bmi'],
        conditionList: ['smoker', 'on_statins'],
      },
      setProjectProperties: (properties) =>
        set((state) => ({
          projectProperties: { ...state.projectProperties, ...properties },
        })),

      // Search
      searchQuery: '',
      setSearchQuery: (query) => set({ searchQuery: query }),
    }),
    {
      name: 'healthcare-dcr-app',
      partialize: (state) => ({
        isDarkMode: state.isDarkMode,
        currentProjectId: state.currentProjectId,
        projectProperties: state.projectProperties,
        uploadHistory: state.uploadHistory,
      }),
    }
  )
);