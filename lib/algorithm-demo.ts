/**
 * Algorithm Demo - Shows how BFS vs DFS work in web crawling
 */

// Example website structure:
//        A (homepage)
//       / \
//      B   C
//     /   / \
//    D   E   F
//       /
//      G

const demoData = {
  A: ['B', 'C'],
  B: ['D'],
  C: ['E', 'F'],
  D: [],
  E: ['G'],
  F: [],
  G: []
};

export function demonstrateBFS(startNode: string = 'A'): string[] {
  const visited = new Set<string>();
  const queue = [startNode];
  const result: string[] = [];

  while (queue.length > 0) {
    const node = queue.shift()!;
    if (visited.has(node)) continue;

    visited.add(node);
    result.push(node);

    // Add children to queue (FIFO - First In, First Out)
    const children = demoData[node as keyof typeof demoData] || [];
    children.forEach(child => {
      if (!visited.has(child)) {
        queue.push(child);
      }
    });
  }

  return result;
}

export function demonstrateDFS(startNode: string = 'A'): string[] {
  const visited = new Set<string>();
  const result: string[] = [];

  const dfs = (node: string) => {
    if (visited.has(node)) return;
    
    visited.add(node);
    result.push(node);

    // Visit children recursively (goes deep first)
    const children = demoData[node as keyof typeof demoData] || [];
    children.forEach(child => dfs(child));
  };

  dfs(startNode);
  return result;
}

export function getAlgorithmComparison() {
  const bfsResult = demonstrateBFS();
  const dfsResult = demonstrateDFS();

  return {
    bfs: {
      order: bfsResult,
      description: 'Explores all neighbors at current depth before moving to next level',
      characteristics: [
        'Level-by-level exploration',
        'Finds shortest paths',
        'Good for finding pages close to start',
        'Uses more memory (queue grows wide)'
      ]
    },
    dfs: {
      order: dfsResult,
      description: 'Explores as far as possible before backtracking',
      characteristics: [
        'Goes deep into each branch',
        'May find distant pages quickly',
        'Good for complete path exploration', 
        'Uses less memory (stack grows deep)'
      ]
    }
  };
}
