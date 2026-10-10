/**
 * Pure Binary Search Tree (BST) step generators.
 * Performs insert, search, delete, and traversals on immutable BST snapshots.
 */

export function createBstNode(value, id = null) {
  return {
    id: id || `node-${value}-${Math.random().toString(36).substr(2, 5)}`,
    value: Number(value),
    left: null,
    right: null,
  }
}

/**
 * Deep clones a BST node structure.
 */
export function cloneTree(root) {
  if (!root) return null
  return {
    id: root.id,
    value: root.value,
    left: cloneTree(root.left),
    right: cloneTree(root.right),
  }
}

/**
 * Pure insertion helper for initial default tree build.
 */
function insertValuePure(root, val) {
  if (!root) return createBstNode(val, `node-${val}`)
  if (val < root.value) {
    root.left = insertValuePure(root.left, val)
  } else if (val > root.value) {
    root.right = insertValuePure(root.right, val)
  }
  return root
}

/**
 * Computes initial default BST [50, 30, 70, 20, 40, 60, 80]
 */
export function createDefaultBst() {
  const values = [50, 30, 70, 20, 40, 60, 80]
  let root = null
  values.forEach((val) => {
    root = insertValuePure(root, val)
  })
  return root
}

/**
 * Calculates (x, y) layout coordinates for all nodes in the tree.
 * Uses in-order indexing and depth level to prevent overlapping branches.
 */
export function calculateTreeLayout(root, svgWidth = 800, svgHeight = 380, nodeRadius = 22) {
  if (!root) return { nodes: [], links: [], viewWidth: svgWidth, viewHeight: svgHeight }

  let inOrderCounter = 0
  let maxDepth = 0
  const nodesList = []

  function assignInOrder(node, depth = 0) {
    if (!node) return
    if (depth > maxDepth) maxDepth = depth
    assignInOrder(node.left, depth + 1)

    node.inOrderIdx = inOrderCounter++
    node.depth = depth
    nodesList.push(node)

    assignInOrder(node.right, depth + 1)
  }

  assignInOrder(root)

  const totalNodes = nodesList.length
  const paddingX = Math.max(44, nodeRadius * 2)
  const paddingY = 48

  const usableWidth = Math.max(svgWidth - paddingX * 2, totalNodes * nodeRadius * 2.8)
  const stepX = totalNodes > 1 ? usableWidth / (totalNodes - 1) : 0
  const stepY = maxDepth > 0 ? Math.min(75, Math.max(55, (svgHeight - paddingY * 2) / maxDepth)) : 0

  const layoutMap = new Map()

  nodesList.forEach((node) => {
    const x = totalNodes === 1 ? svgWidth / 2 : paddingX + node.inOrderIdx * stepX
    const y = paddingY + node.depth * stepY
    layoutMap.set(node.id, {
      id: node.id,
      value: node.value,
      x: Math.round(x * 10) / 10,
      y: Math.round(y * 10) / 10,
      depth: node.depth,
    })
  })

  // Calculate links between parent and children
  const links = []
  function collectLinks(node) {
    if (!node) return
    const pPos = layoutMap.get(node.id)

    const addEdge = (childNode) => {
      if (!childNode) return
      const cPos = layoutMap.get(childNode.id)
      const dx = cPos.x - pPos.x
      const dy = cPos.y - pPos.y
      const dist = Math.hypot(dx, dy) || 1

      // Trim line start and end at node boundaries
      const x1 = pPos.x + (dx / dist) * nodeRadius
      const y1 = pPos.y + (dy / dist) * nodeRadius
      const x2 = cPos.x - (dx / dist) * nodeRadius
      const y2 = cPos.y - (dy / dist) * nodeRadius

      links.push({
        id: `link-${node.id}-${childNode.id}`,
        parentId: node.id,
        childId: childNode.id,
        x1: Math.round(x1 * 10) / 10,
        y1: Math.round(y1 * 10) / 10,
        x2: Math.round(x2 * 10) / 10,
        y2: Math.round(y2 * 10) / 10,
      })
    }

    if (node.left) {
      addEdge(node.left)
      collectLinks(node.left)
    }
    if (node.right) {
      addEdge(node.right)
      collectLinks(node.right)
    }
  }

  collectLinks(root)

  return {
    nodes: Array.from(layoutMap.values()),
    links,
    viewWidth: Math.max(svgWidth, usableWidth + paddingX * 2),
    viewHeight: Math.max(svgHeight, paddingY * 2 + maxDepth * stepY + 60),
  }
}

function makeBstStep(
  stepIndex,
  type,
  treeRoot,
  activeNodeId = null,
  visitedOrder = [],
  visitSequenceMap = {},
  nodeStates = {},
  pseudocodeLine = 1,
  beginner = '',
  technical = '',
  stats = { comparisons: 0, swaps: 0, arrayAccesses: 0 }
) {
  return {
    stepIndex,
    type,
    tree: cloneTree(treeRoot),
    activeNodeId,
    visitedOrder: [...visitedOrder],
    visitSequenceMap: { ...visitSequenceMap },
    nodeStates: { ...nodeStates },
    pseudocodeLine,
    explanation: { beginner, technical },
    stats: { ...stats },
  }
}

// Pseudocode line mappings for BST operations
export const BST_PSEUDOCODES = {
  insert: [
    { line: 1, indent: 0, text: 'procedure insert(root, val)' },
    { line: 2, indent: 1, text: 'if root is null return createNode(val)' },
    { line: 3, indent: 1, text: 'if val < root.value then' },
    { line: 4, indent: 2, text: 'root.left := insert(root.left, val)' },
    { line: 5, indent: 1, text: 'else if val > root.value then' },
    { line: 6, indent: 2, text: 'root.right := insert(root.right, val)' },
    { line: 7, indent: 1, text: 'return root' },
  ],
  search: [
    { line: 1, indent: 0, text: 'procedure search(root, target)' },
    { line: 2, indent: 1, text: 'if root is null or root.value == target then' },
    { line: 3, indent: 2, text: 'return root' },
    { line: 4, indent: 1, text: 'if target < root.value then' },
    { line: 5, indent: 2, text: 'return search(root.left, target)' },
    { line: 6, indent: 1, text: 'else' },
    { line: 7, indent: 2, text: 'return search(root.right, target)' },
  ],
  delete: [
    { line: 1, indent: 0, text: 'procedure delete(root, val)' },
    { line: 2, indent: 1, text: 'if root is null return null' },
    { line: 3, indent: 1, text: 'if val < root.value: root.left := delete(root.left, val)' },
    { line: 4, indent: 1, text: 'else if val > root.value: root.right := delete(root.right, val)' },
    { line: 5, indent: 1, text: 'else (node found):' },
    { line: 6, indent: 2, text: 'if no children or 1 child: return child' },
    { line: 7, indent: 2, text: 'succ := minNode(root.right)' },
    { line: 8, indent: 2, text: 'root.value := succ.value' },
    { line: 9, indent: 2, text: 'root.right := delete(root.right, succ.value)' },
  ],
  inorder: [
    { line: 1, indent: 0, text: 'procedure inorder(node)' },
    { line: 2, indent: 1, text: 'if node is null return' },
    { line: 3, indent: 1, text: 'inorder(node.left)' },
    { line: 4, indent: 1, text: 'visit(node)' },
    { line: 5, indent: 1, text: 'inorder(node.right)' },
  ],
  preorder: [
    { line: 1, indent: 0, text: 'procedure preorder(node)' },
    { line: 2, indent: 1, text: 'if node is null return' },
    { line: 3, indent: 1, text: 'visit(node)' },
    { line: 4, indent: 1, text: 'preorder(node.left)' },
    { line: 5, indent: 1, text: 'preorder(node.right)' },
  ],
  postorder: [
    { line: 1, indent: 0, text: 'procedure postorder(node)' },
    { line: 2, indent: 1, text: 'if node is null return' },
    { line: 3, indent: 1, text: 'postorder(node.left)' },
    { line: 4, indent: 1, text: 'postorder(node.right)' },
    { line: 5, indent: 1, text: 'visit(node)' },
  ],
  levelorder: [
    { line: 1, indent: 0, text: 'procedure levelorder(root)' },
    { line: 2, indent: 1, text: 'Q := empty queue; Q.enqueue(root)' },
    { line: 3, indent: 1, text: 'while Q is not empty:' },
    { line: 4, indent: 2, text: 'curr := Q.dequeue(); visit(curr)' },
    { line: 5, indent: 2, text: 'if curr.left: Q.enqueue(curr.left)' },
    { line: 6, indent: 2, text: 'if curr.right: Q.enqueue(curr.right)' },
  ],
}

/**
 * Pure generator function for Insert step sequence.
 */
export function generateBstInsertSteps(initialRoot, value) {
  const steps = []
  const numVal = Number(value)
  let root = cloneTree(initialRoot)
  const stats = { comparisons: 0, swaps: 0, arrayAccesses: 0 }

  steps.push(
    makeBstStep(
      0,
      'init',
      root,
      null,
      [],
      {},
      {},
      1,
      `Starting insertion of value ${numVal}.`,
      `Initialize BST insertion for value ${numVal}.`,
      stats
    )
  )

  if (!root) {
    const newNode = createBstNode(numVal, `node-${numVal}`)
    root = newNode
    steps.push(
      makeBstStep(
        1,
        'inserted',
        root,
        newNode.id,
        [numVal],
        { [newNode.id]: 1 },
        { [newNode.id]: 'active' },
        2,
        `Tree was empty. Inserted ${numVal} as the root node.`,
        `Set root = new Node(${numVal}).`,
        stats
      )
    )
    return steps
  }

  let curr = root

  while (curr) {
    stats.comparisons++
    stats.arrayAccesses++
    const nodeStates = { [curr.id]: 'comparing' }

    if (numVal === curr.value) {
      steps.push(
        makeBstStep(
          steps.length,
          'exists',
          root,
          curr.id,
          [],
          {},
          { [curr.id]: 'found' },
          3,
          `Value ${numVal} already exists in the BST at node ${curr.value}.`,
          `Duplicate values are disallowed; node key ${numVal} matches target.`,
          stats
        )
      )
      return steps
    }

    if (numVal < curr.value) {
      steps.push(
        makeBstStep(
          steps.length,
          'compare-left',
          root,
          curr.id,
          [],
          {},
          nodeStates,
          3,
          `${numVal} < ${curr.value}. Moving left.`,
          `Compare ${numVal} with node key ${curr.value}. Branch left.`,
          stats
        )
      )
      if (!curr.left) {
        const newNode = createBstNode(numVal, `node-${numVal}`)
        curr.left = newNode
        steps.push(
          makeBstStep(
            steps.length,
            'inserted',
            root,
            newNode.id,
            [],
            {},
            { [newNode.id]: 'active' },
            4,
            `Inserted new node ${numVal} as the left child of ${curr.value}.`,
            `Linked new Node(${numVal}) to parent ${curr.value}.left.`,
            stats
          )
        )
        break
      }
      curr = curr.left
    } else {
      steps.push(
        makeBstStep(
          steps.length,
          'compare-right',
          root,
          curr.id,
          [],
          {},
          nodeStates,
          5,
          `${numVal} > ${curr.value}. Moving right.`,
          `Compare ${numVal} with node key ${curr.value}. Branch right.`,
          stats
        )
      )
      if (!curr.right) {
        const newNode = createBstNode(numVal, `node-${numVal}`)
        curr.right = newNode
        steps.push(
          makeBstStep(
            steps.length,
            'inserted',
            root,
            newNode.id,
            [],
            {},
            { [newNode.id]: 'active' },
            6,
            `Inserted new node ${numVal} as the right child of ${curr.value}.`,
            `Linked new Node(${numVal}) to parent ${curr.value}.right.`,
            stats
          )
        )
        break
      }
      curr = curr.right
    }
  }

  return steps
}

/**
 * Pure generator function for Search step sequence.
 */
export function generateBstSearchSteps(initialRoot, targetValue) {
  const steps = []
  const numTarget = Number(targetValue)
  const root = cloneTree(initialRoot)
  const stats = { comparisons: 0, swaps: 0, arrayAccesses: 0 }

  steps.push(
    makeBstStep(
      0,
      'init',
      root,
      null,
      [],
      {},
      {},
      1,
      `Searching for value ${numTarget} in the BST.`,
      `Initialize BST search for key ${numTarget}.`,
      stats
    )
  )

  let curr = root
  while (curr) {
    stats.comparisons++
    stats.arrayAccesses++

    if (curr.value === numTarget) {
      steps.push(
        makeBstStep(
          steps.length,
          'found',
          root,
          curr.id,
          [curr.value],
          { [curr.id]: 1 },
          { [curr.id]: 'found' },
          2,
          `Found target value ${numTarget}!`,
          `Key match: ${curr.value} == ${numTarget}. Search successful.`,
          stats
        )
      )
      return steps
    }

    if (numTarget < curr.value) {
      steps.push(
        makeBstStep(
          steps.length,
          'compare',
          root,
          curr.id,
          [],
          {},
          { [curr.id]: 'comparing' },
          4,
          `${numTarget} < ${curr.value}. Traversing left subtree.`,
          `Compare ${numTarget} < ${curr.value}; recurse left.`,
          stats
        )
      )
      curr = curr.left
    } else {
      steps.push(
        makeBstStep(
          steps.length,
          'compare',
          root,
          curr.id,
          [],
          {},
          { [curr.id]: 'comparing' },
          6,
          `${numTarget} > ${curr.value}. Traversing right subtree.`,
          `Compare ${numTarget} > ${curr.value}; recurse right.`,
          stats
        )
      )
      curr = curr.right
    }
  }

  steps.push(
    makeBstStep(
      steps.length,
      'not-found',
      root,
      null,
      [],
      {},
      {},
      3,
      `Value ${numTarget} is not present in the tree.`,
      `Reached null child pointer without finding key ${numTarget}.`,
      stats
    )
  )

  return steps
}

/**
 * Pure generator function for Delete step sequence.
 */
export function generateBstDeleteSteps(initialRoot, valueToDelete) {
  const steps = []
  const numTarget = Number(valueToDelete)
  let root = cloneTree(initialRoot)
  const stats = { comparisons: 0, swaps: 0, arrayAccesses: 0 }

  steps.push(
    makeBstStep(
      0,
      'init',
      root,
      null,
      [],
      {},
      {},
      1,
      `Initiating deletion of value ${numTarget}.`,
      `Initialize deletion routine for target key ${numTarget}.`,
      stats
    )
  )

  function deleteNodeRec(node, val, parent = null) {
    if (!node) {
      steps.push(
        makeBstStep(
          steps.length,
          'not-found',
          root,
          null,
          [],
          {},
          {},
          2,
          `Value ${val} not found in the BST.`,
          `Target node is null; deletion target absent.`,
          stats
        )
      )
      return null
    }

    stats.comparisons++
    stats.arrayAccesses++

    if (val < node.value) {
      steps.push(
        makeBstStep(
          steps.length,
          'search-left',
          root,
          node.id,
          [],
          {},
          { [node.id]: 'comparing' },
          3,
          `${val} < ${node.value}. Searching left subtree for node to delete.`,
          `Key ${val} < ${node.value}; recurse left.`,
          stats
        )
      )
      node.left = deleteNodeRec(node.left, val, node)
      return node
    } else if (val > node.value) {
      steps.push(
        makeBstStep(
          steps.length,
          'search-right',
          root,
          node.id,
          [],
          {},
          { [node.id]: 'comparing' },
          4,
          `${val} > ${node.value}. Searching right subtree for node to delete.`,
          `Key ${val} > ${node.value}; recurse right.`,
          stats
        )
      )
      node.right = deleteNodeRec(node.right, val, node)
      return node
    } else {
      // Node found
      steps.push(
        makeBstStep(
          steps.length,
          'found-target',
          root,
          node.id,
          [],
          {},
          { [node.id]: 'found' },
          5,
          `Found node ${node.value} to delete.`,
          `Identified target node for deletion.`,
          stats
        )
      )

      // Case 1 & 2: 0 or 1 child
      if (!node.left) {
        const temp = node.right
        steps.push(
          makeBstStep(
            steps.length,
            'delete-single',
            root,
            temp ? temp.id : null,
            [],
            {},
            temp ? { [temp.id]: 'active' } : {},
            6,
            `Replacing node ${node.value} with its right child ${temp ? temp.value : 'null'}.`,
            `Unlink node ${node.value} and promote right child.`,
            stats
          )
        )
        return temp
      } else if (!node.right) {
        const temp = node.left
        steps.push(
          makeBstStep(
            steps.length,
            'delete-single',
            root,
            temp.id,
            [],
            {},
            { [temp.id]: 'active' },
            6,
            `Replacing node ${node.value} with its left child ${temp.value}.`,
            `Unlink node ${node.value} and promote left child.`,
            stats
          )
        )
        return temp
      }

      // Case 3: 2 children - find inorder successor (min in right subtree)
      steps.push(
        makeBstStep(
          steps.length,
          'find-successor',
          root,
          node.id,
          [],
          {},
          { [node.id]: 'found', [node.right.id]: 'comparing' },
          7,
          `Node ${node.value} has 2 children. Finding inorder successor in right subtree.`,
          `Locate minimum key in right subtree of node ${node.value}.`,
          stats
        )
      )

      let succ = node.right
      while (succ.left) {
        succ = succ.left
      }

      steps.push(
        makeBstStep(
          steps.length,
          'successor-found',
          root,
          succ.id,
          [],
          {},
          { [node.id]: 'found', [succ.id]: 'pivot' },
          7,
          `Found inorder successor ${succ.value}.`,
          `Successor node is ${succ.value} (smallest value in right subtree).`,
          stats
        )
      )

      node.value = succ.value
      stats.swaps++

      steps.push(
        makeBstStep(
          steps.length,
          'copied-successor',
          root,
          node.id,
          [],
          {},
          { [node.id]: 'active' },
          8,
          `Copied successor value ${succ.value} into target node position.`,
          `Update node key to ${succ.value}. Now removing duplicate successor node.`,
          stats
        )
      )

      node.right = deleteNodeRec(node.right, succ.value, node)
      return node
    }
  }

  root = deleteNodeRec(root, numTarget)

  steps.push(
    makeBstStep(
      steps.length,
      'completed-deletion',
      root,
      null,
      [],
      {},
      {},
      9,
      `Finished deletion of value ${numTarget}. Tree rebalanced.`,
      `Deletion process completed successfully.`,
      stats
    )
  )

  return steps
}

/**
 * Pure generator function for Tree Traversals.
 */
export function generateBstTraversalSteps(initialRoot, type = 'inorder') {
  const steps = []
  const root = cloneTree(initialRoot)
  const stats = { comparisons: 0, swaps: 0, arrayAccesses: 0 }

  steps.push(
    makeBstStep(
      0,
      'init',
      root,
      null,
      [],
      {},
      {},
      1,
      `Starting ${type.toUpperCase()} traversal.`,
      `Initialize ${type} traversal sequence on BST.`,
      stats
    )
  )

  if (!root) return steps

  const visitedOrder = []
  const visitSequenceMap = {}
  const nodeStates = {}
  let visitCounter = 0

  function visit(node, line) {
    visitCounter++
    visitedOrder.push(node.value)
    visitSequenceMap[node.id] = visitCounter
    nodeStates[node.id] = 'active'
    stats.arrayAccesses++

    steps.push(
      makeBstStep(
        steps.length,
        'visit',
        root,
        node.id,
        visitedOrder,
        visitSequenceMap,
        { ...nodeStates },
        line,
        `Visited node ${node.value} (Visit #${visitCounter}).`,
        `Process node key ${node.value} at position #${visitCounter} in ${type} order.`,
        stats
      )
    )
  }

  if (type === 'inorder') {
    function traverseInorder(node) {
      if (!node) return
      traverseInorder(node.left)
      visit(node, 4)
      traverseInorder(node.right)
    }
    traverseInorder(root)
  } else if (type === 'preorder') {
    function traversePreorder(node) {
      if (!node) return
      visit(node, 3)
      traversePreorder(node.left)
      traversePreorder(node.right)
    }
    traversePreorder(root)
  } else if (type === 'postorder') {
    function traversePostorder(node) {
      if (!node) return
      traversePostorder(node.left)
      traversePostorder(node.right)
      visit(node, 5)
    }
    traversePostorder(root)
  } else if (type === 'levelorder') {
    const queue = [root]
    while (queue.length > 0) {
      const curr = queue.shift()
      visit(curr, 4)
      if (curr.left) queue.push(curr.left)
      if (curr.right) queue.push(curr.right)
    }
  }

  steps.push(
    makeBstStep(
      steps.length,
      'complete',
      root,
      null,
      visitedOrder,
      visitSequenceMap,
      nodeStates,
      1,
      `Completed ${type.toUpperCase()} traversal: [${visitedOrder.join(', ')}].`,
      `${type} sequence completed with ${visitedOrder.length} visited nodes.`,
      stats
    )
  )

  return steps
}
