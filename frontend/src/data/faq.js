/**
 * FAQ Data source of truth for Algostreamz.
 * Each answer consists of exactly two clear, factual sentences.
 */
export const FAQ_ITEMS = [
  {
    id: 'faq-free',
    q: 'Is Algostreamz free?',
    a: 'Algostreamz is completely free and open-source for students, developers, and educators. All visualizers, playgrounds, and Zen mode features are fully accessible without paywalls.',
  },
  {
    id: 'faq-account',
    q: 'Do I need an account?',
    a: 'No account is required to explore algorithms, run step visualizers, or use Zen mode. Creating a free account simply allows you to save custom sandbox setups and track your learning progress.',
  },
  {
    id: 'faq-covered',
    q: 'Which algorithms are covered?',
    a: 'We cover core sorting algorithms, linear and binary searching, binary search trees, and graph traversals like BFS, DFS, and Dijkstra. Additional data structure modules are continuously added to the catalog.',
  },
  {
    id: 'faq-zen',
    q: 'What is Zen mode?',
    a: 'Zen mode removes all outer navigation headers and sidebar panels for distraction-free focus. It centers the visualization stage, displays clean plain-English captions, and auto-hides floating controls after inactivity.',
  },
  {
    id: 'faq-metrics',
    q: 'How are operation counts measured?',
    a: 'Operation counts are computed directly from pure step generator trace functions. Every comparison, swap, pointer movement, and array access is tracked to match theoretical Big-O complexity bounds.',
  },
  {
    id: 'faq-coursework',
    q: 'Can I use it for coursework?',
    a: 'Yes! Algostreamz is built as a minor project specifically designed to help students build intuitive mental models for DSA exams and technical interviews. Feel free to use the visual trace player and pseudocode debugger for your studies.',
  },
]

export default FAQ_ITEMS
