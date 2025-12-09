/**
 * Graph-based Web Crawler using DSA concepts
 * Data Structures: Graph (Adjacency List), HashMap (URL deduplication)
 * Algorithms: DFS, BFS for traversal
 */

import * as cheerio from 'cheerio'
import { extractAdvancedKeywords, type KeywordAnalysis } from './advanced-keywords'
interface CrawledNode {
  id: string
  url: string
  title: string
  depth: number
  keywords: string[]
  keywordAnalysis: KeywordAnalysis
  incomingLinks: number
  outgoingLinks: number
  contentScore: number
  pageText?: string
}

interface CrawledLink {
  source: string
  target: string
}

interface CrawlResult {
  nodes: CrawledNode[]
  links: CrawledLink[]
  algorithm: CrawlAlgorithm
  stats: {
    totalPages: number
    totalLinks: number
    depth: number
    duplicatesRemoved: number
    crawlTime: number
    averageLinksPerPage: number
    algorithm: CrawlAlgorithm
  }
}

class Graph {
  private adjacencyList: Map<string, string[]> = new Map()
  private nodes: Map<string, CrawledNode> = new Map()

  addNode(nodeId: string, node: CrawledNode) {
    this.nodes.set(nodeId, node)
    if (!this.adjacencyList.has(nodeId)) {
      this.adjacencyList.set(nodeId, [])
    }
  }

  addEdge(source: string, target: string) {
    if (!this.adjacencyList.has(source)) {
      this.adjacencyList.set(source, [])
    }
    if (!this.adjacencyList.get(source)!.includes(target)) {
      this.adjacencyList.get(source)!.push(target)
    }
  }

  getNode(nodeId: string): CrawledNode | undefined {
    return this.nodes.get(nodeId)
  }

  getAdjacent(nodeId: string): string[] {
    return this.adjacencyList.get(nodeId) || []
  }

  getAllNodes(): CrawledNode[] {
    return Array.from(this.nodes.values())
  }

  getEdges(): Array<{ source: string; target: string }> {
    const edges: Array<{ source: string; target: string }> = []
    this.adjacencyList.forEach((targets, source) => {
      targets.forEach((target) => {
        edges.push({ source, target })
      })
    })
    return edges
  }
}

export function bfsTraversal(graph: Graph, startNodeId: string): string[] {
  const visited = new Set<string>()
  const queue: string[] = [startNodeId]
  const result: string[] = []

  while (queue.length > 0) {
    const nodeId = queue.shift()!
    if (visited.has(nodeId)) continue

    visited.add(nodeId)
    result.push(nodeId)

    const adjacent = graph.getAdjacent(nodeId)
    adjacent.forEach((adjId) => {
      if (!visited.has(adjId)) {
        queue.push(adjId)
      }
    })
  }

  return result
}

export function dfsTraversal(graph: Graph, startNodeId: string): string[] {
  const visited = new Set<string>()
  const result: string[] = []

  const dfs = (nodeId: string) => {
    if (visited.has(nodeId)) return
    visited.add(nodeId)
    result.push(nodeId)

    const adjacent = graph.getAdjacent(nodeId)
    adjacent.forEach((adjId) => dfs(adjId))
  }

  dfs(startNodeId)
  return result
}

function normalizeUrl(url: string, baseUrl: string): string | null {
  try {
    if (!url.startsWith("http")) {
      const base = new URL(baseUrl)
      if (url.startsWith("/")) {
        url = base.origin + url
      } else if (!url.startsWith("#")) {
        url = base.origin + "/" + url
      } else {
        return null
      }
    }

    const urlObj = new URL(url)
    return urlObj.origin + urlObj.pathname + urlObj.search
  } catch {
    return null
  }
}

export type CrawlAlgorithm = 'bfs' | 'dfs';

export async function crawlWebsite(
  sourceUrl: string,
  maxDepth = 3,
  maxPages = 50,
  algorithm: CrawlAlgorithm = 'bfs',
  onUpdate?: (data: any) => void,
): Promise<CrawlResult> {
  const startTime = Date.now()
  const graph = new Graph()
  const visitedUrls = new Set<string>()
  const nodeMap = new Map<string, string>()

  let nodeIdCounter = 0
  const generateNodeId = () => `node_${nodeIdCounter++}`

  try {
    const normalizedSource = normalizeUrl(sourceUrl, sourceUrl)
    if (!normalizedSource) throw new Error("Invalid source URL")

    // Use different data structures based on algorithm
    const urlsToVisit: Array<{ url: string; depth: number; parentId?: string }> = [{ url: normalizedSource, depth: 0 }]

    visitedUrls.add(normalizedSource)
    let duplicatesRemoved = 0

    while (urlsToVisit.length > 0 && nodeIdCounter < maxPages) {
      // Algorithm-specific URL selection
      let currentItem: { url: string; depth: number; parentId?: string };

      if (algorithm === 'bfs') {
        // BFS: First In, First Out (Queue behavior)
        currentItem = urlsToVisit.shift()!;
      } else {
        // DFS: Last In, First Out (Stack behavior)
        currentItem = urlsToVisit.pop()!;
      }

      const { url, depth, parentId } = currentItem;

      if (depth > maxDepth) continue

      const nodeId = generateNodeId()
      nodeMap.set(url, nodeId)

      const node: CrawledNode = {
        id: nodeId,
        url,
        title: extractTitleFromUrl(url),
        depth,
        keywords: [],
        keywordAnalysis: { primary: [], secondary: [], technical: [], business: [], entities: [], score: 0 },
        incomingLinks: 0,
        outgoingLinks: 0,
        contentScore: 0,
      }

      graph.addNode(nodeId, node)

      if (parentId) {
        graph.addEdge(parentId, nodeId)
        const parentNode = graph.getNode(parentId)
        if (parentNode) parentNode.outgoingLinks++
        node.incomingLinks++
      }

      if (depth < maxDepth) {
        try {
          const links = await fetchAndExtractLinks(url, 30000);
          const keywordAnalysis = extractAdvancedKeywords(links.pageText, url);

          // Update node with enhanced keyword data
          node.keywords = [...keywordAnalysis.primary, ...keywordAnalysis.secondary];
          node.keywordAnalysis = keywordAnalysis;
          node.contentScore = keywordAnalysis.score;
          node.pageText = links.pageText.substring(0, 10000); // Store first 10000 chars for search

          links.urls.forEach((linkUrl) => {
            const normalized = normalizeUrl(linkUrl, url);
            if (normalized && isSameDomain(normalized, normalizedSource)) {
              if (visitedUrls.has(normalized)) {
                duplicatesRemoved++
              } else if (nodeIdCounter < maxPages) {
                visitedUrls.add(normalized)
                urlsToVisit.push({ url: normalized, depth: depth + 1, parentId: nodeId })
              }
            }
          })
        } catch (error) {
          console.error(`Error crawling ${url}:`, error)
        }
      }

      if (onUpdate && nodeIdCounter % 5 === 0) {
        const nodes = graph.getAllNodes()
        const edges = graph.getEdges()
        onUpdate({
          nodes,
          links: edges,
          algorithm,
          stats: {
            totalPages: nodes.length,
            totalLinks: edges.length,
            depth: Math.max(...nodes.map((n) => n.depth), 0),
            duplicatesRemoved,
            crawlTime: Math.round((Date.now() - startTime) / 1000),
            averageLinksPerPage: edges.length / Math.max(nodes.length, 1),
            algorithm,
          },
        })
      }
    }

    const nodes = graph.getAllNodes()
    const edges = graph.getEdges()
    const crawlTime = (Date.now() - startTime) / 1000

    return {
      nodes,
      links: edges,
      algorithm,
      stats: {
        totalPages: nodes.length,
        totalLinks: edges.length,
        depth: Math.max(...nodes.map((n) => n.depth), 0),
        duplicatesRemoved,
        crawlTime: Math.round(crawlTime),
        averageLinksPerPage: edges.length / Math.max(nodes.length, 1),
        algorithm,
      },
    }
  } catch (error) {
    console.error("Crawl error:", error)
    throw error
  }
}

function extractTitleFromUrl(url: string): string {
  try {
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split("/").filter((p) => p)
    return pathParts[pathParts.length - 1] || urlObj.hostname || "Page"
  } catch {
    return "Page"
  }
}

async function fetchAndExtractLinks(url: string, timeout: number): Promise<{ urls: string[]; pageText: string }> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 DSA-Crawler/1.0" },
    })

    if (!response.ok) throw new Error(`HTTP ${response.status}`)

    const html = await response.text()

    // Use cheerio instead of DOMParser
    const $ = cheerio.load(html)

    // Extract all links
    const links: string[] = []
    $('a').each((_, element) => {
      const href = $(element).attr('href')
      if (href) links.push(href)
    })

    // Extract text content
    const text = $('body').text() || ''

    return { urls: links, pageText: text }
  } finally {
    clearTimeout(timeoutId)
  }
}

function isSameDomain(url: string, baseUrl: string): boolean {
  try {
    const urlObj = new URL(url)
    const baseObj = new URL(baseUrl)
    return urlObj.hostname === baseObj.hostname
  } catch {
    return false
  }
}

export { Graph }
