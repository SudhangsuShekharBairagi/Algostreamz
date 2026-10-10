/**
 * Pure Graph Step Generators for BFS, DFS, and Dijkstra's Shortest Path algorithms.
 * Generates immutable snapshot steps for node states, edge states, live distance tables, and shortest paths.
 */

export function createDefaultGraph() {
  const nodes = [
    { id: 'A', label: 'A', x: 140, y: 100 },
    { id: 'B', label: 'B', x: 360, y: 80 },
    { id: 'C', label: 'C', x: 180, y: 260 },
    { id: 'D', label: 'D', x: 440, y: 240 },
    { id: 'E', label: 'E', x: 620, y: 120 },
    { id: 'F', label: 'F', x: 650, y: 280 },
  ]

  const edges = [
    { id: 'A-B', source: 'A', target: 'B', weight: 4 },
    { id: 'A-C', source: 'A', target: 'C', weight: 2 },
    { id: 'B-C', source: 'B', target: 'C', weight: 1 },
    { id: 'B-D', source: 'B', target: 'D', weight: 5 },
    { id: 'B-E', source: 'B', target: 'E', weight: 3 },
    { id: 'C-D', source: 'C', target: 'D', weight: 8 },
    { id: 'C-F', source: 'C', target: 'F', weight: 10 },
    { id: 'D-E', source: 'D', target: 'E', weight: 2 },
    { id: 'D-F', source: 'D', target: 'F', weight: 6 },
    { id: 'E-F', source: 'E', target: 'F', weight: 3 },
  ]

  return { nodes, edges }
}

export const GRAPH_PSEUDOCODES = {
  bfs: [
    { line: 1, indent: 0, text: 'procedure BFS(Graph, start_node)' },
    { line: 2, indent: 1, text: 'let Q be a queue' },
    { line: 3, indent: 1, text: 'label start_node as visited; Q.enqueue(start_node)' },
    { line: 4, indent: 1, text: 'while Q is not empty do' },
    { line: 5, indent: 2, text: 'u := Q.dequeue(); visit(u)' },
    { line: 6, indent: 2, text: 'for all edges (u, v) in Graph do' },
    { line: 7, indent: 3, text: 'if v is not visited then' },
    { line: 8, indent: 4, text: 'label v as visited; parent[v] := u; Q.enqueue(v)' },
  ],
  dfs: [
    { line: 1, indent: 0, text: 'procedure DFS(Graph, u)' },
    { line: 2, indent: 1, text: 'label u as visited; visit(u)' },
    { line: 3, indent: 1, text: 'for all directed edges from u to v do' },
    { line: 4, indent: 2, text: 'if v is not visited then' },
    { line: 5, indent: 3, text: 'parent[v] := u' },
    { line: 6, indent: 3, text: 'DFS(Graph, v)' },
  ],
  dijkstra: [
    { line: 1, indent: 0, text: 'procedure Dijkstra(Graph, start_node)' },
    { line: 2, indent: 1, text: 'for each node v in Graph: dist[v] := ∞, parent[v] := null' },
    { line: 3, indent: 1, text: 'dist[start_node] := 0' },
    { line: 4, indent: 1, text: 'while unvisited nodes remain do' },
    { line: 5, indent: 2, text: 'u := unvisited node with min dist[u]' },
    { line: 6, indent: 2, text: 'if dist[u] == ∞ break' },
    { line: 7, indent: 2, text: 'for each neighbor v of u do' },
    { line: 8, indent: 3, text: 'alt := dist[u] + weight(u, v)' },
    { line: 9, indent: 3, text: 'if alt < dist[v] then dist[v] := alt, parent[v] := u' },
  ],
}

function getAdjacency(nodes, edges) {
  const adj = {}
  nodes.forEach((n) => {
    adj[n.id] = []
  })
  edges.forEach((e) => {
    if (adj[e.source]) adj[e.source].push({ target: e.target, weight: e.weight, edgeId: e.id })
    if (adj[e.target]) adj[e.target].push({ target: e.source, weight: e.weight, edgeId: e.id })
  })
  return adj
}

function makeGraphStep(
  stepIndex,
  type,
  nodes,
  edges,
  activeNodeId = null,
  activeEdgeId = null,
  visitedNodes = [],
  distances = {},
  predecessors = {},
  nodeStates = {},
  edgeStates = {},
  shortestPathEdges = [],
  pseudocodeLine = 1,
  beginner = '',
  technical = '',
  stats = { comparisons: 0, swaps: 0, arrayAccesses: 0 }
) {
  return {
    stepIndex,
    type,
    nodes: nodes.map((n) => ({ ...n })),
    edges: edges.map((e) => ({ ...e })),
    activeNodeId,
    activeEdgeId,
    visitedNodes: [...visitedNodes],
    distances: { ...distances },
    predecessors: { ...predecessors },
    nodeStates: { ...nodeStates },
    edgeStates: { ...edgeStates },
    shortestPathEdges: [...shortestPathEdges],
    pseudocodeLine,
    explanation: { beginner, technical },
    stats: { ...stats },
  }
}

/**
 * Pure generator function for BFS steps.
 */
export function generateBfsSteps(nodes = [], edges = [], startNodeId = 'A') {
  const steps = []
  if (!nodes.length) return steps

  const startId = nodes.some((n) => n.id === startNodeId) ? startNodeId : nodes[0]?.id
  if (!startId) return steps

  const adj = getAdjacency(nodes, edges)
  const stats = { comparisons: 0, swaps: 0, arrayAccesses: 0 }

  const distances = {}
  const predecessors = {}
  nodes.forEach((n) => {
    distances[n.id] = n.id === startId ? 0 : Infinity
    predecessors[n.id] = null
  })

  steps.push(
    makeGraphStep(
      0,
      'init',
      nodes,
      edges,
      startId,
      null,
      [startId],
      distances,
      predecessors,
      { [startId]: 'active' },
      {},
      [],
      3,
      `Starting BFS traversal from Node ${startId}.`,
      `Initialize Queue Q = [${startId}]. Set distance[${startId}] = 0.`,
      stats
    )
  )

  const queue = [startId]
  const visited = new Set([startId])
  const visitedOrder = [startId]
  const nodeStates = { [startId]: 'active' }
  const edgeStates = {}

  while (queue.length > 0) {
    const u = queue.shift()
    nodeStates[u] = 'active'
    stats.arrayAccesses++

    steps.push(
      makeGraphStep(
        steps.length,
        'visit',
        nodes,
        edges,
        u,
        null,
        visitedOrder,
        distances,
        predecessors,
        { ...nodeStates },
        { ...edgeStates },
        [],
        5,
        `Dequeued and visiting Node ${u}.`,
        `Q.dequeue() returned Node ${u}.`,
        stats
      )
    )

    const neighbors = adj[u] || []
    for (const neighbor of neighbors) {
      const v = neighbor.target
      const edgeId = neighbor.edgeId
      stats.comparisons++

      edgeStates[edgeId] = 'comparing'
      steps.push(
        makeGraphStep(
          steps.length,
          'explore-edge',
          nodes,
          edges,
          u,
          edgeId,
          visitedOrder,
          distances,
          predecessors,
          { ...nodeStates },
          { ...edgeStates },
          [],
          6,
          `Checking edge from ${u} to ${v}.`,
          `Explore neighbor ${v} connected by edge ${edgeId}.`,
          stats
        )
      )

      if (!visited.has(v)) {
        visited.add(v)
        visitedOrder.push(v)
        queue.push(v)
        distances[v] = distances[u] + 1
        predecessors[v] = u
        nodeStates[v] = 'found'
        edgeStates[edgeId] = 'sorted'

        steps.push(
          makeGraphStep(
            steps.length,
            'discover',
            nodes,
            edges,
            v,
            edgeId,
            visitedOrder,
            distances,
            predecessors,
            { ...nodeStates },
            { ...edgeStates },
            [],
            8,
            `Discovered unvisited Node ${v} via ${u}. Updated distance = ${distances[v]}.`,
            `Mark ${v} visited; set parent[${v}] = ${u}; Q.enqueue(${v}).`,
            stats
          )
        )
      }
    }

    nodeStates[u] = 'sorted'
  }

  steps.push(
    makeGraphStep(
      steps.length,
      'complete',
      nodes,
      edges,
      null,
      null,
      visitedOrder,
      distances,
      predecessors,
      nodeStates,
      edgeStates,
      [],
      1,
      `BFS Traversal complete! Visited nodes: [${visitedOrder.join(', ')}].`,
      `Queue is empty. BFS finished.`,
      stats
    )
  )

  return steps
}

/**
 * Pure generator function for DFS steps.
 */
export function generateDfsSteps(nodes = [], edges = [], startNodeId = 'A') {
  const steps = []
  if (!nodes.length) return steps

  const startId = nodes.some((n) => n.id === startNodeId) ? startNodeId : nodes[0]?.id
  if (!startId) return steps

  const adj = getAdjacency(nodes, edges)
  const stats = { comparisons: 0, swaps: 0, arrayAccesses: 0 }

  const distances = {}
  const predecessors = {}
  nodes.forEach((n) => {
    distances[n.id] = n.id === startId ? 0 : Infinity
    predecessors[n.id] = null
  })

  steps.push(
    makeGraphStep(
      0,
      'init',
      nodes,
      edges,
      startId,
      null,
      [],
      distances,
      predecessors,
      {},
      {},
      [],
      1,
      `Starting DFS traversal from Node ${startId}.`,
      `Initialize DFS search routine at Node ${startId}.`,
      stats
    )
  )

  const visited = new Set()
  const visitedOrder = []
  const nodeStates = {}
  const edgeStates = {}

  function dfsRec(u, depth = 0) {
    visited.add(u)
    visitedOrder.push(u)
    nodeStates[u] = 'active'
    distances[u] = depth
    stats.arrayAccesses++

    steps.push(
      makeGraphStep(
        steps.length,
        'visit',
        nodes,
        edges,
        u,
        null,
        visitedOrder,
        distances,
        predecessors,
        { ...nodeStates },
        { ...edgeStates },
        [],
        2,
        `Visited Node ${u} (depth ${depth}).`,
        `Label ${u} as visited and process node.`,
        stats
      )
    )

    const neighbors = adj[u] || []
    for (const neighbor of neighbors) {
      const v = neighbor.target
      const edgeId = neighbor.edgeId
      stats.comparisons++

      if (!visited.has(v)) {
        predecessors[v] = u
        edgeStates[edgeId] = 'sorted'
        steps.push(
          makeGraphStep(
            steps.length,
            'traverse-edge',
            nodes,
            edges,
            v,
            edgeId,
            visitedOrder,
            distances,
            predecessors,
            { ...nodeStates },
            { ...edgeStates },
            [],
            4,
            `Traversing unvisited edge (${u} → ${v}).`,
            `Branch deeper into neighbor ${v}.`,
            stats
          )
        )
        dfsRec(v, depth + 1)
      }
    }

    nodeStates[u] = 'sorted'
  }

  dfsRec(startId, 0)

  steps.push(
    makeGraphStep(
      steps.length,
      'complete',
      nodes,
      edges,
      null,
      null,
      visitedOrder,
      distances,
      predecessors,
      nodeStates,
      edgeStates,
      [],
      1,
      `DFS Traversal complete! Visited sequence: [${visitedOrder.join(', ')}].`,
      `All accessible nodes explored in depth-first order.`,
      stats
    )
  )

  return steps
}

/**
 * Pure generator function for Dijkstra's Shortest Path steps.
 */
export function generateDijkstraSteps(nodes = [], edges = [], startNodeId = 'A', targetNodeId = 'F') {
  const steps = []
  if (!nodes.length) return steps

  const startId = nodes.some((n) => n.id === startNodeId) ? startNodeId : nodes[0]?.id
  const targetId = nodes.some((n) => n.id === targetNodeId) ? targetNodeId : nodes[nodes.length - 1]?.id
  if (!startId || !targetId) return steps

  const adj = getAdjacency(nodes, edges)
  const stats = { comparisons: 0, swaps: 0, arrayAccesses: 0 }

  const distances = {}
  const predecessors = {}
  const unvisited = new Set()

  nodes.forEach((n) => {
    distances[n.id] = n.id === startId ? 0 : Infinity
    predecessors[n.id] = null
    unvisited.add(n.id)
  })

  steps.push(
    makeGraphStep(
      0,
      'init',
      nodes,
      edges,
      startId,
      null,
      [],
      distances,
      predecessors,
      { [startId]: 'active' },
      {},
      [],
      2,
      `Starting Dijkstra's Shortest Path from ${startId} to ${targetId}.`,
      `Set dist[${startId}] = 0, all other nodes = ∞.`,
      stats
    )
  )

  const visitedOrder = []
  const nodeStates = {}
  const edgeStates = {}

  while (unvisited.size > 0) {
    // Find unvisited node with smallest tentative distance
    let u = null
    let minDist = Infinity
    for (const nodeId of unvisited) {
      if (distances[nodeId] < minDist) {
        minDist = distances[nodeId]
        u = nodeId
      }
    }

    if (!u || minDist === Infinity) break

    unvisited.delete(u)
    visitedOrder.push(u)
    nodeStates[u] = 'active'
    stats.arrayAccesses++

    steps.push(
      makeGraphStep(
        steps.length,
        'select-min',
        nodes,
        edges,
        u,
        null,
        visitedOrder,
        distances,
        predecessors,
        { ...nodeStates },
        { ...edgeStates },
        [],
        5,
        `Selected Node ${u} with minimum distance = ${minDist}.`,
        `Node ${u} extracted from unvisited set.`,
        stats
      )
    )

    if (u === targetId) {
      // Reconstruct shortest path from target back to start
      const pathNodes = []
      const shortestPathEdges = []
      const visitedInPath = new Set()
      let curr = targetId
      while (curr && !visitedInPath.has(curr)) {
        visitedInPath.add(curr)
        pathNodes.unshift(curr)
        const parentNode = predecessors[curr]
        if (parentNode) {
          const edge = edges.find(
            (e) =>
              (e.source === parentNode && e.target === curr) ||
              (e.target === parentNode && e.source === curr)
          )
          if (edge) shortestPathEdges.unshift(edge.id)
        }
        curr = parentNode
      }

      // Mark shortest path nodes and edges in state-sorted green
      pathNodes.forEach((nId) => {
        nodeStates[nId] = 'found'
      })
      shortestPathEdges.forEach((eId) => {
        edgeStates[eId] = 'sorted'
      })

      steps.push(
        makeGraphStep(
          steps.length,
          'shortest-path',
          nodes,
          edges,
          targetId,
          null,
          visitedOrder,
          distances,
          predecessors,
          { ...nodeStates },
          { ...edgeStates },
          shortestPathEdges,
          9,
          `Shortest path from ${startId} to ${targetId} found! Total distance = ${distances[targetId]}. Path: [${pathNodes.join(' → ')}].`,
          `Reconstructed shortest path via predecessor pointers.`,
          stats
        )
      )
      return steps
    }

    const neighbors = adj[u] || []
    for (const neighbor of neighbors) {
      const v = neighbor.target
      const weight = neighbor.weight
      const edgeId = neighbor.edgeId
      stats.comparisons++

      if (unvisited.has(v)) {
        const alt = distances[u] + weight
        edgeStates[edgeId] = 'comparing'

        steps.push(
          makeGraphStep(
            steps.length,
            'check-edge',
            nodes,
            edges,
            u,
            edgeId,
            visitedOrder,
            distances,
            predecessors,
            { ...nodeStates },
            { ...edgeStates },
            [],
            8,
            `Checking edge (${u} — ${v}, weight ${weight}). Tentative distance = ${distances[u]} + ${weight} = ${alt}.`,
            `Compare alt = ${alt} with current dist[${v}] = ${distances[v]}.`,
            stats
          )
        )

        if (alt < distances[v]) {
          distances[v] = alt
          predecessors[v] = u
          stats.swaps++

          steps.push(
            makeGraphStep(
              steps.length,
              'relax-edge',
              nodes,
              edges,
              v,
              edgeId,
              visitedOrder,
              distances,
              predecessors,
              { ...nodeStates },
              { ...edgeStates },
              [],
              9,
              `Relaxed edge! Updated dist[${v}] = ${alt}, predecessor[${v}] = ${u}.`,
              `Updated dist[${v}] to ${alt} via parent ${u}.`,
              stats
            )
          )
        }
      }
    }

    nodeStates[u] = 'sorted'
  }

  // General completion step if target not explicitly hit
  steps.push(
    makeGraphStep(
      steps.length,
      'complete',
      nodes,
      edges,
      null,
      null,
      visitedOrder,
      distances,
      predecessors,
      nodeStates,
      edgeStates,
      [],
      1,
      `Dijkstra algorithm completed for graph from ${startId}.`,
      `Computed shortest path tree from root ${startId}.`,
      stats
    )
  )

  return steps
}
