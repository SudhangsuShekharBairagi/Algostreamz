// lineMap is indexed by pseudocode line - 1 and stores a 1-based source line.
const snippet = (java, python, cpp, lineMap) => ({
  java: { code: java, lineMap: lineMap.java },
  python: { code: python, lineMap: lineMap.python },
  cpp: { code: cpp, lineMap: lineMap.cpp },
})

export const CODE_SNIPPETS = {
  'bubble-sort': snippet(
    `static void bubbleSort(int[] a) {
  for (int i = 0; i < a.length - 1; i++) {
    boolean swapped = false;
    for (int j = 0; j < a.length - i - 1; j++) {
      if (a[j] > a[j + 1]) {
        int t = a[j]; a[j] = a[j + 1]; a[j + 1] = t;
        swapped = true;
      }
    }
    if (!swapped) break;
  }
}`,
    `def bubble_sort(a):
    for i in range(len(a) - 1):
        swapped = False
        for j in range(len(a) - i - 1):
            if a[j] > a[j + 1]:
                a[j], a[j + 1] = a[j + 1], a[j]
                swapped = True
        if not swapped:
            break`,
    `void bubbleSort(vector<int>& a) {
  for (int i = 0; i < (int)a.size() - 1; ++i) {
    bool swapped = false;
    for (int j = 0; j < (int)a.size() - i - 1; ++j) {
      if (a[j] > a[j + 1]) {
        swap(a[j], a[j + 1]);
        swapped = true;
      }
    }
    if (!swapped) break;
  }
}`,
    { java: [1, 1, 2, 3, 4, 5, 6, 7, 10], python: [1, 1, 2, 3, 4, 5, 6, 7, 9], cpp: [1, 1, 2, 3, 4, 5, 6, 7, 10] },
  ),
  'selection-sort': snippet(
    `static void selectionSort(int[] a) {
  for (int i = 0; i < a.length - 1; i++) {
    int min = i;
    for (int j = i + 1; j < a.length; j++) {
      if (a[j] < a[min]) min = j;
    }
    if (min != i) {
      int t = a[i]; a[i] = a[min]; a[min] = t;
    }
  }
}`,
    `def selection_sort(a):
    for i in range(len(a) - 1):
        minimum = i
        for j in range(i + 1, len(a)):
            if a[j] < a[minimum]:
                minimum = j
        if minimum != i:
            a[i], a[minimum] = a[minimum], a[i]`,
    `void selectionSort(vector<int>& a) {
  for (int i = 0; i < (int)a.size() - 1; ++i) {
    int minimum = i;
    for (int j = i + 1; j < (int)a.size(); ++j) {
      if (a[j] < a[minimum]) minimum = j;
    }
    if (minimum != i) swap(a[i], a[minimum]);
  }
}`,
    { java: [1, 1, 2, 3, 4, 5, 6, 7, 8], python: [1, 1, 2, 3, 4, 5, 6, 7, 8], cpp: [1, 1, 2, 3, 4, 5, 6, 7, 8] },
  ),
  'insertion-sort': snippet(
    `static void insertionSort(int[] a) {
  for (int i = 1; i < a.length; i++) {
    int key = a[i], j = i - 1;
    while (j >= 0 && a[j] > key) {
      a[j + 1] = a[j];
      j--;
    }
    a[j + 1] = key;
  }
}`,
    `def insertion_sort(a):
    for i in range(1, len(a)):
        key = a[i]
        j = i - 1
        while j >= 0 and a[j] > key:
            a[j + 1] = a[j]
            j -= 1
        a[j + 1] = key`,
    `void insertionSort(vector<int>& a) {
  for (int i = 1; i < (int)a.size(); ++i) {
    int key = a[i], j = i - 1;
    while (j >= 0 && a[j] > key) {
      a[j + 1] = a[j];
      --j;
    }
    a[j + 1] = key;
  }
}`,
    { java: [1, 1, 2, 3, 4, 5, 6, 7, 8], python: [1, 1, 2, 3, 4, 5, 6, 7, 8], cpp: [1, 1, 2, 3, 4, 5, 6, 7, 8] },
  ),
  'merge-sort': snippet(
    `static void mergeSort(int[] a, int lo, int hi) {
  if (lo >= hi) return;
  int mid = lo + (hi - lo) / 2;
  mergeSort(a, lo, mid);
  mergeSort(a, mid + 1, hi);
  int[] left = Arrays.copyOfRange(a, lo, mid + 1);
  int[] right = Arrays.copyOfRange(a, mid + 1, hi + 1);
  int i = 0, j = 0, k = lo;
  while (i < left.length && j < right.length)
    a[k++] = left[i] <= right[j] ? left[i++] : right[j++];
  while (i < left.length) a[k++] = left[i++];
  while (j < right.length) a[k++] = right[j++];
}`,
    `def merge_sort(a):
    if len(a) <= 1:
        return a
    mid = len(a) // 2
    left, right = merge_sort(a[:mid]), merge_sort(a[mid:])
    merged = []
    while left and right:
        merged.append(left.pop(0) if left[0] <= right[0] else right.pop(0))
    return merged + left + right`,
    `void mergeSort(vector<int>& a, int lo, int hi) {
  if (lo >= hi) return;
  int mid = lo + (hi - lo) / 2;
  mergeSort(a, lo, mid); mergeSort(a, mid + 1, hi);
  vector<int> left(a.begin() + lo, a.begin() + mid + 1);
  vector<int> right(a.begin() + mid + 1, a.begin() + hi + 1);
  int i = 0, j = 0, k = lo;
  while (i < (int)left.size() && j < (int)right.size())
    a[k++] = left[i] <= right[j] ? left[i++] : right[j++];
  while (i < (int)left.size()) a[k++] = left[i++];
  while (j < (int)right.size()) a[k++] = right[j++];
}`,
    { java: [1, 2, 3, 4, 5, 6, 7, 9, 10, 11], python: [1, 2, 3, 4, 5, 6, 7, 8, 9, 9], cpp: [1, 2, 3, 4, 5, 6, 7, 9, 10, 11] },
  ),
  'quick-sort': snippet(
    `static void quickSort(int[] a, int lo, int hi) {
  if (lo >= hi) return;
  int pivot = a[hi], i = lo;
  for (int j = lo; j < hi; j++) {
    if (a[j] < pivot) {
      int t = a[i]; a[i++] = a[j]; a[j] = t;
    }
  }
  int t = a[i]; a[i] = a[hi]; a[hi] = t;
  quickSort(a, lo, i - 1);
  quickSort(a, i + 1, hi);
}`,
    `def quick_sort(a, lo=0, hi=None):
    if hi is None:
        hi = len(a) - 1
    if lo >= hi:
        return
    pivot = a[hi]
    i = lo
    for j in range(lo, hi):
        if a[j] < pivot:
            a[i], a[j] = a[j], a[i]
            i += 1
    a[i], a[hi] = a[hi], a[i]
    quick_sort(a, lo, i - 1)
    quick_sort(a, i + 1, hi)`,
    `void quickSort(vector<int>& a, int lo, int hi) {
  if (lo >= hi) return;
  int pivot = a[hi], i = lo;
  for (int j = lo; j < hi; ++j)
    if (a[j] < pivot) swap(a[i++], a[j]);
  swap(a[i], a[hi]);
  quickSort(a, lo, i - 1);
  quickSort(a, i + 1, hi);
}`,
    { java: [1, 2, 3, 4, 5, 6, 7, 4, 5, 8], python: [1, 3, 4, 5, 6, 7, 8, 9, 10, 11], cpp: [1, 2, 3, 4, 5, 6, 7, 4, 5, 8] },
  ),
  'binary-search': snippet(
    `static int binarySearch(int[] a, int target) {
  int low = 0, high = a.length - 1;
  while (low <= high) {
    int mid = low + (high - low) / 2;
    if (a[mid] == target) return mid;
    if (a[mid] < target) low = mid + 1;
    else high = mid - 1;
  }
  return -1;
}`,
    `def binary_search(a, target):
    low, high = 0, len(a) - 1
    while low <= high:
        mid = low + (high - low) // 2
        if a[mid] == target:
            return mid
        if a[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1`,
    `int binarySearch(const vector<int>& a, int target) {
  int low = 0, high = (int)a.size() - 1;
  while (low <= high) {
    int mid = low + (high - low) / 2;
    if (a[mid] == target) return mid;
    if (a[mid] < target) low = mid + 1;
    else high = mid - 1;
  }
  return -1;
}`,
    { java: [1, 2, 3, 4, 5, 5, 6, 6, 7, 7, 9], python: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], cpp: [1, 2, 3, 4, 5, 5, 6, 6, 7, 7, 9] },
  ),
  'linear-search': snippet(
    `static int linearSearch(int[] a, int target) {
  for (int i = 0; i < a.length; i++) {
    if (a[i] == target) return i;
  }
  return -1;
}`,
    `def linear_search(a, target):
    for i, value in enumerate(a):
        if value == target:
            return i
    return -1`,
    `int linearSearch(const vector<int>& a, int target) {
  for (int i = 0; i < (int)a.size(); ++i)
    if (a[i] == target) return i;
  return -1;
}`,
    { java: [1, 1, 2, 3, 4, 5], python: [1, 1, 2, 3, 4, 5], cpp: [1, 1, 2, 3, 4, 5] },
  ),
  stack: snippet(
    `class Stack {
  private final Deque<Integer> items = new ArrayDeque<>();
  void push(int value) { items.push(value); }
  int pop() { return items.pop(); }
  int peek() { return items.element(); }
}`,
    `class Stack:
    def __init__(self):
        self.items = []
    def push(self, value):
        self.items.append(value)
    def pop(self):
        return self.items.pop()
    def peek(self):
        return self.items[-1]`,
    `class Stack {
  vector<int> items;
public:
  void push(int value) { items.push_back(value); }
  int pop() { int v = items.back(); items.pop_back(); return v; }
  int peek() const { return items.back(); }
};`,
    { java: [1, 3, 4, 5], python: [1, 5, 7, 9], cpp: [1, 4, 5, 6] },
  ),
  queue: snippet(
    `class Queue {
  private final Deque<Integer> items = new ArrayDeque<>();
  void enqueue(int value) { items.addLast(value); }
  int dequeue() { return items.removeFirst(); }
  int peek() { return items.getFirst(); }
  int rear() { return items.getLast(); }
}`,
    `from collections import deque
class Queue:
    def __init__(self):
        self.items = deque()
    def enqueue(self, value):
        self.items.append(value)
    def dequeue(self):
        return self.items.popleft()
    def peek(self):
        return self.items[0]
    def rear(self):
        return self.items[-1]`,
    `class Queue {
  deque<int> items;
public:
  void enqueue(int value) { items.push_back(value); }
  int dequeue() { int v = items.front(); items.pop_front(); return v; }
  int peek() const { return items.front(); }
  int rear() const { return items.back(); }
};`,
    { java: [1, 3, 4, 5, 6], python: [2, 5, 7, 9, 11], cpp: [1, 4, 5, 6, 7] },
  ),
  'linked-list': snippet(
    `class Node { int value; Node next; Node(int v) { value = v; } }
class LinkedList {
  Node head;
  void insertHead(int v) { Node n = new Node(v); n.next = head; head = n; }
  void insertTail(int v) {
    Node n = new Node(v);
    if (head == null) { head = n; return; }
    Node p = head; while (p.next != null) p = p.next; p.next = n;
  }
  Node nodeAt(int i) { Node p = head; while (i-- > 0 && p != null) p = p.next; return p; }
  void insertAt(int i, int v) { if (i == 0) insertHead(v); else { Node p = nodeAt(i - 1); if (p != null) { Node n = new Node(v); n.next = p.next; p.next = n; } } }
  void deleteAt(int i) { if (i == 0 && head != null) head = head.next; else { Node p = nodeAt(i - 1); if (p != null && p.next != null) p.next = p.next.next; } }
  boolean search(int v) { for (Node p = head; p != null; p = p.next) if (p.value == v) return true; return false; }
  void deleteValue(int v) { if (head != null && head.value == v) { head = head.next; return; } for (Node p = head; p != null && p.next != null; p = p.next) if (p.next.value == v) { p.next = p.next.next; return; } }
  void reverse() { Node previous = null, current = head; while (current != null) { Node next = current.next; current.next = previous; previous = current; current = next; } head = previous; }
}`,
    `class Node:
    def __init__(self, value, next=None):
        self.value, self.next = value, next
class LinkedList:
    def __init__(self):
        self.head = None
    def insert_head(self, value):
        self.head = Node(value, self.head)
    def insert_tail(self, value):
        node = Node(value)
        if not self.head: self.head = node; return
        current = self.head
        while current.next: current = current.next
        current.next = node
    def _node_at(self, index):
        current = self.head
        for _ in range(index):
            if not current: return None
            current = current.next
        return current
    def insert_at(self, index, value):
        if index == 0: self.insert_head(value); return
        prev = self._node_at(index - 1)
        if prev: prev.next = Node(value, prev.next)
    def delete_at(self, index):
        if index == 0 and self.head: self.head = self.head.next; return
        prev = self._node_at(index - 1)
        if prev and prev.next: prev.next = prev.next.next
    def search(self, value):
        current = self.head
        while current:
            if current.value == value: return True
            current = current.next
        return False
    def delete_value(self, value):
        if self.head and self.head.value == value: self.head = self.head.next; return
        current = self.head
        while current and current.next:
            if current.next.value == value: current.next = current.next.next; return
            current = current.next
    def reverse(self):
        previous, current = None, self.head
        while current:
            current.next, previous, current = previous, current, current.next
        self.head = previous`,
    `struct Node { int value; Node* next = nullptr; explicit Node(int v) : value(v) {} };
class LinkedList {
  Node* head = nullptr;
public:
  void insertHead(int v) { Node* n = new Node(v); n->next = head; head = n; }
  void insertTail(int v) { Node* n = new Node(v); if (!head) { head = n; return; } Node* p = head; while (p->next) p = p->next; p->next = n; }
  Node* nodeAt(int i) const { Node* p = head; while (i-- > 0 && p) p = p->next; return p; }
  void insertAt(int i, int v) { if (i == 0) insertHead(v); else if (Node* p = nodeAt(i - 1)) { Node* n = new Node(v); n->next = p->next; p->next = n; } }
  void deleteAt(int i) { if (i == 0 && head) head = head->next; else if (Node* p = nodeAt(i - 1); p && p->next) p->next = p->next->next; }
  bool search(int v) const { for (Node* p = head; p; p = p->next) if (p->value == v) return true; return false; }
  void deleteValue(int v) { if (head && head->value == v) { head = head->next; return; } for (Node* p = head; p && p->next; p = p->next) if (p->next->value == v) { p->next = p->next->next; return; } }
  void reverse() { Node* previous = nullptr; Node* current = head; while (current) { Node* next = current->next; current->next = previous; previous = current; current = next; } head = previous; }
};`,
    { java: [1, 3, 4, 5, 6, 7, 14, 15], python: [3, 8, 9, 22, 26, 28, 32, 38], cpp: [1, 6, 7, 8, 9, 10, 11, 12] },
  ),
  'binary-search-tree': snippet(
    `class Node { int value; Node left, right; Node(int v) { value = v; } }
class BST {
  Node root;
  Node insert(Node n, int v) { if (n == null) return new Node(v); if (v < n.value) n.left = insert(n.left, v); else if (v > n.value) n.right = insert(n.right, v); return n; }
  boolean search(Node n, int v) { if (n == null) return false; if (v == n.value) return true; return search(v < n.value ? n.left : n.right, v); }
  Node delete(Node n, int v) { if (n == null) return null; if (v < n.value) n.left = delete(n.left, v); else if (v > n.value) n.right = delete(n.right, v); else { if (n.left == null) return n.right; if (n.right == null) return n.left; Node s = n.right; while (s.left != null) s = s.left; n.value = s.value; n.right = delete(n.right, s.value); } return n; }
  void inorder(Node n) { if (n != null) { inorder(n.left); System.out.print(n.value + " "); inorder(n.right); } }
  void preorder(Node n) { if (n != null) { System.out.print(n.value + " "); preorder(n.left); preorder(n.right); } }
  void postorder(Node n) { if (n != null) { postorder(n.left); postorder(n.right); System.out.print(n.value + " "); } }
  void levelorder() { Queue<Node> q = new ArrayDeque<>(); if (root != null) q.add(root); while (!q.isEmpty()) { Node n = q.remove(); System.out.print(n.value + " "); if (n.left != null) q.add(n.left); if (n.right != null) q.add(n.right); } }
}`,
    `class Node:
    def __init__(self, value):
        self.value, self.left, self.right = value, None, None
class BST:
    def __init__(self):
        self.root = None
    def insert(self, node, value):
        if not node: return Node(value)
        if value < node.value: node.left = self.insert(node.left, value)
        elif value > node.value: node.right = self.insert(node.right, value)
        return node
    def search(self, node, value):
        if not node or node.value == value: return node
        return self.search(node.left if value < node.value else node.right, value)
    def delete(self, node, value):
        if not node: return None
        if value < node.value: node.left = self.delete(node.left, value)
        elif value > node.value: node.right = self.delete(node.right, value)
        elif not node.left: return node.right
        elif not node.right: return node.left
        else:
            successor = node.right
            while successor.left: successor = successor.left
            node.value = successor.value
            node.right = self.delete(node.right, successor.value)
        return node
    def inorder(self, node):
        if node: self.inorder(node.left); print(node.value); self.inorder(node.right)
    def preorder(self, node):
        if node: print(node.value); self.preorder(node.left); self.preorder(node.right)
    def postorder(self, node):
        if node: self.postorder(node.left); self.postorder(node.right); print(node.value)
    def levelorder(self):
        queue = [self.root] if self.root else []
        while queue:
            node = queue.pop(0); print(node.value)
            if node.left: queue.append(node.left)
            if node.right: queue.append(node.right)`,
    `struct Node { int value; Node *left = nullptr, *right = nullptr; explicit Node(int v) : value(v) {} };
class BST {
  Node* root = nullptr;
  Node* insert(Node* n, int v) { if (!n) return new Node(v); if (v < n->value) n->left = insert(n->left, v); else if (v > n->value) n->right = insert(n->right, v); return n; }
  bool search(Node* n, int v) { if (!n) return false; if (v == n->value) return true; return search(v < n->value ? n->left : n->right, v); }
  Node* erase(Node* n, int v) { if (!n) return nullptr; if (v < n->value) n->left = erase(n->left, v); else if (v > n->value) n->right = erase(n->right, v); else { if (!n->left) return n->right; if (!n->right) return n->left; Node* s = n->right; while (s->left) s = s->left; n->value = s->value; n->right = erase(n->right, s->value); } return n; }
  void inorder(Node* n) { if (n) { inorder(n->left); cout << n->value << ' '; inorder(n->right); } }
  void preorder(Node* n) { if (n) { cout << n->value << ' '; preorder(n->left); preorder(n->right); } }
  void postorder(Node* n) { if (n) { postorder(n->left); postorder(n->right); cout << n->value << ' '; } }
  void levelorder() { queue<Node*> q; if (root) q.push(root); while (!q.empty()) { Node* n = q.front(); q.pop(); cout << n->value << ' '; if (n->left) q.push(n->left); if (n->right) q.push(n->right); } }
};`,
    { java: [1, 2, 3, 4, 5, 6, 7, 8], python: [1, 2, 3, 4, 5, 6, 7, 8], cpp: [1, 2, 3, 4, 5, 6, 7, 8] },
  ),
  bfs: snippet(
    `static void bfs(Map<Integer, List<Integer>> graph, int start) {
  Queue<Integer> queue = new ArrayDeque<>();
  Set<Integer> visited = new HashSet<>();
  queue.add(start); visited.add(start);
  while (!queue.isEmpty()) {
    int node = queue.remove(); System.out.println(node);
    for (int next : graph.getOrDefault(node, List.of())) {
      if (visited.add(next)) queue.add(next);
    }
  }
}`,
    `from collections import deque
def bfs(graph, start):
    queue, visited = deque([start]), {start}
    while queue:
        node = queue.popleft()
        print(node)
        for neighbor in graph.get(node, []):
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)`,
    `void bfs(const vector<vector<int>>& graph, int start) {
  queue<int> q; vector<bool> visited(graph.size(), false);
  q.push(start); visited[start] = true;
  while (!q.empty()) {
    int u = q.front(); q.pop(); cout << u << ' ';
    for (int v : graph[u]) if (!visited[v]) {
      visited[v] = true; q.push(v);
    }
  }
}`,
    { java: [1, 2, 3, 4, 5, 6], python: [2, 3, 4, 5, 7, 8], cpp: [1, 2, 3, 4, 5, 6] },
  ),
  dfs: snippet(
    `static void dfs(Map<Integer, List<Integer>> graph, int node, Set<Integer> visited) {
  visited.add(node);
  System.out.println(node);
  for (int next : graph.getOrDefault(node, List.of())) {
    if (!visited.contains(next)) dfs(graph, next, visited);
  }
}`,
    `def dfs(graph, node, visited=None):
    if visited is None:
        visited = set()
    visited.add(node)
    print(node)
    for neighbor in graph.get(node, []):
        if neighbor not in visited:
            dfs(graph, neighbor, visited)`,
    `void dfs(const vector<vector<int>>& graph, int u, vector<bool>& visited) {
  visited[u] = true;
  cout << u << ' ';
  for (int v : graph[u])
    if (!visited[v]) dfs(graph, v, visited);
}`,
    { java: [1, 2, 3, 4], python: [1, 4, 5, 6], cpp: [1, 2, 3, 4] },
  ),
  dijkstra: snippet(
    `static int[] dijkstra(List<List<Edge>> graph, int start) {
  int[] dist = new int[graph.size()];
  Arrays.fill(dist, Integer.MAX_VALUE); dist[start] = 0;
  PriorityQueue<int[]> q = new PriorityQueue<>(Comparator.comparingInt(a -> a[1]));
  q.add(new int[]{start, 0});
  while (!q.isEmpty()) {
    int[] item = q.remove(); int u = item[0], cost = item[1];
    if (cost != dist[u]) continue;
    for (Edge e : graph.get(u)) if (cost + e.weight < dist[e.to]) {
      dist[e.to] = cost + e.weight; q.add(new int[]{e.to, dist[e.to]});
    }
  }
  return dist;
}`,
    `import heapq
def dijkstra(graph, start):
    dist = [float('inf')] * len(graph)
    dist[start] = 0
    queue = [(0, start)]
    while queue:
        cost, node = heapq.heappop(queue)
        if cost != dist[node]:
            continue
        for neighbor, weight in graph[node]:
            candidate = cost + weight
            if candidate < dist[neighbor]:
                dist[neighbor] = candidate
                heapq.heappush(queue, (candidate, neighbor))
    return dist`,
    `vector<int> dijkstra(const vector<vector<pair<int,int>>>& graph, int start) {
  vector<int> dist(graph.size(), INT_MAX); dist[start] = 0;
  priority_queue<pair<int,int>, vector<pair<int,int>>, greater<>> q;
  q.push({0, start});
  while (!q.empty()) {
    auto [cost, u] = q.top(); q.pop();
    if (cost != dist[u]) continue;
    for (auto [v, weight] : graph[u]) if (cost + weight < dist[v]) {
      dist[v] = cost + weight; q.push({dist[v], v});
    }
  }
  return dist;
}`,
    { java: [1, 2, 3, 4, 5, 6], python: [1, 2, 3, 4, 5, 6], cpp: [1, 2, 3, 4, 5, 6] },
  ),
}

export default CODE_SNIPPETS
