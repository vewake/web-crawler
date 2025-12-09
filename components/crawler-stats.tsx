"use client"

import { Card } from "@/components/ui/card"

interface CrawlerStatsProps {
  stats: {
    totalPages: number
    totalLinks: number
    depth: number
    duplicatesRemoved: number
    crawlTime: number
    averageLinksPerPage: number
    algorithm?: string
  }
}

export default function CrawlerStats({ stats }: CrawlerStatsProps) {
  return (
    <div className="space-y-4">
      {stats.algorithm && (
        <Card className="p-4 bg-card">
          <div className="text-sm text-muted-foreground">Algorithm Used</div>
          <div className="text-lg font-bold text-primary">
            {stats.algorithm.toUpperCase()} - {stats.algorithm === 'bfs' ? 'Breadth-First Search' : 'Depth-First Search'}
          </div>
        </Card>
      )}
      
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card className="p-4 bg-card">
          <div className="text-sm text-muted-foreground">Total Pages</div>
          <div className="text-2xl font-bold text-primary">{stats.totalPages}</div>
        </Card>

        <Card className="p-4 bg-card">
          <div className="text-sm text-muted-foreground">Total Links</div>
          <div className="text-2xl font-bold text-primary">{stats.totalLinks}</div>
        </Card>

        <Card className="p-4 bg-card">
          <div className="text-sm text-muted-foreground">Max Depth</div>
          <div className="text-2xl font-bold text-primary">{stats.depth}</div>
        </Card>

        <Card className="p-4 bg-card">
          <div className="text-sm text-muted-foreground">Duplicates</div>
          <div className="text-2xl font-bold text-primary">{stats.duplicatesRemoved}</div>
        </Card>

        <Card className="p-4 bg-card">
          <div className="text-sm text-muted-foreground">Crawl Time</div>
          <div className="text-2xl font-bold text-primary">{stats.crawlTime}s</div>
        </Card>

        <Card className="p-4 bg-card">
          <div className="text-sm text-muted-foreground">Avg Links/Page</div>
          <div className="text-2xl font-bold text-primary">{stats.averageLinksPerPage.toFixed(1)}</div>
        </Card>
      </div>
    </div>
  )
}
