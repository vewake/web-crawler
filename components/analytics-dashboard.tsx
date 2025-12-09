"use client"

import { useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface AnalyticsDashboardProps {
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
    links: Array<{ source: string; target: string }>
  }
  stats: any
}

export default function AnalyticsDashboard({ data, stats }: AnalyticsDashboardProps) {
  const analytics = useMemo(() => {
    const pageRank = new Map<string, number>()
    data.nodes.forEach((node) => pageRank.set(node.id, 1))

    for (let i = 0; i < 5; i++) {
      const newRank = new Map<string, number>()
      data.nodes.forEach((node) => newRank.set(node.id, 0.15))

      data.links.forEach((link) => {
        const sourceNode = data.nodes.find((n) => n.id === link.source)
        if (sourceNode && sourceNode.outgoingLinks > 0) {
          const currentRank = newRank.get(link.target) || 0
          newRank.set(link.target, currentRank + 0.85 * ((pageRank.get(link.source) || 0) / sourceNode.outgoingLinks))
        }
      })
      data.nodes.forEach((node) => pageRank.set(node.id, newRank.get(node.id) || 0))
    }

    const topPages = Array.from(pageRank.entries())
      .map(([nodeId, rank]) => ({
        node: data.nodes.find((n) => n.id === nodeId),
        rank,
      }))
      .filter((p) => p.node)
      .sort((a, b) => b.rank - a.rank)
      .slice(0, 10)

    const depthStats = new Map<number, number>()
    data.nodes.forEach((node) => {
      depthStats.set(node.depth, (depthStats.get(node.depth) || 0) + 1)
    })

    const keywordFreq = new Map<string, number>()
    data.nodes.forEach((node) => {
      node.keywords.forEach((kw) => {
        keywordFreq.set(kw, (keywordFreq.get(kw) || 0) + 1)
      })
    })
    const topKeywords = Array.from(keywordFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)

    const mostConnected = Array.from(data.nodes)
      .map((node) => ({
        node,
        count: node.incomingLinks,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    return { topPages, depthStats, topKeywords, mostConnected, pageRank }
  }, [data])

  const handleExportJSON = () => {
    const exportData = {
      exportDate: new Date().toISOString(),
      stats,
      nodes: data.nodes,
      links: data.links,
      analytics: {
        pageRank: Array.from(analytics.pageRank.entries()).map(([id, rank]) => ({
          nodeId: id,
          rank,
        })),
      },
    }

    const json = JSON.stringify(exportData, null, 2)
    const blob = new Blob([json], { type: "application/json" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `crawler-export-${Date.now()}.json`
    a.click()
  }

  const handleExportJSON_LD = () => {
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Crawled Website",
      hasPart: data.nodes.map((node) => ({
        "@type": "WebPage",
        url: node.url,
        name: node.title,
        keywords: node.keywords.join(", "),
      })),
    }

    const json = JSON.stringify(jsonLd, null, 2)
    const blob = new Blob([json], { type: "application/ld+json" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `crawler-schema-${Date.now()}.jsonld`
    a.click()
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Button onClick={handleExportJSON} variant="outline" className="flex-1 bg-transparent">
          Export JSON
        </Button>
        <Button onClick={handleExportJSON_LD} variant="outline" className="flex-1 bg-transparent">
          Export JSON-LD
        </Button>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4 text-foreground">PageRank Analysis</h3>
        <div className="space-y-2">
          {analytics.topPages.map(({ node, rank }, i) => (
            <Card key={node?.id} className="p-3 bg-card">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <span className="font-medium text-primary">#{i + 1}</span>
                  <a
                    href={node?.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm hover:underline block truncate"
                  >
                    {node?.title || node?.url}
                  </a>
                </div>
                <div className="text-right ml-4">
                  <div className="w-20 bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-primary h-full transition-all"
                      style={{
                        width: `${Math.min(100, rank * 20)}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{rank.toFixed(2)}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-4 text-foreground">Most Connected Pages</h3>
          <div className="space-y-2">
            {analytics.mostConnected.map(({ node, count }) => (
              <Card key={node?.id} className="p-3 bg-card">
                <a
                  href={node?.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium hover:underline text-primary truncate block"
                >
                  {node?.title || node?.url}
                </a>
                <div className="text-xs text-muted-foreground">{count} incoming links</div>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4 text-foreground">Top Keywords</h3>
          <div className="flex flex-wrap gap-2">
            {analytics.topKeywords.map(([keyword, count]) => (
              <div
                key={keyword}
                className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
                title={`Found ${count} times`}
              >
                {keyword}
                <span className="ml-1 text-xs opacity-70">×{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4 text-foreground">Depth Distribution</h3>
        <div className="space-y-2">
          {Array.from(analytics.depthStats.entries())
            .sort((a, b) => a[0] - b[0])
            .map(([depth, count]) => (
              <div key={depth} className="flex items-center gap-4">
                <span className="w-12 text-sm font-medium text-foreground">Depth {depth}</span>
                <div className="flex-1 bg-muted rounded h-6 flex items-center px-2">
                  <div
                    className="bg-primary rounded h-4 flex items-center justify-center text-xs font-medium text-primary-foreground"
                    style={{
                      width: `${(count / Math.max(...Array.from(analytics.depthStats.values()))) * 100}%`,
                    }}
                  >
                    {count}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

    </div>
  )
}
