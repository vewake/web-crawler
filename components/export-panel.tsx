"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { exportToJSON, exportToJSONL, exportToCSV, exportToMarkdown } from "@/lib/file-storage"

interface ExportPanelProps {
  data: {
    nodes: any[]
    links: any[]
  }
  stats: any
  sourceUrl: string
}

export default function ExportPanel({ data, stats, sourceUrl }: ExportPanelProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async (format: "json" | "jsonl" | "csv" | "markdown") => {
    setIsExporting(true)
    try {
      const exportData = {
        metadata: {
          exportDate: new Date().toISOString(),
          sourceUrl,
          crawlDepth: Math.max(...data.nodes.map((n) => n.depth), 0),
          totalDuration: stats.crawlTime || 0,
        },
        data,
        stats,
      }

      const timestamp = new Date().toISOString().split("T")[0]

      if (format === "json") {
        exportToJSON(exportData, `crawl-${timestamp}.json`)
      } else if (format === "jsonl") {
        exportToJSONL(exportData, `crawl-${timestamp}.jsonl`)
      } else if (format === "csv") {
        exportToCSV(data.nodes, data.links, `crawl-${timestamp}.csv`)
      } else if (format === "markdown") {
        exportToMarkdown(exportData, `crawl-${timestamp}.md`)
      }
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Card className="p-6 bg-card">
      <h3 className="text-lg font-semibold mb-4 text-foreground">Export Results</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {[
          { format: "json", label: "JSON" },
          { format: "jsonl", label: "JSONL" },
          { format: "csv", label: "CSV" },
          { format: "markdown", label: "Markdown" },
        ].map(({ format, label }) => (
          <Button
            key={format}
            onClick={() => handleExport(format as any)}
            disabled={isExporting}
            variant="outline"
            className="text-sm"
          >
            {label}
          </Button>
        ))}
      </div>
    </Card>
  )
}
