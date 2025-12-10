"use client"

import { useState } from "react"
import CrawlerInput from "@/components/crawler-input"
import GraphVisualization from "@/components/graph-visualization"
import LinksList from "@/components/links-list"
import SearchPanel from "@/components/search-panel"
import CrawlerStats from "@/components/crawler-stats"
import AnalyticsDashboard from "@/components/analytics-dashboard"
import AlgorithmComparison from "@/components/algorithm-comparison"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Home() {
  const [crawlData, setCrawlData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [stats, setStats] = useState(null)
  const [liveUpdates, setLiveUpdates] = useState<any[]>([])

  const handleStartCrawl = async (sourceUrl: string, maxDepth: number, maxPages: number, algorithm: 'bfs' | 'dfs') => {
    setIsLoading(true)
    setLiveUpdates([])
    setCrawlData(null)
    try {
      const response = await fetch("/api/crawl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceUrl, maxDepth, maxPages, algorithm }),
      })

      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      // Stream real-time updates
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let buffer = ""

      if (!reader) throw new Error("No response body")

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop() || ""

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.type === "update") {
                setLiveUpdates((prev) => [...prev, data])
                setCrawlData(data.data)
              } else if (data.type === "complete") {
                setCrawlData(data.data)
                setStats(data.data.stats)
              }
            } catch (e) {
              console.error(" Parse error:", e)
            }
          }
        }
      }
    } catch (error) {
      console.error("Crawl error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-foreground">Web Crawler</h1>
          <p className="text-muted-foreground mb-4">web crawling with BFS/DFS algorithms, advanced keyword extraction, and search capabilities</p>

          {/* {!crawlData && ( */}
          {/*   <FeatureSummary /> */}
          {/* )} */}
        </div>

        <CrawlerInput onStartCrawl={handleStartCrawl} isLoading={isLoading} />

        {crawlData && (
          <div className="gap-6 mt-8">
            {stats && <CrawlerStats stats={stats} />}

            <Tabs defaultValue="graph" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="graph">Graph Map</TabsTrigger>
                <TabsTrigger value="algorithm">Algorithm</TabsTrigger>
                <TabsTrigger value="search">Search & Filter</TabsTrigger>
                <TabsTrigger value="list">Links List</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="graph" className="mt-4">
                <Card className="p-4">
                  <GraphVisualization data={crawlData} />
                </Card>
              </TabsContent>

              <TabsContent value="algorithm" className="mt-4">
                <AlgorithmComparison data={crawlData} />
              </TabsContent>

              <TabsContent value="search" className="mt-4">
                <SearchPanel data={crawlData} />
              </TabsContent>


              <TabsContent value="list" className="mt-4">
                <LinksList data={crawlData} />
              </TabsContent>

              <TabsContent value="analytics" className="mt-4">
                <AnalyticsDashboard data={crawlData} stats={stats} />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </main>
  )
}
