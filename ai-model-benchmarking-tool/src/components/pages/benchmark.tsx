"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileUpload } from "@/components/file-upload";
import { PageLayout } from "@/components/page-layout";
import { ModelMetrics } from "@/components/model-metrics";
import { ChevronRight, Settings } from "lucide-react";

export function PageBenchmark() {
  return (
    <PageLayout>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Benchmark Models</h1>
          <p className="text-muted-foreground">
            Upload and benchmark AI models for performance analysis
          </p>
        </div>
      </div>

      <Tabs defaultValue="upload" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upload">Upload Model</TabsTrigger>
          <TabsTrigger value="comparison">Model Comparison</TabsTrigger>
          <TabsTrigger value="settings">Benchmark Settings</TabsTrigger>
        </TabsList>

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

        <TabsContent value="comparison">
          <Card>
            <CardHeader>
              <CardTitle>Compare Models</CardTitle>
              <CardDescription>
                Select multiple models to compare their performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ModelMetrics />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Benchmark Settings</CardTitle>
              <CardDescription>
                Configure benchmark parameters and hardware settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-md border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Hardware Configuration</h3>
                      <p className="text-sm text-muted-foreground">
                        Select which hardware to use for benchmarking
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                <div className="rounded-md border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Benchmark Metrics</h3>
                      <p className="text-sm text-muted-foreground">
                        Choose which metrics to measure during benchmarking
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                <div className="rounded-md border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Test Datasets</h3>
                      <p className="text-sm text-muted-foreground">
                        Select test datasets for evaluating model accuracy
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
}
