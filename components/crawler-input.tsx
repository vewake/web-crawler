"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CrawlerInputProps {
  onStartCrawl: (url: string, depth: number, maxPages: number, algorithm: 'bfs' | 'dfs') => void
  isLoading: boolean
}

export default function CrawlerInput({ onStartCrawl, isLoading }: CrawlerInputProps) {
  const [url, setUrl] = useState("")
  const [maxDepth, setMaxDepth] = useState(3)
  const [maxPages, setMaxPages] = useState(50)
  const [algorithm, setAlgorithm] = useState<'bfs' | 'dfs'>('bfs')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return
    onStartCrawl(url, maxDepth, maxPages, algorithm)
  }

  return (
    <Card className="p-6 bg-card">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-foreground">Source URL</label>
          <Input
            type="url"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isLoading}
            className="w-full"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">Max Depth</label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="1"
                max="50"
                value={maxDepth}
                onChange={(e) => setMaxDepth(Math.max(1, Number.parseInt(e.target.value) || 1))}
                disabled={isLoading}
                className="w-20"
              />
              <span className="text-sm text-muted-foreground">(1-50)</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">Max Pages</label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="5"
                max="1000"
                value={maxPages}
                onChange={(e) => setMaxPages(Math.max(5, Number.parseInt(e.target.value) || 50))}
                disabled={isLoading}
                className="w-20"
              />
              <span className="text-sm text-muted-foreground">(5-1000)</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">Algorithm</label>
            <Select value={algorithm} onValueChange={(value: 'bfs' | 'dfs') => setAlgorithm(value)} disabled={isLoading}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select algorithm" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bfs">
                  <div className="flex flex-col">
                    <span className="font-medium">BFS (Breadth-First)</span>
                    <span className="text-xs text-muted-foreground">Explores pages level by level</span>
                  </div>
                </SelectItem>
                <SelectItem value="dfs">
                  <div className="flex flex-col">
                    <span className="font-medium">DFS (Depth-First)</span>
                    <span className="text-xs text-muted-foreground">Explores deep paths first</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button type="submit" disabled={isLoading || !url.trim()} className="w-full md:w-auto">
          {isLoading ? "Crawling..." : "Start Crawl"}
        </Button>

        <div className="mt-4 p-4 bg-muted/50 rounded-lg">
          <h3 className="text-sm font-medium mb-2">Algorithm Comparison:</h3>
          <div className="text-xs text-muted-foreground space-y-1">
            <div><strong>BFS (Breadth-First Search):</strong> Explores all pages at depth 1, then depth 2, etc. Good for finding pages close to the starting URL.</div>
            <div><strong>DFS (Depth-First Search):</strong> Follows links deeply before backtracking. Good for exploring complete paths and finding deeply nested content.</div>
          </div>
        </div>
      </form>
    </Card>
  )
}
