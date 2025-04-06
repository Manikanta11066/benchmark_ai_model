import type { Metadata } from "next";
import { PageReports } from "@/components/pages/reports";

export const metadata: Metadata = {
  title: "Reports | AI Model Benchmarking Tool",
  description: "Generate and view benchmark reports for your AI models",
};

export default function ReportsPage() {
  return <PageReports />;
}
