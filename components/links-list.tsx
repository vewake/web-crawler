"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface LinksListProps {
  data: {
    nodes: Array<{
      id: string
      url: string
      title: string
      depth: number
      keywords: string[]
      incomingLinks: number
      outgoingLinks: number
    }>
  }
}

export default function LinksList({ data }: LinksListProps) {
  const [filterDepth, setFilterDepth] = useState<number | null>(null)
  const [sortBy, setSortBy] = useState<"depth" | "title" | "links">("depth")
  const [searchFilter, setSearchFilter] = useState("")

  const filtered = data.nodes
    .filter(
      (node) =>
        (filterDepth === null || node.depth === filterDepth) &&
        (searchFilter === "" ||
          node.url.toLowerCase().includes(searchFilter.toLowerCase()) ||
          node.title.toLowerCase().includes(searchFilter.toLowerCase())),
    )
    .sort((a, b) => {
      if (sortBy === "depth") return a.depth - b.depth
      if (sortBy === "title") return a.title.localeCompare(b.title)
      if (sortBy === "links") return b.incomingLinks + b.outgoingLinks - (a.incomingLinks + a.outgoingLinks)
      return 0
    })

  const handleExport = () => {
    const csv = [
      ["URL", "Title", "Depth", "Incoming Links", "Outgoing Links", "Keywords"].join(","),
      ...filtered.map((node) =>
        [
          `"${node.url}"`,
          `"${node.title}"`,
          node.depth,
          node.incomingLinks,
          node.outgoingLinks,
          `"${node.keywords.join("; ")}"`,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "crawler-results.csv"
    a.click()
  }

  return (
    <div className="space-y-4">
      <Card className="p-6 bg-card">
        <h3 className="text-lg font-semibold mb-4 text-foreground">Links & Metadata</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">Filter & Search</label>
            <Input
              placeholder="Search URLs or titles..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">Depth Level</label>
              <select
                value={filterDepth ?? ""}
                onChange={(e) => setFilterDepth(e.target.value ? Number.parseInt(e.target.value) : null)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
              >
                <option value="">All Depths</option>
                {Array.from({ length: 6 }, (_, i) => (
                  <option key={i} value={i}>
                    Depth {i}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
              >
                <option value="depth">Depth</option>
                <option value="title">Title</option>
                <option value="links">Link Count</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button onClick={handleExport} className="w-full bg-transparent" variant="outline">
                Export CSV
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h4 className="font-semibold text-foreground">Showing {filtered.length} links</h4>
        </div>

        {filtered.map((node) => (
          <Card key={node.id} className="p-4 bg-card hover:bg-accent/50 transition">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1 min-w-0">
                <a
                  href={node.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-medium block truncate"
                >
                  {node.title || node.url}
                </a>
                <p className="text-xs text-muted-foreground truncate">{node.url}</p>

                {node.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {node.keywords.slice(0, 200).map((kw, i) => (
                      <span key={i} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                        {kw}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="text-right flex-shrink-0">
                <div className="text-sm font-semibold text-foreground">Depth: {node.depth}</div>
                <div className="text-xs text-muted-foreground">
                  ↓ {node.incomingLinks} ↑ {node.outgoingLinks}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
