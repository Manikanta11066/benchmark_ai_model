import type { Metadata } from "next";
import { PageModels } from "@/components/pages/models";

export const metadata: Metadata = {
  title: "Models | AI Model Benchmarking Tool",
  description: "View and manage your AI models",
};

export default function ModelsPage() {
  return <PageModels />;
}
