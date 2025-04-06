import { create } from 'zustand';
import { formatDistanceToNow } from 'date-fns';

// Model file types supported
export type ModelFormat = 'pt' | 'h5' | 'onnx' | 'pb' | 'tflite' | 'other';

// Benchmark metrics
export interface BenchmarkMetrics {
  accuracy: number;
  inferenceTime: number; // in milliseconds
  memoryUsage: number; // in MB
  parameters: number; // in millions
  flops: number; // floating point operations per second in billions
}

// Model data
export interface ModelData {
  id: string;
  name: string;
  fileType: ModelFormat;
  size: number; // in bytes
  uploadedAt: Date;
  metrics: BenchmarkMetrics | null;
  status: 'uploading' | 'uploaded' | 'benchmarking' | 'completed' | 'failed';
  error?: string;
}

// Store interface
interface BenchmarkingStore {
  models: ModelData[];
  selectedModelIds: string[];

  // Actions
  addModel: (model: Omit<ModelData, 'id' | 'uploadedAt' | 'metrics' | 'status'>) => string;
  updateModelStatus: (id: string, status: ModelData['status'], error?: string) => void;
  setModelMetrics: (id: string, metrics: BenchmarkMetrics) => void;
  removeModel: (id: string) => void;
  toggleModelSelection: (id: string) => void;
  clearSelectedModels: () => void;
  selectAllModels: () => void;

  // Computed properties
  getSelectedModels: () => ModelData[];
  getFormattedUploadTime: (id: string) => string;
}

// Helper to generate unique IDs
const generateId = () => Math.random().toString(36).substring(2, 9);

// Create the store
export const useBenchmarkStore = create<BenchmarkingStore>((set, get) => ({
  models: [],
  selectedModelIds: [],

  // Add a new model
  addModel: (modelData) => {
    const id = generateId();
    set((state) => ({
      models: [
        ...state.models,
        {
          ...modelData,
          id,
          uploadedAt: new Date(),
          metrics: null,
          status: 'uploading',
        },
      ],
    }));
    return id;
  },

  // Update a model's status
  updateModelStatus: (id, status, error) => {
    set((state) => ({
      models: state.models.map((model) =>
        model.id === id
          ? { ...model, status, ...(error ? { error } : {}) }
          : model
      ),
    }));
  },

  // Set benchmark metrics for a model
  setModelMetrics: (id, metrics) => {
    set((state) => ({
      models: state.models.map((model) =>
        model.id === id
          ? { ...model, metrics, status: 'completed' }
          : model
      ),
    }));
  },

  // Remove a model
  removeModel: (id) => {
    set((state) => ({
      models: state.models.filter((model) => model.id !== id),
      selectedModelIds: state.selectedModelIds.filter((modelId) => modelId !== id),
    }));
  },

  // Toggle model selection
  toggleModelSelection: (id) => {
    set((state) => ({
      selectedModelIds: state.selectedModelIds.includes(id)
        ? state.selectedModelIds.filter((modelId) => modelId !== id)
        : [...state.selectedModelIds, id],
    }));
  },

  // Clear all selected models
  clearSelectedModels: () => {
    set({ selectedModelIds: [] });
  },

  // Select all models
  selectAllModels: () => {
    set((state) => ({
      selectedModelIds: state.models.map((model) => model.id),
    }));
  },

  // Get selected models
  getSelectedModels: () => {
    const { models, selectedModelIds } = get();
    return models.filter((model) => selectedModelIds.includes(model.id));
  },

  // Get formatted upload time
  getFormattedUploadTime: (id) => {
    const model = get().models.find((m) => m.id === id);
    if (!model) return '';
    return formatDistanceToNow(model.uploadedAt, { addSuffix: true });
  },
}));
