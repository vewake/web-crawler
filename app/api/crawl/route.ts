import { type NextRequest, NextResponse } from "next/server"
import { crawlWebsite, type CrawlAlgorithm } from "@/lib/graph-crawler"

export async function POST(request: NextRequest) {
  try {
    const { sourceUrl, maxDepth, maxPages, algorithm } = await request.json()

    if (!sourceUrl) {
      return NextResponse.json({ error: "Source URL required" }, { status: 400 })
    }

    const crawlAlgorithm: CrawlAlgorithm = algorithm === 'dfs' ? 'dfs' : 'bfs';
    const maxPagesLimit = Math.min(maxPages || 50, 500)
    const encoder = new TextEncoder()

    const stream = new ReadableStream({
      async start(controller) {
        let isControllerClosed = false;

        const safeEnqueue = (data: string) => {
          if (!isControllerClosed) {
            try {
              controller.enqueue(encoder.encode(data));
            } catch (error) {
              console.error('Controller enqueue error:', error);
              isControllerClosed = true;
            }
          }
        };

        try {
          const result = await crawlWebsite(
            sourceUrl,
            Math.min(maxDepth || 3, 50),
            Math.min(maxPages || 50, 1000),
            crawlAlgorithm,
            (update) => {
              // Send real-time updates
              const data = `data: ${JSON.stringify({ type: "update", data: update })}\n\n`;
              safeEnqueue(data);
            },
          )

          const completeData = `data: ${JSON.stringify({ type: "complete", data: result })}\n\n`;
          safeEnqueue(completeData);

          if (!isControllerClosed) {
            controller.close();
            isControllerClosed = true;
          }
        } catch (error) {
          console.error("Crawl error:", error);
          const errorData = `data: ${JSON.stringify({
            type: "error",
            error: error instanceof Error ? error.message : "Crawl failed",
          })}\n\n`;
          safeEnqueue(errorData);

          if (!isControllerClosed) {
            controller.close();
            isControllerClosed = true;
          }
        }
      },
    })

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Crawl failed" }, { status: 500 })
  }
}
