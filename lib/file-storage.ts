/**
 * File Storage Operations for Crawler Results
 */

export interface CrawlExport {
  metadata: {
    exportDate: string
    sourceUrl: string
    crawlDepth: number
    totalDuration: number
  }
  data: {
    nodes: any[]
    links: any[]
  }
  stats: Record<string, any>
}

export function exportToJSON(data: CrawlExport, filename = "crawl-results.json"): void {
  const json = JSON.stringify(data, null, 2)
  downloadFile(json, filename, "application/json")
}

export function exportToCSV(nodes: any[], links: any[], filename = "crawl-results.csv"): void {
  const headers = ["URL", "Title", "Depth", "Incoming Links", "Outgoing Links", "Keywords"]
  const rows = nodes.map((node) => [
    `"${node.url}"`,
    `"${node.title}"`,
    node.depth,
    node.incomingLinks,
    node.outgoingLinks,
    `"${node.keywords.join("; ")}"`,
  ])

  const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")
  downloadFile(csv, filename, "text/csv")
}

function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}
