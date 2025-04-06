import type { BenchmarkMetrics, ModelFormat, ModelData } from './store';
import jsPDF from 'jspdf';
// @ts-ignore
import 'jspdf-autotable';

// Helper to get file extension
export const getFileExtension = (filename: string): ModelFormat => {
  const extension = filename.split('.').pop()?.toLowerCase() as ModelFormat;

  if (['pt', 'h5', 'onnx', 'pb', 'tflite'].includes(extension)) {
    return extension as ModelFormat;
  }

  return 'other';
};

// Convert bytes to readable size
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const units = ['Bytes', 'KB', 'MB', 'GB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${units[i]}`;
};

// Mock function to simulate model benchmarking
// In a real app, this would call an API to perform actual model benchmarking
export const simulateBenchmarking = async (
  fileType: ModelFormat,
  fileSize: number,
): Promise<BenchmarkMetrics> => {
  // Add random delays to simulate processing time
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 3000));

  // Generate mock metrics based on file type and size
  // In a real app, these would be actual benchmark results
  const baseAccuracy = 0.85 + Math.random() * 0.10;
  const baseTiming = 10 + Math.random() * 40; // in ms
  const baseMemory = 50 + (fileSize / (1024 * 1024)) * (Math.random() * 10);
  const baseParameters = Math.max(0.1, Math.random() * 2 + (fileSize / (1024 * 1024)) / 10);
  const baseFlops = Math.random() * 5 + 1;

  // Adjust metrics based on file type (mock variation)
  const typeMultipliers: Record<ModelFormat, number> = {
    pt: 1.1,    // PyTorch
    h5: 0.95,   // Keras
    onnx: 1.05, // ONNX
    pb: 0.9,    // TensorFlow
    tflite: 0.8, // TensorFlow Lite (optimized)
    other: 1.0,
  };

  const multiplier = typeMultipliers[fileType] || 1;

  return {
    accuracy: Math.min(0.999, baseAccuracy * multiplier),
    inferenceTime: baseTiming * multiplier,
    memoryUsage: baseMemory * multiplier,
    parameters: baseParameters * multiplier,
    flops: baseFlops * multiplier,
  };
};

// Function to handle file uploads
export const handleFileUpload = (file: File): {
  name: string;
  fileType: ModelFormat;
  size: number;
} => {
  return {
    name: file.name,
    fileType: getFileExtension(file.name),
    size: file.size,
  };
};

// Generate PDF report
export const generateReport = (modelId: string, models: ModelData[]): string => {
  const model = models.find(m => m.id === modelId);

  if (!model || !model.metrics) {
    throw new Error("Model data not found or incomplete");
  }

  // Create new PDF document
  const doc = new jsPDF();

  // Add title
  doc.setFontSize(22);
  doc.setTextColor(0, 51, 102);
  doc.text("AI Model Benchmark Report", 105, 20, { align: 'center' });

  // Add model basic information
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text("Model Information", 20, 40);

  doc.setFontSize(12);
  doc.setTextColor(60, 60, 60);
  doc.text(`Model Name: ${model.name}`, 20, 50);
  doc.text(`Model Type: ${model.fileType.toUpperCase()}`, 20, 58);
  doc.text(`Model Size: ${formatFileSize(model.size)}`, 20, 66);
  doc.text(`Report Generated: ${new Date().toLocaleString()}`, 20, 74);

  // Add key performance metrics section
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text("Key Performance Metrics", 20, 90);

  // Create a table for key metrics
  const keyMetricsData = [
    ['Metric', 'Value', 'Unit', 'Description'],
    ['Accuracy', (model.metrics.accuracy * 100).toFixed(2), '%', 'Model prediction accuracy'],
    ['Inference Time', model.metrics.inferenceTime.toFixed(2), 'ms', 'Average inference latency'],
    ['Memory Usage', model.metrics.memoryUsage.toFixed(2), 'MB', 'GPU memory consumption'],
    ['Parameters', model.metrics.parameters.toFixed(2), 'M', 'Total model parameters'],
    ['FLOPS', model.metrics.flops.toFixed(2), 'B', 'Floating point ops per second']
  ];

  // @ts-ignore - jspdf-autotable types aren't properly recognized
  doc.autoTable({
    startY: 95,
    head: [keyMetricsData[0]],
    body: keyMetricsData.slice(1),
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255
    },
    alternateRowStyles: {
      fillColor: [240, 240, 240]
    },
    margin: { left: 20, right: 20 }
  });

  // Add charts section title
  const tableEndY = (doc as any).lastAutoTable.finalY + 15;
  doc.setFontSize(16);
  doc.text("Performance Visualization", 20, tableEndY);

  // Add chart description
  doc.setFontSize(12);
  doc.text("Comparative performance across key metrics:", 20, tableEndY + 10);

  // Create bars for the metrics (simplified visualization in PDF)
  const metricsBarStart = tableEndY + 20;

  // Accuracy
  const accuracyPercentage = model.metrics.accuracy * 100;
  doc.setFillColor(41, 128, 185); // Blue
  doc.rect(60, metricsBarStart, accuracyPercentage * 1.5, 10, 'F');
  doc.text("Accuracy", 20, metricsBarStart + 7);
  doc.text(`${accuracyPercentage.toFixed(2)}%`, 60 + (accuracyPercentage * 1.5) + 5, metricsBarStart + 7);

  // Inference time - normalized to 0-100 scale for visualization (assuming 0-100ms range)
  const normalizedInference = Math.min(100, model.metrics.inferenceTime);
  doc.setFillColor(46, 204, 113); // Green
  doc.rect(60, metricsBarStart + 20, normalizedInference * 1.5, 10, 'F');
  doc.text("Inference", 20, metricsBarStart + 27);
  doc.text(`${model.metrics.inferenceTime.toFixed(2)}ms`, 60 + (normalizedInference * 1.5) + 5, metricsBarStart + 27);

  // Memory usage - normalized to 0-100 scale for visualization (assuming 0-1000MB range)
  const normalizedMemory = Math.min(100, model.metrics.memoryUsage / 10);
  doc.setFillColor(231, 76, 60); // Red
  doc.rect(60, metricsBarStart + 40, normalizedMemory * 1.5, 10, 'F');
  doc.text("Memory", 20, metricsBarStart + 47);
  doc.text(`${model.metrics.memoryUsage.toFixed(2)}MB`, 60 + (normalizedMemory * 1.5) + 5, metricsBarStart + 47);

  // Add footer with recommendations
  doc.setFontSize(14);
  doc.text("Recommendations", 20, 230);

  doc.setFontSize(11);
  // Generate some simple recommendations based on metrics
  const recommendations = [];

  if (model.metrics.inferenceTime > 50) {
    recommendations.push("• Consider model quantization to reduce inference time");
  }

  if (model.metrics.memoryUsage > 200) {
    recommendations.push("• Model pruning could reduce memory footprint");
  }

  if (model.metrics.accuracy < 0.9) {
    recommendations.push("• Evaluate model architecture for improved accuracy");
  }

  if (recommendations.length === 0) {
    recommendations.push("• Model performance is within optimal parameters");
  }

  // Add recommendation text
  recommendations.forEach((rec, index) => {
    doc.text(rec, 20, 240 + (index * 8));
  });

  // Add footer
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text("AI Model Benchmarking Tool - Performance Report", 105, 285, { align: 'center' });

  // Return the PDF as a data URL
  return doc.output('dataurlstring');
};
