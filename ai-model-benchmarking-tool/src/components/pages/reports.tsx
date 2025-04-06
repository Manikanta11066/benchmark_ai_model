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
import { PageLayout } from "@/components/page-layout";
import { ModelList } from "@/components/model-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileDown, Download, FileText } from "lucide-react";
import { useBenchmarkStore } from "@/lib/store";
import { generateReport } from "@/lib/benchmark-utils";
import { ModelData } from "@/lib/store";
import jsPDF from "jspdf"; // Import jsPDF

export function PageReports() {
  const { models, selectedModelIds, getSelectedModels } = useBenchmarkStore();
  const [activeTab, setActiveTab] = useState("single");

  const completedModels = models.filter(m => m.status === "completed");

  const generateModelReport = (modelId: string) => {
    try {
      const reportUrl = generateReport(modelId, models);

      // Create a temporary anchor element to download the report
      const a = document.createElement("a");
      a.href = reportUrl;

      // Get model name for the filename
      const model = models.find(m => m.id === modelId);
      const filename = model
        ? `${model.name.replace(/\.[^/.]+$/, "")}_report.pdf`
        : "model_report.pdf";

      a.download = filename;
      document.body.appendChild(a);
      a.click();

      // Clean up
      document.body.removeChild(a);
    } catch (error) {
      console.error("Failed to generate report:", error);
      alert("Failed to generate report. Make sure the model has completed benchmarking.");
    }
  };

  const generateComparisonReport = () => {
    // Get selected models
    const selectedModels = getSelectedModels().filter(m => m.status === "completed");

    if (selectedModels.length === 0) {
      alert("Please select at least one completed model for the report");
      return;
    }

    try {
      // Create new PDF document
      const doc = new jsPDF();

      // Add title
      doc.setFontSize(22);
      doc.setTextColor(0, 51, 102);
      doc.text("AI Model Comparison Report", 105, 20, { align: 'center' });

      // Add basic information
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text("Comparison Overview", 20, 40);

      doc.setFontSize(12);
      doc.setTextColor(60, 60, 60);
      doc.text(`Models Compared: ${selectedModels.length}`, 20, 50);
      doc.text(`Report Generated: ${new Date().toLocaleString()}`, 20, 58);

      // Create comparison table
      const tableData = [
        ['Model Name', 'Type', 'Accuracy', 'Inference Time', 'Memory Usage'],
        ...selectedModels.map(model => [
          model.name,
          model.fileType.toUpperCase(),
          model.metrics ? `${(model.metrics.accuracy * 100).toFixed(2)}%` : 'N/A',
          model.metrics ? `${model.metrics.inferenceTime.toFixed(2)}ms` : 'N/A',
          model.metrics ? `${model.metrics.memoryUsage.toFixed(2)}MB` : 'N/A'
        ])
      ];

      // @ts-ignore - jspdf-autotable types aren't properly recognized
      doc.autoTable({
        startY: 70,
        head: [tableData[0]],
        body: tableData.slice(1),
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255
        },
        alternateRowStyles: {
          fillColor: [240, 240, 240]
        },
        margin: { left: 20, right: 20 }
      });

      // Add conclusion section
      const tableEndY = (doc as any).lastAutoTable.finalY + 20;
      doc.setFontSize(16);
      doc.text("Performance Summary", 20, tableEndY);

      // Find best performing model in each category
      const bestAccuracy = [...selectedModels].sort((a, b) =>
        (b.metrics?.accuracy || 0) - (a.metrics?.accuracy || 0)
      )[0];

      const bestInference = [...selectedModels].sort((a, b) =>
        (a.metrics?.inferenceTime || Number.POSITIVE_INFINITY) - (b.metrics?.inferenceTime || Number.POSITIVE_INFINITY)
      )[0];

      const bestMemory = [...selectedModels].sort((a, b) =>
        (a.metrics?.memoryUsage || Number.POSITIVE_INFINITY) - (b.metrics?.memoryUsage || Number.POSITIVE_INFINITY)
      )[0];

      // Add results
      doc.setFontSize(12);
      doc.text("Best performing models by category:", 20, tableEndY + 10);

      doc.text(`• Best Accuracy: ${bestAccuracy.name} (${bestAccuracy.metrics ? (bestAccuracy.metrics.accuracy * 100).toFixed(2) : 0}%)`, 20, tableEndY + 20);
      doc.text(`• Fastest Inference: ${bestInference.name} (${bestInference.metrics ? bestInference.metrics.inferenceTime.toFixed(2) : 0}ms)`, 20, tableEndY + 30);
      doc.text(`• Lowest Memory: ${bestMemory.name} (${bestMemory.metrics ? bestMemory.metrics.memoryUsage.toFixed(2) : 0}MB)`, 20, tableEndY + 40);

      // Add footer
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text("AI Model Benchmarking Tool - Comparison Report", 105, 285, { align: 'center' });

      // Generate PDF and download
      const reportUrl = doc.output('dataurlstring');

      const a = document.createElement("a");
      a.href = reportUrl;
      a.download = "model_comparison_report.pdf";
      document.body.appendChild(a);
      a.click();

      // Clean up
      document.body.removeChild(a);

    } catch (error) {
      console.error("Failed to generate comparison report:", error);
      alert("Failed to generate comparison report");
    }
  };

  return (
    <PageLayout>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">
            Generate and download benchmark reports
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList>
          <TabsTrigger value="single">Single Model Reports</TabsTrigger>
          <TabsTrigger value="comparison">Comparison Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="single" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Individual Model Reports</CardTitle>
              <CardDescription>
                Generate detailed reports for individual models
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {completedModels.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium text-lg mb-2">No Models Available</h3>
                  <p className="text-muted-foreground mb-4">
                    Complete benchmarking of models to generate reports
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {completedModels.map((model) => (
                    <div
                      key={model.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <h3 className="font-medium">{model.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {model.fileType.toUpperCase()} -
                          Accuracy: {model.metrics ? (model.metrics.accuracy * 100).toFixed(2) + '%' : 'N/A'}
                        </p>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => generateModelReport(model.id)}
                      >
                        <FileDown className="mr-2 h-4 w-4" />
                        Download Report
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Model Comparison Reports</CardTitle>
              <CardDescription>
                Select multiple models to generate comparison reports
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ModelList className="mb-6" />

              <Card className="bg-muted">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Selected Models</h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedModelIds.length} model{selectedModelIds.length !== 1 ? 's' : ''} selected
                      </p>
                    </div>

                    <Button
                      onClick={generateComparisonReport}
                      disabled={selectedModelIds.length < 2}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Generate Comparison Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
}
