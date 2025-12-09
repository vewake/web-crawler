/**
 * Algorithms for Web Crawler Analysis
 */

export function topologicalSort(graph: Map<string, string[]>): string[] {
  const visited = new Set<string>()
  const stack: string[] = []

  const dfs = (node: string) => {
    visited.add(node)
    const neighbors = graph.get(node) || []
    neighbors.forEach((neighbor) => {
      if (!visited.has(neighbor)) {
        dfs(neighbor)
      }
    })
    stack.push(node)
  }

  graph.forEach((_, node) => {
    if (!visited.has(node)) {
      dfs(node)
    }
  })

  return stack.reverse()
}

export function findStronglyConnectedComponents(graph: Map<string, string[]>): string[][] {
  const visited = new Set<string>()
  const stack: string[] = []

  const dfs1 = (node: string) => {
    visited.add(node)
    const neighbors = graph.get(node) || []
    neighbors.forEach((neighbor) => {
      if (!visited.has(neighbor)) {
        dfs1(neighbor)
      }
    })
    stack.push(node)
  }

  graph.forEach((_, node) => {
    if (!visited.has(node)) {
      dfs1(node)
    }
  })

  const reverseGraph = new Map<string, string[]>()
  graph.forEach((neighbors, node) => {
    neighbors.forEach((neighbor) => {
      if (!reverseGraph.has(neighbor)) {
        reverseGraph.set(neighbor, [])
      }
      reverseGraph.get(neighbor)!.push(node)
    })
  })

  visited.clear()
  const components: string[][] = []

  const dfs2 = (node: string, component: string[]) => {
    visited.add(node)
    component.push(node)
    const neighbors = reverseGraph.get(node) || []
    neighbors.forEach((neighbor) => {
      if (!visited.has(neighbor)) {
        dfs2(neighbor, component)
      }
    })
  }

  while (stack.length > 0) {
    const node = stack.pop()!
    if (!visited.has(node)) {
      const component: string[] = []
      dfs2(node, component)
      components.push(component)
    }
  }

  return components
}

export function calculatePageRank(
  nodes: string[],
  edges: Array<{ source: string; target: string }>,
  iterations = 10,
  dampingFactor = 0.85,
): Map<string, number> {
  const rank = new Map<string, number>()
  const newRank = new Map<string, number>()
  const outgoing = new Map<string, number>()

  const initialRank = 1 / nodes.length
  nodes.forEach((node) => {
    rank.set(node, initialRank)
    newRank.set(node, 0)
    outgoing.set(node, 0)
  })

  edges.forEach((edge) => {
    outgoing.set(edge.source, (outgoing.get(edge.source) || 0) + 1)
  })

  for (let i = 0; i < iterations; i++) {
    nodes.forEach((node) => newRank.set(node, (1 - dampingFactor) / nodes.length))

    edges.forEach((edge) => {
      const sourceRank = rank.get(edge.source) || 0
      const sourceOutgoing = outgoing.get(edge.source) || 1
      const transfer = (dampingFactor * sourceRank) / sourceOutgoing
      newRank.set(edge.target, (newRank.get(edge.target) || 0) + transfer)
    })

    nodes.forEach((node) => rank.set(node, newRank.get(node) || 0))
  }

  return rank
}
