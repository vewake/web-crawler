"use client"

import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { performAdvancedSearch, type SearchOptions } from "@/lib/advanced-keywords"
import { Search } from "lucide-react"

interface SearchPanelProps {
  data: {
    nodes: Array<{
      id: string;
      url: string;
      title: string;
      keywords: string[];
      keywordAnalysis?: any;
      contentScore?: number;
      pageText?: string;
    }>
    links: Array<{ source: string; target: string }>
  }
}

export default function SearchPanel({ data }: SearchPanelProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [results, setResults] = useState<any[]>([])

  // Create comprehensive keyword index
  const keywordStats = useMemo(() => {
    const allKeywords = new Map<string, number>();
    const techKeywords = new Map<string, number>();
    const businessKeywords = new Map<string, number>();
    const entities = new Map<string, number>();

    data.nodes.forEach(node => {
      // Regular keywords
      node.keywords.forEach(kw => {
        allKeywords.set(kw, (allKeywords.get(kw) || 0) + 1);
      });

      // Advanced keywords if available
      if (node.keywordAnalysis) {
        node.keywordAnalysis.technical?.forEach((kw: string) => {
          techKeywords.set(kw, (techKeywords.get(kw) || 0) + 1);
        });
        node.keywordAnalysis.business?.forEach((kw: string) => {
          businessKeywords.set(kw, (businessKeywords.get(kw) || 0) + 1);
        });
        node.keywordAnalysis.entities?.forEach((kw: string) => {
          entities.set(kw, (entities.get(kw) || 0) + 1);
        });
      }
    });

    return {
      all: Array.from(allKeywords.entries()).sort((a, b) => b[1] - a[1]).slice(0, 20),
      technical: Array.from(techKeywords.entries()).sort((a, b) => b[1] - a[1]).slice(0, 15),
      business: Array.from(businessKeywords.entries()).sort((a, b) => b[1] - a[1]).slice(0, 15),
      entities: Array.from(entities.entries()).sort((a, b) => b[1] - a[1]).slice(0, 15)
    };
  }, [data.nodes]);

  const performSearch = (query: string = searchQuery) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const searchOptions: SearchOptions = {
      query: query,
      algorithm: "fuzzy",
      fields: ["title", "url", "keywords", "content"],
      minScore: 1, // Little accurate - filter out very low relevance
      category: "all"
    };

    const searchResults = performAdvancedSearch(data.nodes, searchOptions);
    setResults(searchResults);
  };

  const handleKeywordClick = (keyword: string) => {
    setSearchQuery(keyword);
    performSearch(keyword);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-card border-border/50 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
          <Search className="w-4 h-4" />
          Search & Explore
        </h3>

        <Tabs defaultValue="search" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="search">Search</TabsTrigger>
            <TabsTrigger value="explore">Explore Keywords</TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Search pages, keywords, or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && performSearch()}
                className="flex-1"
              />
              <Button onClick={() => performSearch()}>
                Search
              </Button>
            </div>

            <div className="text-xs text-muted-foreground">
              <p>Using fuzzy search to find relevant content across titles, URLs, and keywords.</p>
            </div>
          </TabsContent>

          <TabsContent value="explore" className="space-y-6">
            <div className="grid gap-6">
              <div>
                <h4 className="font-medium text-sm mb-3 text-muted-foreground">Top Keywords</h4>
                <div className="flex flex-wrap gap-2">
                  {keywordStats.all.slice(0, 10).map(([keyword, count]) => (
                    <Badge
                      key={keyword}
                      variant="secondary"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                      onClick={() => handleKeywordClick(keyword)}
                    >
                      {keyword} ({count})
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm mb-2 text-muted-foreground">Technical Terms</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {keywordStats.technical.slice(0, 8).map(([keyword, count]) => (
                      <Badge
                        key={keyword}
                        variant="outline"
                        className="cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                        onClick={() => handleKeywordClick(keyword)}
                      >
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-2 text-muted-foreground">Business Terms</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {keywordStats.business.slice(0, 8).map(([keyword, count]) => (
                      <Badge
                        key={keyword}
                        variant="outline"
                        className="cursor-pointer hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                        onClick={() => handleKeywordClick(keyword)}
                      >
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      {results.length > 0 && (
        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h4 className="font-semibold text-foreground flex items-center justify-between">
            <span>Results</span>
            <Badge variant="secondary" className="text-xs font-normal">
              {results.length} found
            </Badge>
          </h4>

          <div className="grid gap-3">
            {results.map((result) => {
              const { node, score, matches } = result;
              return (
                <Card key={node.id} className="p-4 bg-card hover:bg-accent/5 transition-colors border-border/50">
                  <div className="flex items-start justify-between mb-2">
                    <a
                      href={node.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline font-medium truncate block flex-1"
                    >
                      {node.title || new URL(node.url).pathname}
                    </a>
                    <Badge variant={score > 10 ? "default" : "secondary"} className="ml-2 text-[10px]">
                      {Math.round(score)}% match
                    </Badge>
                  </div>

                  <p className="text-xs text-muted-foreground truncate mb-2 font-mono">{node.url}</p>

                  {matches.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {matches.map((field: string) => (
                        <Badge key={field} variant="outline" className="text-[10px] px-1.5 py-0 h-5">
                          Matched in {field}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {node.keywords.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {node.keywords.slice(0, 4).map((kw: string, i: number) => (
                        <span key={i} className="text-[10px] text-muted-foreground bg-secondary/50 px-1.5 py-0.5 rounded-sm">
                          #{kw}
                        </span>
                      ))}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {searchQuery && results.length === 0 && (
        <Card className="p-8 bg-card border-dashed text-center">
          <div className="text-muted-foreground">
            <p className="font-medium">No results found for "{searchQuery}"</p>
            <p className="text-sm mt-1">Try checking for typos or using broader keywords.</p>
          </div>
        </Card>
      )}
    </div>
  )
}
