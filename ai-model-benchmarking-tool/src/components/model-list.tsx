"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Check,
  Download,
  FileDown,
  MoreHorizontal,
  Trash2,
  X
} from "lucide-react";
import { useBenchmarkStore, type ModelData } from "@/lib/store";
import { formatFileSize, generateReport } from "@/lib/benchmark-utils";

interface ModelListProps {
  onViewDetails?: (modelId: string) => void;
  className?: string;
}

export function ModelList({ onViewDetails, className }: ModelListProps) {
  const {
    models,
    selectedModelIds,
    toggleModelSelection,
    removeModel,
    selectAllModels,
    clearSelectedModels,
    getFormattedUploadTime
  } = useBenchmarkStore();

  const [sortField, setSortField] = useState<keyof ModelData>("uploadedAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Handle sort change
  const handleSort = (field: keyof ModelData) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Sort models
  const sortedModels = [...models].sort((a, b) => {
    if (sortField === "uploadedAt") {
      return sortDirection === "asc"
        ? a.uploadedAt.getTime() - b.uploadedAt.getTime()
        : b.uploadedAt.getTime() - a.uploadedAt.getTime();
    }

    if (sortField === "size") {
      return sortDirection === "asc"
        ? a.size - b.size
        : b.size - a.size;
    }

    // Handle string fields
    const aValue = String(a[sortField] || "");
    const bValue = String(b[sortField] || "");

    return sortDirection === "asc"
      ? aValue.localeCompare(bValue)
      : bValue.localeCompare(aValue);
  });

  // Get sort icon
  const getSortIcon = (field: keyof ModelData) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? "↑" : "↓";
  };

  // Handle generate report
  const handleGenerateReport = (modelId: string) => {
    try {
      const reportUrl = generateReport(modelId, models);

      // Create a temporary anchor element to download the report
      const a = document.createElement("a");
      a.href = reportUrl;

      // Get model name for the filename
      const model = models.find(m => m.id === modelId);
      const filename = model ? `${model.name.replace(/\.[^/.]+$/, "")}_report.pdf` : "model_report.pdf";

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

  if (models.length === 0) {
    return (
      <div className={`border rounded-lg p-8 text-center ${className}`}>
        <h3 className="text-lg font-medium mb-2">No Models Available</h3>
        <p className="text-muted-foreground mb-4">
          Upload your first AI model to get started with benchmarking
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold">Model Library</h2>
          <p className="text-sm text-muted-foreground">
            {models.length} model{models.length !== 1 ? "s" : ""} uploaded
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {selectedModelIds.length > 0 ? (
            <Button variant="outline" size="sm" onClick={() => clearSelectedModels()}>
              <X className="mr-1 h-4 w-4" />
              Clear Selection
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={() => selectAllModels()}>
              <Check className="mr-1 h-4 w-4" />
              Select All
            </Button>
          )}
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <span className="sr-only">Selection</span>
              </TableHead>
              <TableHead onClick={() => handleSort("name")} className="cursor-pointer">
                Model Name {getSortIcon("name")}
              </TableHead>
              <TableHead onClick={() => handleSort("fileType")} className="cursor-pointer">
                Type {getSortIcon("fileType")}
              </TableHead>
              <TableHead onClick={() => handleSort("size")} className="cursor-pointer">
                Size {getSortIcon("size")}
              </TableHead>
              <TableHead onClick={() => handleSort("uploadedAt")} className="cursor-pointer">
                Uploaded {getSortIcon("uploadedAt")}
              </TableHead>
              <TableHead onClick={() => handleSort("status")} className="cursor-pointer">
                Status {getSortIcon("status")}
              </TableHead>
              <TableHead className="w-12">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedModels.map((model) => (
              <TableRow key={model.id} className="group">
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleModelSelection(model.id)}
                    className="h-6 w-6"
                  >
                    <div className={`h-4 w-4 rounded border flex items-center justify-center ${
                      selectedModelIds.includes(model.id)
                        ? "bg-primary border-primary"
                        : "border-input"
                    }`}>
                      {selectedModelIds.includes(model.id) && (
                        <Check className="h-3 w-3 text-primary-foreground" />
                      )}
                    </div>
                    <span className="sr-only">
                      {selectedModelIds.includes(model.id) ? "Deselect" : "Select"}
                    </span>
                  </Button>
                </TableCell>
                <TableCell
                  className="font-medium cursor-pointer"
                  onClick={() => onViewDetails?.(model.id)}
                >
                  {model.name}
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary">
                    {model.fileType.toUpperCase()}
                  </span>
                </TableCell>
                <TableCell>{formatFileSize(model.size)}</TableCell>
                <TableCell>{getFormattedUploadTime(model.id)}</TableCell>
                <TableCell>
                  <StatusBadge status={model.status} />
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        disabled={model.status !== "completed"}
                        onClick={() => handleGenerateReport(model.id)}
                      >
                        <FileDown className="mr-2 h-4 w-4" />
                        <span>Export Report</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onViewDetails?.(model.id)}>
                        <Check className="mr-2 h-4 w-4" />
                        <span>View Details</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => removeModel(model.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// Status badge component
function StatusBadge({ status }: { status: ModelData["status"] }) {
  const getStatusConfig = () => {
    switch (status) {
      case "uploading":
        return { label: "Uploading", className: "bg-blue-100 text-blue-800" };
      case "uploaded":
        return { label: "Uploaded", className: "bg-gray-100 text-gray-800" };
      case "benchmarking":
        return { label: "Benchmarking", className: "bg-yellow-100 text-yellow-800" };
      case "completed":
        return { label: "Completed", className: "bg-green-100 text-green-800" };
      case "failed":
        return { label: "Failed", className: "bg-red-100 text-red-800" };
      default:
        return { label: status, className: "bg-gray-100 text-gray-800" };
    }
  };

  const { label, className } = getStatusConfig();

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}
