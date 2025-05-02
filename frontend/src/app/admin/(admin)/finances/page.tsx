"use client"

import FeeVisualization from "@/components/FeeVisualization"

export default function FeeVisualizationPage() {
  return (
    <div className="container max-w-6xl py-8">
      <h1 className="text-3xl font-bold mb-8">Fee Management Dashboard</h1>
      <FeeVisualization />
    </div>
  )
}
