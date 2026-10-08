import { GITHUB_URL, SITE_NAME, TAGLINE } from "../config";

export const ROUTES = {
  HOME: "/",
  ALGORITHMS: "/algorithms",
  VISUALIZER: "/visualizer/:algorithmId",
  DEFAULT_VISUALIZER: "/visualizer/bubble-sort",
  PLAYGROUND: "/playground",
  RACE: "/race",
  EXPERIMENT: "/experiment",
  CHALLENGES: "/challenges",
  PROGRESS: "/progress",
  PROFILE: "/profile",
  CONTACT: "/contact",
  DESIGN_SYSTEM: "/_design",
  LOGIN: "/login",
  VERIFY_EMAIL: "/verify-email",
};

export const SITE_LINKS = {
  primary: [
    { label: "Home", href: ROUTES.HOME, id: "nav-home" },
    { label: "Explore", href: ROUTES.ALGORITHMS, id: "nav-explore" },
    {
      label: "Visualizer",
      href: ROUTES.DEFAULT_VISUALIZER,
      id: "nav-visualizer",
    },
    { label: "Playground", href: ROUTES.PLAYGROUND, id: "nav-playground" },
    { label: "Race Mode", href: ROUTES.RACE, id: "nav-race" },
    { label: "Experiments", href: ROUTES.EXPERIMENT, id: "nav-experiments" },
    { label: "Challenges", href: ROUTES.CHALLENGES, id: "nav-challenges" },
    { label: "Progress", href: ROUTES.PROGRESS, id: "nav-progress" },
    { label: "Contact", href: ROUTES.CONTACT, id: "nav-contact" },
  ],
  anchors: [
    { label: "Why Algostreamz", href: "#why", targetId: "why" },
    { label: "How It Works", href: "#how", targetId: "how" },
    { label: "Features", href: "#features", targetId: "features" },
    { label: "Algorithms", href: "#algorithms", targetId: "algorithms" },
    {
      label: "Talk to Us",
      href: "#contact-section",
      targetId: "contact-section",
    },
    { label: "FAQ", href: "#faq", targetId: "faq" },
  ],
  quickLaunch: [
    {
      label: "Bubble Sort",
      href: "/visualizer/bubble-sort",
      algorithmId: "bubble-sort",
    },
    {
      label: "Binary Search",
      href: "/visualizer/binary-search",
      algorithmId: "binary-search",
    },
  ],
  external: {
    github: GITHUB_URL,
  },
};

export const ROUTE_METADATA = {
  [ROUTES.HOME]: {
    title: `${SITE_NAME} — ${TAGLINE}`,
    description:
      "Interactive step-by-step algorithms and data structures visualization platform.",
  },
  [ROUTES.ALGORITHMS]: {
    title: `Algorithm Catalog — ${SITE_NAME}`,
    description:
      "Explore interactive modules for sorting, searching, tree, and graph algorithms.",
  },
  [ROUTES.DEFAULT_VISUALIZER]: {
    title: `Interactive Step Visualizer — ${SITE_NAME}`,
    description:
      "Step through algorithm execution snapshots with speed controls and state breakdown.",
  },
  [ROUTES.PLAYGROUND]: {
    title: `Custom Sandbox & Playground — ${SITE_NAME}`,
    description:
      "Test algorithms with custom input arrays, trees, and graph adjacency inputs.",
  },
  [ROUTES.RACE]: {
    title: `Race Mode Benchmarking — ${SITE_NAME}`,
    description:
      "Compare algorithm execution speed, step count, and memory side-by-side.",
  },
  [ROUTES.EXPERIMENT]: {
    title: `Experimental Invariants Lab — ${SITE_NAME}`,
    description:
      "Analyze loop invariants, recursion stack depth, and spatial memory allocations.",
  },
  [ROUTES.CHALLENGES]: {
    title: `Algorithm Practice & Quizzes — ${SITE_NAME}`,
    description:
      "Test your intuition by predicting algorithm steps and solving visual DSA challenges.",
  },
  [ROUTES.PROGRESS]: {
    title: `Your Progress Dashboard — ${SITE_NAME}`,
    description:
      "Track completed algorithms and mastery metrics across your learning journey.",
  },
  [ROUTES.PROFILE]: {
    title: `Your Profile — ${SITE_NAME}`,
    description: "View and update your Algostreamz account profile.",
  },
  [ROUTES.CONTACT]: {
    title: `Contact Us & Feedback — ${SITE_NAME}`,
    description: `Get in touch with the ${SITE_NAME} team for feature requests and support.`,
  },
  [ROUTES.DESIGN_SYSTEM]: {
    title: `Editorial Design Tokens — ${SITE_NAME}`,
    description:
      "Design system tokens, typography scale, color ratios, and component primitives.",
  },
  [ROUTES.LOGIN]: {
    title: `Sign In — ${SITE_NAME}`,
    description: `Access your saved algorithm progress and custom sandbox setups on ${SITE_NAME}.`,
  },
  [ROUTES.VERIFY_EMAIL]: {
    title: `Verify Email — ${SITE_NAME}`,
    description:
      "Enter your 6-digit confirmation code to activate your account.",
  },
};

export const LABELS = {
  SITE_NAME,
  TAGLINE,
  SIGN_IN: "Sign in",
  SIGN_OUT: "Sign out",
  CREATE_ACCOUNT: "Create account",
  BACK_TO_HOME: "Back to home",
  START_EXPLORING: "Start exploring",
  ZEN_MODE: "Zen Mode",
  EXIT_ZEN: "Exit Zen Mode",
  PLAY: "Play",
  PAUSE: "Pause",
  STEP_FORWARD: "Step Forward",
  STEP_BACKWARD: "Step Backward",
  RESET: "Reset",
  SKIP_TO_CONTENT: "Skip to main content",
  SIDEBAR_TOGGLE: "Toggle sidebar navigation",
  THEME_COMING_SOON: "Dark mode coming soon",
};

export const SIDEBAR_CATEGORIES = [
  {
    id: "sorting",
    label: "Sorting",
    items: [
      {
        id: "bubble-sort",
        label: "Bubble Sort",
        href: "/visualizer/bubble-sort",
        icon: "BarChart2",
      },
      {
        id: "selection-sort",
        label: "Selection Sort",
        href: "/visualizer/selection-sort",
        icon: "BarChart3",
      },
      {
        id: "insertion-sort",
        label: "Insertion Sort",
        href: "/visualizer/insertion-sort",
        icon: "ArrowDownUp",
      },
      {
        id: "merge-sort",
        label: "Merge Sort",
        href: "/visualizer/merge-sort",
        icon: "GitMerge",
      },
      {
        id: "quick-sort",
        label: "Quick Sort",
        href: "/visualizer/quick-sort",
        icon: "Zap",
      },
    ],
  },
  {
    id: "searching",
    label: "Searching",
    items: [
      {
        id: "binary-search",
        label: "Binary Search",
        href: "/visualizer/binary-search",
        icon: "Search",
      },
      {
        id: "linear-search",
        label: "Linear Search",
        href: "/visualizer/linear-search",
        icon: "Scan",
      },
    ],
  },
  {
    id: "trees",
    label: "Trees",
    items: [
      {
        id: "binary-search-tree",
        label: "Binary Search Tree",
        href: "/visualizer/binary-search-tree",
        icon: "Network",
      },
    ],
  },
  {
    id: "graphs",
    label: "Graphs",
    items: [
      {
        id: "bfs",
        label: "Breadth-First Search",
        href: "/visualizer/bfs",
        icon: "Share2",
      },
      {
        id: "dfs",
        label: "Depth-First Search",
        href: "/visualizer/dfs",
        icon: "GitCommit",
      },
      {
        id: "dijkstra",
        label: "Dijkstra Algorithm",
        href: "/visualizer/dijkstra",
        icon: "Route",
      },
    ],
  },
];

export default {
  ROUTES,
  SITE_LINKS,
  ROUTE_METADATA,
  LABELS,
  SIDEBAR_CATEGORIES,
};
