"use client";

import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useBenchmarkStore } from "@/lib/store";
import { formatFileSize } from "@/lib/benchmark-utils";
import { BenchmarkMetrics } from "@/lib/store";

interface ModelMetricsProps {
  modelId?: string;
  className?: string;
}

export function ModelMetrics({ modelId, className }: ModelMetricsProps) {
  const { models, getSelectedModels } = useBenchmarkStore();

  // Get models to display: either the selected model or all selected models
  const modelsToDisplay = useMemo(() => {
    if (modelId) {
      const model = models.find(m => m.id === modelId);
      return model && model.metrics ? [model] : [];
    }

    return getSelectedModels().filter(m => m.metrics !== null);
  }, [modelId, models, getSelectedModels]);

  // Format data for charts
  const accuracyData = useMemo(() =>
    modelsToDisplay.map(model => ({
      name: model.name,
      accuracy: model.metrics ? Math.round(model.metrics.accuracy * 100) : 0,
    })),
  [modelsToDisplay]);

  const inferenceData = useMemo(() =>
    modelsToDisplay.map(model => ({
      name: model.name,
      inferenceTime: model.metrics?.inferenceTime || 0,
    })),
  [modelsToDisplay]);

  const memoryData = useMemo(() =>
    modelsToDisplay.map(model => ({
      name: model.name,
      memoryUsage: model.metrics?.memoryUsage || 0,
    })),
  [modelsToDisplay]);

  // Get detailed metrics for single model view
  const singleModelMetrics = useMemo(() => {
    if (modelId && modelsToDisplay.length === 1 && modelsToDisplay[0].metrics) {
      return modelsToDisplay[0].metrics;
    }
    return null;
  }, [modelId, modelsToDisplay]);

  if (modelsToDisplay.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Model Metrics</CardTitle>
          <CardDescription>
            Select a model to view its performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48">
          <p className="text-muted-foreground">No benchmark data available</p>
        </CardContent>
      </Card>
    );
  }

  if (singleModelMetrics) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
          <CardDescription>
            Detailed metrics for {modelsToDisplay[0].name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <MetricCard
              title="Accuracy"
              value={`${Math.round(singleModelMetrics.accuracy * 100)}%`}
              description="Model prediction accuracy"
            />
            <MetricCard
              title="Inference Time"
              value={`${singleModelMetrics.inferenceTime.toFixed(2)}ms`}
              description="Average inference latency"
            />
            <MetricCard
              title="Memory Usage"
              value={`${singleModelMetrics.memoryUsage.toFixed(1)} MB`}
              description="Runtime memory consumption"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MetricCard
              title="Parameters"
              value={`${singleModelMetrics.parameters.toFixed(2)}M`}
              description="Total model parameters"
            />
            <MetricCard
              title="FLOPS"
              value={`${singleModelMetrics.flops.toFixed(2)}B`}
              description="Floating point operations per second"
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Model Comparison</CardTitle>
        <CardDescription>
          Performance metrics for {modelsToDisplay.length} selected models
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-6">
          <div className="h-72">
            <h3 className="font-medium mb-2">Accuracy (%)</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={accuracyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value) => [`${value}%`, 'Accuracy']} />
                <Bar dataKey="accuracy" fill="#3b82f6" name="Accuracy (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="h-72">
            <h3 className="font-medium mb-2">Inference Time (ms)</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={inferenceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}ms`, 'Inference Time']} />
                <Bar dataKey="inferenceTime" fill="#10b981" name="Inference Time (ms)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="h-72">
            <h3 className="font-medium mb-2">Memory Usage (MB)</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={memoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value.toFixed(1)} MB`, 'Memory Usage']} />
                <Bar dataKey="memoryUsage" fill="#f59e0b" name="Memory Usage (MB)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  description: string;
}

function MetricCard({ title, value, description }: MetricCardProps) {
  return (
    <div className="bg-secondary/50 rounded-lg p-4">
      <h4 className="text-sm font-medium text-muted-foreground">{title}</h4>
      <p className="text-2xl font-bold mt-1">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </div>
  );
}
