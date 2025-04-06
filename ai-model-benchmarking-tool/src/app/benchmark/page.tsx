import type { Metadata } from "next";
import { PageBenchmark } from "@/components/pages/benchmark";

export const metadata: Metadata = {
  title: "Benchmark | AI Model Benchmarking Tool",
  description: "Benchmark your AI models for performance analysis",
};

export default function BenchmarkPage() {
  return <PageBenchmark />;
}
