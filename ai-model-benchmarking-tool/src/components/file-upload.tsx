"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileType, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useBenchmarkStore } from "@/lib/store";
import { handleFileUpload, simulateBenchmarking } from "@/lib/benchmark-utils";

const ACCEPTED_FILE_TYPES = {
  "application/octet-stream": [".pt", ".pth", ".h5", ".onnx", ".pb", ".tflite"],
};

export function FileUpload() {
  const { addModel, updateModelStatus, setModelMetrics } = useBenchmarkStore();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const processFile = useCallback(async (file: File) => {
    setIsUploading(true);
    setError(null);

    // Reset progress
    setUploadProgress(0);

    try {
      // Extract file metadata
      const modelData = handleFileUpload(file);

      // Add model to store
      const modelId = addModel(modelData);

      // Simulate upload progress
      const uploadInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(uploadInterval);
            return 100;
          }
          return prev + 5;
        });
      }, 100);

      // Simulate file upload completion
      setTimeout(() => {
        clearInterval(uploadInterval);
        setUploadProgress(100);

        // Update model status to uploaded
        updateModelStatus(modelId, "uploaded");

        // Simulate benchmark processing
        updateModelStatus(modelId, "benchmarking");

        // Perform benchmarking (simulated)
        simulateBenchmarking(modelData.fileType, modelData.size)
          .then((metrics) => {
            // Update model with benchmark results
            setModelMetrics(modelId, metrics);
            setIsUploading(false);
          })
          .catch((err) => {
            updateModelStatus(modelId, "failed", err.message);
            setError(`Benchmarking failed: ${err.message}`);
            setIsUploading(false);
          });
      }, 2000);

    } catch (err) {
      setError(`Upload failed: ${err instanceof Error ? err.message : "Unknown error"}`);
      setIsUploading(false);
    }
  }, [addModel, updateModelStatus, setModelMetrics]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    // Process each file - for simplicity, we'll just use the first one
    processFile(acceptedFiles[0]);
  }, [processFile]);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject,
  } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxFiles: 1,
    disabled: isUploading,
  });

  return (
    <div className="w-full max-w-2xl mx-auto">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card
        {...getRootProps()}
        className={`p-8 border-dashed cursor-pointer hover:border-primary/50 transition-colors ${
          isDragActive ? "border-primary border-2" : ""
        } ${isDragReject ? "border-destructive border-2" : ""}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <div className="rounded-full bg-primary/10 p-4">
            <Upload className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Upload Model File</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Drag and drop your model file here, or click to browse
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            <div className="flex items-center gap-1 text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-md">
              <FileType className="h-3 w-3" />
              <span>.pt</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-md">
              <FileType className="h-3 w-3" />
              <span>.h5</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-md">
              <FileType className="h-3 w-3" />
              <span>.onnx</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-md">
              <FileType className="h-3 w-3" />
              <span>.pb</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-md">
              <FileType className="h-3 w-3" />
              <span>.tflite</span>
            </div>
          </div>
          <Button disabled={isUploading} type="button" className="mt-2">
            {isUploading ? "Uploading..." : "Select File"}
          </Button>
        </div>
      </Card>

      {isUploading && (
        <div className="mt-4">
          <Progress value={uploadProgress} className="h-2" />
          <p className="text-sm text-center mt-2 text-muted-foreground">
            {uploadProgress < 100
              ? `Uploading model file... ${uploadProgress}%`
              : "Processing model for benchmarking..."}
          </p>
        </div>
      )}
    </div>
  );
}
