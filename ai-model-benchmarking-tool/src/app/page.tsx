import type { Metadata } from "next";
import { PageDashboard } from "@/components/pages/dashboard";

export const metadata: Metadata = {
  title: "Dashboard | AI Model Benchmarking Tool",
  description: "Dashboard for AI model benchmarking and performance analysis",
};

export default function Home() {
  return <PageDashboard />;
}
