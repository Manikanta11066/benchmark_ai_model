"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/file-upload";
import { ModelList } from "@/components/model-list";
import { ModelMetrics } from "@/components/model-metrics";
import { PageLayout } from "@/components/page-layout";
import { useBenchmarkStore } from "@/lib/store";
import { Plus, RefreshCw, Zap } from "lucide-react";

export function PageDashboard() {
  const { models } = useBenchmarkStore();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedModelId, setSelectedModelId] = useState<string | undefined>(undefined);

  const completedModels = models.filter(m => m.status === "completed").length;
  const failedModels = models.filter(m => m.status === "failed").length;
  const inProgressModels = models.filter(m =>
    m.status === "uploading" || m.status === "benchmarking"
  ).length;

  const handleViewDetails = (modelId: string) => {
    setSelectedModelId(modelId);
    setActiveTab("details");
  };

  return (
    <PageLayout>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Upload AI models and benchmark their performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="default" size="sm" onClick={() => setActiveTab("upload")}>
            <Plus className="mr-2 h-4 w-4" />
            Upload Model
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Models</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{models.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {models.length ? `${completedModels} benchmarked` : "No models uploaded yet"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <div className="h-4 w-4 rounded-full bg-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedModels}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {completedModels === 0 ? "No completed benchmarks" : "Models with benchmark results"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <div className="h-4 w-4 rounded-full bg-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressModels}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {inProgressModels === 0 ? "No models processing" : "Models being processed"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="upload">Upload Model</TabsTrigger>
          <TabsTrigger value="details" disabled={!selectedModelId}>
            Model Details
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <ModelList
            onViewDetails={handleViewDetails}
            className="mb-6"
          />

          <ModelMetrics
            className="mt-6"
          />
        </TabsContent>

        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle>Upload AI Model</CardTitle>
              <CardDescription>
                Upload your model file to benchmark its performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileUpload />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details">
          {selectedModelId && (
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Model Details</CardTitle>
                  <CardDescription>
                    Performance metrics and information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ModelMetrics modelId={selectedModelId} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Benchmark History</CardTitle>
                  <CardDescription>
                    Previous benchmark runs and comparisons
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center h-64">
                    <p className="text-muted-foreground">
                      No benchmark history available for this model
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
}
