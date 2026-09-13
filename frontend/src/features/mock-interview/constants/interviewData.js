/**
 * src/features/mock-interview/constants/interviewData.js
 * Comprehensive definitions for tracks, difficulty levels, interview formats, and fallback question banks.
 */

export const INTERVIEW_TRACKS = [
  {
    id: "java-fullstack",
    title: "Java Full Stack Developer",
    icon: "Code2",
    description: "Spring Boot 3, Microservices Architecture, Hibernate/JPA, REST APIs, PostgreSQL, Kafka, and React.js frontend.",
    popularity: "Most Popular",
    questionsCount: 45,
    tags: ["Java 21", "Spring Boot 3", "React 19", "PostgreSQL", "Kafka"],
  },
  {
    id: "react-frontend",
    title: "React Frontend Architect",
    icon: "Layout",
    description: "React 19, Redux Toolkit, Virtual DOM, Render Optimization, Custom Hooks, SSR, Next.js, and Core Web Vitals.",
    popularity: "High Demand",
    questionsCount: 38,
    tags: ["React 19", "TypeScript", "Redux Toolkit", "Tailwind CSS", "Vite"],
  },
  {
    id: "python-backend",
    title: "Python Backend & Microservices",
    icon: "Terminal",
    description: "FastAPI, Django, AsyncIO, Distributed Caching with Redis, Celery Task Queues, SQLAlchemy, and Microservices.",
    popularity: "Trending",
    questionsCount: 40,
    tags: ["Python 3.12", "FastAPI", "Docker", "Redis", "SQLAlchemy"],
  },
  {
    id: "ai-llm-engineer",
    title: "AI / LLM Integration Engineer",
    icon: "Cpu",
    description: "Spring AI, LangChain, Retrieval-Augmented Generation (RAG), Vector DBs (Pinecone/Chroma), Embeddings, and Prompt Engineering.",
    popularity: "Hot Track 🚀",
    questionsCount: 30,
    tags: ["Spring AI", "Python", "RAG", "Vector Search", "Prompt Engineering"],
  },
  {
    id: "system-design",
    title: "System Design & Architecture",
    icon: "Network",
    description: "High Availability, Load Balancing, Microservices Decoupling, Database Sharding, Caching Strategies, and Event-Driven Systems.",
    popularity: "Senior Level",
    questionsCount: 25,
    tags: ["Scalability", "Microservices", "Kafka", "Cassandra", "CDN"],
  },
  {
    id: "behavioral-hr",
    title: "HR & Behavioral Leadership",
    icon: "UserCheck",
    description: "STAR Method, Conflict Resolution, Engineering Leadership, Agile Delivery, and Cross-functional Stakeholder Management.",
    popularity: "Essential",
    questionsCount: 50,
    tags: ["STAR Method", "Leadership", "Agile", "Communication", "Conflict Mgmt"],
  },
];

export const DIFFICULTY_LEVELS = [
  { id: "BEGINNER", label: "Entry Level / Junior", exp: "0 - 2 Years", color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" },
  { id: "INTERMEDIATE", label: "Mid-Level Professional", exp: "2 - 5 Years", color: "text-indigo-400 border-indigo-500/30 bg-indigo-500/10" },
  { id: "ADVANCED", label: "Senior Engineer", exp: "5 - 8 Years", color: "text-purple-400 border-purple-500/30 bg-purple-500/10" },
  { id: "EXPERT", label: "Staff / Lead Architect", exp: "8+ Years", color: "text-pink-400 border-pink-500/30 bg-pink-500/10" },
];

export const INTERVIEW_TYPES = [
  { id: "TECHNICAL", label: "Technical Coding & Architecture", desc: "Core concepts, live coding, and algorithm implementation." },
  { id: "BEHAVIORAL", label: "Behavioral & STAR Method", desc: "Past experience, leadership, teamwork, and problem solving." },
  { id: "SYSTEM_DESIGN", label: "System Design & Scalability", desc: "Designing large-scale distributed systems and DB schemas." },
  { id: "HR", label: "HR & Culture Fit", desc: "Career goals, motivation, salary expectations, and soft skills." },
];

/**
 * Built-in Question Bank used for fallback or standalone simulation
 */
export const DEFAULT_QUESTIONS_BANK = {
  "java-fullstack": [
    {
      id: "q-java-1",
      orderNumber: 1,
      title: "Spring Boot Microservices & Resilience",
      question: "Explain how you implement the Circuit Breaker pattern in Spring Boot using Resilience4j. How do you handle fallbacks, thread pool isolation, and cascading failure prevention across distributed microservices?",
      topic: "Spring Boot & Microservices",
      difficulty: "INTERMEDIATE",
      hints: [
        "Mention CircuitBreaker, RateLimiter, and Bulkhead annotations from Resilience4j.",
        "Discuss OPEN, CLOSED, and HALF-OPEN states with sliding window metrics.",
        "Explain fallback method signatures (must match target method + Throwable param).",
      ],
      idealAnswer: "In Spring Boot 3 with Resilience4j, we configure @CircuitBreaker(name = 'paymentService', fallbackMethod = 'paymentFallback'). The circuit breaker transitions from CLOSED to OPEN when failure rate exceeds the threshold (e.g. 50% across 10 calls). In OPEN state, subsequent requests immediately invoke the fallback method without calling the downstream service, preventing thread exhaustion.",
      followUpQuestions: [
        "How do you configure sliding window type (COUNT_BASED vs TIME_BASED)?",
        "How does Bulkhead pattern isolate memory/threads between endpoints?",
      ],
    },
    {
      id: "q-java-2",
      orderNumber: 2,
      title: "Java Concurrency & Virtual Threads",
      question: "What are Java 21 Virtual Threads (Project Loom), and how do they differ from traditional Platform (OS) threads? How do they improve throughput in high-concurrency Spring Boot I/O-bound web applications?",
      topic: "Java 21 Concurrency",
      difficulty: "ADVANCED",
      hints: [
        "Contrast 1:1 OS kernel thread mapping with M:N lightweight carrier threads.",
        "Explain continuation and parking behavior on non-blocking I/O operations.",
        "Discuss why ThreadLocal usage should be reconsidered with Scoped Values.",
      ],
      idealAnswer: "Virtual Threads are lightweight user-mode threads managed by the JVM rather than OS kernel. A single carrier thread can multiplex millions of virtual threads. When a virtual thread performs blocking I/O (e.g., database query or HTTP call), the JVM unmounts it from the carrier thread until the I/O completes, drastically increasing throughput for I/O-bound microservices.",
      followUpQuestions: [
        "What is synchronized block pinning and how do you avoid it using ReentrantLock?",
        "How do you enable virtual threads in Spring Boot 3.2+ using application.properties?",
      ],
    },
    {
      id: "q-java-3",
      orderNumber: 3,
      title: "JPA Hibernate N+1 Query Problem & Solutions",
      question: "Describe the Hibernate N+1 select problem in Spring Data JPA. Compare solutions such as JOIN FETCH, @EntityGraph, and batch size configurations, and describe their performance tradeoffs.",
      topic: "JPA & Hibernate Optimization",
      difficulty: "INTERMEDIATE",
      hints: [
        "Explain when lazy loading triggers separate queries for each child relationship.",
        "Show difference between JPQL JOIN FETCH vs @EntityGraph attributePaths.",
        "Explain hibernate.default_batch_fetch_size for IN clause batching.",
      ],
      idealAnswer: "The N+1 problem occurs when fetching N parent entities triggers 1 initial query plus N additional queries to load lazily-loaded child associations. We solve this using JOIN FETCH in JPQL, @EntityGraph(attributePaths = {'children'}), or configuring default_batch_fetch_size: 25 to fetch child entities in batches.",
      followUpQuestions: [
        "Why can JOIN FETCH cause MultipleBagFetchException with multiple collections?",
        "How does DTO projection via constructor expression compare in query efficiency?",
      ],
    },
  ],
  "react-frontend": [
    {
      id: "q-react-1",
      orderNumber: 1,
      title: "React 19 & Render Optimization",
      question: "How does React 19 handle concurrent rendering, useTransition, and Actions? How do you prevent unnecessary re-renders in deeply nested component trees without excessive useMemo/useCallback?",
      topic: "React Architecture",
      difficulty: "ADVANCED",
      hints: [
        "Explain the React Compiler auto-memoization behavior.",
        "Discuss useTransition for non-blocking UI state updates.",
        "Contrast state lifting vs component composition with children props.",
      ],
      idealAnswer: "In React 19, the React Compiler automatically memoizes component outputs and hook dependencies, reducing manual useMemo/useCallback boilerplate. useTransition marks state updates as non-urgent transitions, keeping the main thread responsive during expensive renders.",
      followUpQuestions: [
        "How do Server Actions in React 19 simplify form mutations and optimistic updates?",
        "What is the difference between useDeferredValue and useTransition?",
      ],
    },
    {
      id: "q-react-2",
      orderNumber: 2,
      title: "Redux Toolkit & Global State Normalization",
      question: "Explain the benefits of normalized state structures using createEntityAdapter in Redux Toolkit. How do you design selectors using createSelector to prevent redundant UI component re-renders?",
      topic: "State Management",
      difficulty: "INTERMEDIATE",
      hints: [
        "Explain { ids: [], entities: {} } schema vs nested arrays.",
        "Discuss memoized input selectors and reference equality in createSelector.",
      ],
      idealAnswer: "Normalizing state with createEntityAdapter stores entities by ID ({ ids: [1, 2], entities: { 1: {...}, 2: {...} } }), enabling O(1) lookups and granular updates. createSelector memoizes derived data, returning identical references when inputs don't change.",
      followUpQuestions: [
        "How does RTK Query implement cache invalidation with providesTags and invalidatesTags?",
      ],
    },
    {
      id: "q-react-3",
      orderNumber: 3,
      title: "Web Performance & Core Web Vitals",
      question: "How do you optimize an enterprise React single-page application for Largest Contentful Paint (LCP) and Cumulative Layout Shift (CLS)? Discuss code splitting, image optimization, and bundle chunking strategies.",
      topic: "Web Vitals & Performance",
      difficulty: "ADVANCED",
      hints: [
        "Explain React.lazy dynamic imports with Suspense.",
        "Discuss font-display: swap and explicit aspect-ratio for CLS prevention.",
      ],
      idealAnswer: "To optimize LCP, preload critical hero assets, enable route-level code splitting via React.lazy/Suspense, and compress bundles via Brotli. For CLS, assign explicit width/height or CSS aspect-ratio to images and containers to prevent layout reflows.",
      followUpQuestions: [
        "How do you diagnose bundle size using rollup-plugin-visualizer?",
      ],
    },
  ],
  "python-backend": [
    {
      id: "q-py-1",
      orderNumber: 1,
      title: "FastAPI Async Architecture & Event Loop",
      question: "Explain how FastAPI leverages Python's asyncio event loop, Starlette, and Pydantic. What happens when you define an async def route handler versus a normal def handler with blocking I/O?",
      topic: "FastAPI & AsyncIO",
      difficulty: "INTERMEDIATE",
      hints: [
        "Explain that normal def handlers are run in an external thread pool.",
        "Explain that blocking I/O inside async def will stall the entire event loop.",
      ],
      idealAnswer: "FastAPI executes async def endpoints directly on the asyncio event loop, requiring non-blocking asynchronous libraries (asyncpg, httpx). If a standard def endpoint is used, FastAPI offloads it to a separate AnyIO worker thread pool to avoid blocking the main event loop.",
      followUpQuestions: [
        "How do you integrate Redis connection pools using aioredis in FastAPI lifespan context?",
      ],
    },
    {
      id: "q-py-2",
      orderNumber: 2,
      title: "Distributed Caching & Cache Invalidation",
      question: "How do you implement the Cache-Aside pattern with Redis in Python microservices? How do you prevent cache stampede (thundering herd) and manage TTL invalidation?",
      topic: "Distributed Systems & Redis",
      difficulty: "ADVANCED",
      hints: [
        "Explain probabilistic early expiration (XFetch) or mutex locks.",
        "Discuss write-through vs write-behind vs cache-aside.",
      ],
      idealAnswer: "In the Cache-Aside pattern, the application checks Redis first; on a cache miss, it queries PostgreSQL, populates Redis with an expiration TTL, and returns the result. To prevent cache stampedes, we use distributed Redis locks (Redlock) or add jitter to TTLs.",
      followUpQuestions: [
        "How do you handle atomic updates in Redis using Lua scripts?",
      ],
    },
  ],
  "ai-llm-engineer": [
    {
      id: "q-ai-1",
      orderNumber: 1,
      title: "Retrieval-Augmented Generation (RAG) Architecture",
      question: "Explain the end-to-end architecture of an enterprise RAG pipeline. How do you optimize document chunking, embedding models, vector similarity search, and reranking to reduce hallucinations?",
      topic: "RAG & Vector Search",
      difficulty: "ADVANCED",
      hints: [
        "Discuss chunk size vs chunk overlap (e.g. 512 tokens with 50 overlap).",
        "Explain cosine similarity, HNSW indexing in vector databases.",
        "Discuss cross-encoder re-ranking (e.g., Cohere/bge-reranker).",
      ],
      idealAnswer: "An enterprise RAG pipeline chunks source documents using semantic or recursive character splitting with overlap, converts chunks to vector embeddings, and indexes them in a vector database (Pinecone/Chroma) using HNSW. At query time, top-K nearest neighbors are retrieved, re-ranked via a cross-encoder, and injected into the LLM system prompt with strict citation constraints.",
      followUpQuestions: [
        "How do you prevent prompt injection when ingesting untrusted user context into RAG prompts?",
        "What are hybrid search techniques combining BM25 keyword matching and dense vector search?",
      ],
    },
  ],
  "system-design": [
    {
      id: "q-sd-1",
      orderNumber: 1,
      title: "Distributed Rate Limiter Design",
      question: "Design a high-throughput distributed rate limiter capable of handling 500,000 requests per second across multi-region clusters. Compare Sliding Window Log, Token Bucket, and Leaky Bucket algorithms.",
      topic: "Distributed Systems Design",
      difficulty: "EXPERT",
      hints: [
        "Explain Token Bucket using Redis with Lua scripts for atomic decrement.",
        "Discuss memory usage and clock synchronization across regions.",
      ],
      idealAnswer: "We implement the Token Bucket algorithm using Redis with a Lua script executing atomically. Each client has a key storing available tokens and last refill timestamp. For multi-region scale, we use a tiered rate limiter: local memory bucket on API gateways with async batch synchronization to Redis clusters.",
      followUpQuestions: [
        "How do you handle client identification (API Key, User ID, or IP hash)?",
      ],
    },
  ],
  "behavioral-hr": [
    {
      id: "q-beh-1",
      orderNumber: 1,
      title: "Technical Disagreement & Conflict Resolution",
      question: "Tell me about a time you had a significant architectural or technical disagreement with a senior engineer or product manager. How did you handle it using data and achieve consensus?",
      topic: "STAR Method & Leadership",
      difficulty: "INTERMEDIATE",
      hints: [
        "Structure answer using Situation, Task, Action, Result.",
        "Emphasize proof-of-concept benchmarks and objective data over opinion.",
      ],
      idealAnswer: "Using the STAR method: In my previous role (Situation), we had a dispute over migrating from monolithic REST to gRPC microservices (Task). Instead of arguing opinions, I built a quick prototype comparing latency benchmarks under 10k load (Action). The data showed a 45% latency drop, aligning the team and resulting in a smooth migration (Result).",
      followUpQuestions: [
        "How do you handle a situation where the final decision goes against your preference?",
      ],
    },
  ],
};
