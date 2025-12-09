"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface AlgorithmComparisonProps {
  data?: {
    nodes: Array<{id: string, url: string, depth: number}>
    algorithm: string
  }
}

export default function AlgorithmComparison({ data }: AlgorithmComparisonProps) {
  if (!data) return null;

  const nodesByDepth = data.nodes.reduce((acc, node) => {
    if (!acc[node.depth]) acc[node.depth] = [];
    acc[node.depth].push(node);
    return acc;
  }, {} as Record<number, typeof data.nodes>);

  const maxDepth = Math.max(...Object.keys(nodesByDepth).map(Number));

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">
        Algorithm Results: {data.algorithm.toUpperCase()}
      </h3>
      
      <Tabs defaultValue="traversal" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="traversal">Traversal Order</TabsTrigger>
          <TabsTrigger value="depth">By Depth Levels</TabsTrigger>
        </TabsList>
        
        <TabsContent value="traversal" className="space-y-4">
          <div className="text-sm text-muted-foreground mb-2">
            Order in which pages were discovered:
          </div>
          <div className="flex flex-wrap gap-2">
            {data.nodes.map((node, index) => (
              <Badge key={node.id} variant="outline" className="text-xs">
                {index + 1}. {new URL(node.url).pathname || '/'}
              </Badge>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="depth" className="space-y-4">
          <div className="text-sm text-muted-foreground mb-2">
            Pages grouped by depth level:
          </div>
          {Array.from({length: maxDepth + 1}, (_, depth) => (
            <div key={depth} className="space-y-2">
              <div className="font-medium text-sm">Depth {depth}:</div>
              <div className="flex flex-wrap gap-2">
                {(nodesByDepth[depth] || []).map(node => (
                  <Badge key={node.id} variant="secondary" className="text-xs">
                    {new URL(node.url).pathname || '/'}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>
      
      <div className="mt-4 p-3 bg-muted/50 rounded-lg">
        <div className="text-xs font-medium mb-2">Algorithm Characteristics:</div>
        <div className="text-xs text-muted-foreground">
          {data.algorithm === 'bfs' ? (
            <div>
              <div>• Explores pages level by level (breadth-first)</div>
              <div>• Good for finding pages close to the starting URL</div>
              <div>• Guarantees shortest path to each page</div>
            </div>
          ) : (
            <div>
              <div>• Explores deep paths before backtracking (depth-first)</div>
              <div>• May quickly find deeply nested content</div>
              <div>• More memory efficient for deep websites</div>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
