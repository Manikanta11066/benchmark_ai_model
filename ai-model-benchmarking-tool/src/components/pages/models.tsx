"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ModelList } from "@/components/model-list";
import { ModelMetrics } from "@/components/model-metrics";
import { FileUpload } from "@/components/file-upload";
import { PageLayout } from "@/components/page-layout";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";
import { useBenchmarkStore } from "@/lib/store";

export function PageModels() {
  const { selectedModelIds, clearSelectedModels, removeModel } = useBenchmarkStore();
  const [selectedModelId, setSelectedModelId] = useState<string | undefined>(undefined);
  const [showUploadDialog, setShowUploadDialog] = useState(false);

  const handleViewDetails = (modelId: string) => {
    setSelectedModelId(modelId);
  };

  const handleDeleteSelected = () => {
    selectedModelIds.forEach(id => removeModel(id));
    clearSelectedModels();
  };

  return (
    <PageLayout>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Models</h1>
          <p className="text-muted-foreground">
            View and manage your AI model library
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedModelIds.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeleteSelected}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Selected
            </Button>
          )}
          <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
            <DialogTrigger asChild>
              <Button variant="default" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Upload Model
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Upload AI Model</DialogTitle>
                <DialogDescription>
                  Upload your model file to benchmark its performance
                </DialogDescription>
              </DialogHeader>
              <FileUpload />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Model Library</CardTitle>
            <CardDescription>
              View and manage your collection of AI models
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ModelList onViewDetails={handleViewDetails} />
          </CardContent>
        </Card>

        {selectedModelId && (
          <Card>
            <CardHeader>
              <CardTitle>Model Details</CardTitle>
              <CardDescription>
                Detailed performance metrics and information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ModelMetrics modelId={selectedModelId} />
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  );
}
